import { apiClient } from "./api-client";
import type {
  EventRegistrationResponse,
  Registration,
  UserResponse,
} from "./types";

// Internal mapping to track userId and eventId for each registration ID
const REGISTRATION_MAPPING_KEY = "campusconnect-registration-mapping";

interface RegistrationMapping {
  registrationId: string;
  userId: string;
  eventId: number;
}

function getRegistrationMapping(): Map<
  string,
  { userId: string; eventId: number }
> {
  try {
    const stored = sessionStorage.getItem(REGISTRATION_MAPPING_KEY);
    if (stored) {
      const data: RegistrationMapping[] = JSON.parse(stored);
      return new Map(
        data.map((m) => [
          m.registrationId,
          { userId: m.userId, eventId: m.eventId },
        ])
      );
    }
  } catch (e) {
    console.error("Error loading registration mapping:", e);
  }
  return new Map();
}

function saveRegistrationMapping(
  map: Map<string, { userId: string; eventId: number }>
) {
  try {
    const data: RegistrationMapping[] = Array.from(map.entries()).map(
      ([id, info]) => ({
        registrationId: id,
        userId: info.userId,
        eventId: info.eventId,
      })
    );
    sessionStorage.setItem(REGISTRATION_MAPPING_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving registration mapping:", e);
  }
}

export const registrationsApi = {
  getAll: async (userId?: string): Promise<Registration[]> => {
    try {
      // Query with userId if provided to get only user's registrations
      const url = userId
        ? `/event-registrations?userId=${encodeURIComponent(userId)}`
        : "/event-registrations";

      const response = await apiClient.get<EventRegistrationResponse[]>(url);

      // Backend now returns userId and eventId in response
      const registrations: Registration[] = [];

      for (const reg of response.data) {
        // Skip if userId or eventId is missing (shouldn't happen with new DTO)
        if (!reg.userId || !reg.eventId) {
          console.warn("Registration missing userId or eventId:", reg);
          continue;
        }

        try {
          const userResponse = await apiClient.get<UserResponse>(
            `/users/${reg.userId}`
          );
          const user = userResponse.data;
          registrations.push({
            eventId: reg.eventId,
            userId: reg.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            registeredAt: reg.registrationDate,
            ticket: reg.ticketNumber,
            checkedIn: reg.checkedIn,
            checkedInAt: reg.checkedInAt,
          });
        } catch (error) {
          console.error("Error fetching user for registration:", error);
          registrations.push({
            eventId: reg.eventId,
            userId: reg.userId,
            name: "Unknown",
            email: "",
            role: "visitor",
            registeredAt: reg.registrationDate,
            ticket: reg.ticketNumber,
            checkedIn: reg.checkedIn,
            checkedInAt: reg.checkedInAt,
          });
        }
      }

      return registrations;
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn(
          "Event registrations endpoint not found, returning empty array"
        );
        return [];
      }
      console.error("Error fetching registrations:", error);
      throw error;
    }
  },

  getByEventId: async (eventId: number): Promise<Registration[]> => {
    try {
      // Backend doesn't have query param for eventId, so get all and filter
      const allRegistrations = await registrationsApi.getAll();
      return allRegistrations.filter((r) => r.eventId === eventId);
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn(
          "Event registrations endpoint not found, returning empty array"
        );
        return [];
      }
      console.error("Error fetching registrations by event:", error);
      throw error;
    }
  },

  create: async (registration: {
    userId: string;
    eventId: number;
  }): Promise<Registration> => {
    try {
      // Backend expects userId and eventId (camelCase) in request body
      // Backend will automatically generate ticketNumber
      const requestBody = {
        userId: String(registration.userId),
        eventId: Number(registration.eventId),
      };

      const response = await apiClient.post<EventRegistrationResponse>(
        "/event-registrations",
        requestBody
      );

      // Backend now returns userId and eventId in response, no need for mapping
      // But we still keep mapping for backward compatibility with existing code
      const mapping = getRegistrationMapping();
      if (response.data.userId && response.data.eventId) {
        mapping.set(response.data.id, {
          userId: response.data.userId,
          eventId: response.data.eventId,
        });
        saveRegistrationMapping(mapping);
      }

      // Fetch user details
      const userId = response.data.userId || registration.userId;
      const userResponse = await apiClient.get<UserResponse>(
        `/users/${userId}`
      );
      const user = userResponse.data;

      return {
        eventId: response.data.eventId || registration.eventId,
        userId: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        registeredAt: response.data.registrationDate,
        ticket: response.data.ticketNumber,
        checkedIn: response.data.checkedIn,
        checkedInAt: response.data.checkedInAt,
      };
    } catch (error: any) {
      // Log detailed error information
      if (error.response) {
        console.error("Error creating registration:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
        });
      } else {
        console.error("Error creating registration:", error.message || error);
      }

      // If 500 error, check if registration was actually created
      if (error.response?.status === 500) {
        try {
          // Wait a bit for database to commit
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Try to find the registration by getting all and checking mapping
          const allRegs = await apiClient.get<EventRegistrationResponse[]>(
            "/event-registrations"
          );
          const mapping = getRegistrationMapping();

          // Check if any registration matches (by checking mapping)
          for (const reg of allRegs.data) {
            const mapped = mapping.get(reg.id);
            if (
              mapped &&
              mapped.userId === registration.userId &&
              mapped.eventId === registration.eventId
            ) {
              // Registration was created successfully
              const userResponse = await apiClient.get<UserResponse>(
                `/users/${registration.userId}`
              );
              const user = userResponse.data;
              return {
                eventId: registration.eventId,
                userId: registration.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                registeredAt: reg.registrationDate,
                ticket: reg.ticketNumber,
                checkedIn: reg.checkedIn,
                checkedInAt: reg.checkedInAt,
              };
            }
          }
        } catch (checkError) {
          console.error(
            "Error checking if registration was created:",
            checkError
          );
        }
      }

      throw error;
    }
  },

  checkIn: async (registrationId: string): Promise<Registration> => {
    try {
      // Backend has PUT /event-registrations/{id}/checkin endpoint
      const response = await apiClient.put<EventRegistrationResponse>(
        `/event-registrations/${registrationId}/checkin`
      );

      // Get mapping to find userId and eventId
      const mapping = getRegistrationMapping();
      const mapped = mapping.get(registrationId);

      if (!mapped) {
        throw new Error("Registration mapping not found");
      }

      // Fetch user details
      const userResponse = await apiClient.get<UserResponse>(
        `/users/${mapped.userId}`
      );
      const user = userResponse.data;

      return {
        eventId: mapped.eventId,
        userId: mapped.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        registeredAt: response.data.registrationDate,
        ticket: response.data.ticketNumber,
        checkedIn: response.data.checkedIn,
        checkedInAt: response.data.checkedInAt,
      };
    } catch (error) {
      console.error("Error checking in registration:", error);
      throw error;
    }
  },

  delete: async (userId: string, eventId: number): Promise<void> => {
    try {
      // Use new endpoint that accepts userId and eventId directly
      // This is more reliable than using sessionStorage mapping
      await apiClient.delete(
        `/event-registrations?userId=${encodeURIComponent(
          userId
        )}&eventId=${eventId}`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Registration doesn't exist, that's fine
        return;
      }
      console.error("Error deleting registration:", error);
      throw error;
    }
  },
};
