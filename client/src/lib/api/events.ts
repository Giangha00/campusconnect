import { apiClient } from "./api-client";
import type { Event, EventResponse } from "./types";

// Map Spring Boot event to frontend format
function mapEventToFrontend(
  event: EventResponse,
  attendees: number = 0,
  checkedIn: number = 0
): Event {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : startDate;

  // Get organizer name from response if available, otherwise use default
  let organizerName = "Admin"; // Default fallback
  if (event.organizer?.name) {
    organizerName = event.organizer.name;
  } else if (event.organizerId) {
    // If organizerId exists but no organizer object, keep default
    // The organizer name will be fetched separately if needed
    organizerName = "Admin";
  }

  return {
    id: event.id,
    name: event.title,
    dateStart: event.startDate,
    dateEnd: event.endDate || event.startDate,
    time: startDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    venue: event.venue || "TBA",
    category: event.category,
    department: "General", // Default value
    description: event.description || "",
    organizer: organizerName, // Use organizer name from response
    organizerId: event.organizerId || event.organizer?.id, // Store organizerId
    image: event.imageUrl || "",
    registrationRequired: event.registrationRequired ?? true,
    // Map capacity: if registrationRequired is false, capacity = "No limit"
    // Otherwise, use the capacity value from DB (or undefined if not set)
    capacity:
      event.registrationRequired === false
        ? "No limit"
        : event.capacity ?? undefined,
    attendees,
    checkedIn,
    registrationStart: event.registrationStart,
    registrationEnd: event.registrationEnd,
  };
}

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    try {
      const eventsResponse = await apiClient.get<EventResponse[]>("/events");
      const events = eventsResponse.data;

      // Try to get registrations, but don't fail if endpoint doesn't exist
      let registrations: any[] = [];
      try {
        const registrationsResponse = await apiClient.get<any[]>(
          "/event-registrations"
        );
        registrations = registrationsResponse.data || [];
      } catch (regError: any) {
        // If 404, endpoint doesn't exist yet - use empty array
        if (regError.response?.status !== 404) {
          console.warn("Error fetching registrations (non-404):", regError);
        }
      }

      // Calculate attendees and checkedIn for each event
      const eventStats = events.map((event) => {
        const eventRegistrations = registrations.filter(
          (reg) => reg.eventId === event.id
        );
        const attendees = eventRegistrations.length;
        const checkedIn = eventRegistrations.filter(
          (reg) => reg.checkedIn
        ).length;
        return { event, attendees, checkedIn };
      });

      return eventStats.map(({ event, attendees, checkedIn }) =>
        mapEventToFrontend(event, attendees, checkedIn)
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Event> => {
    try {
      const eventResponse = await apiClient.get<EventResponse>(`/events/${id}`);
      const event = eventResponse.data;

      // Try to get registrations, but don't fail if endpoint doesn't exist
      let registrations: any[] = [];
      try {
        const registrationsResponse = await apiClient.get<any[]>(
          `/event-registrations?eventId=${id}`
        );
        registrations = registrationsResponse.data || [];
      } catch (regError: any) {
        // If 404, endpoint doesn't exist yet - use empty array
        if (regError.response?.status !== 404) {
          console.warn("Error fetching registrations (non-404):", regError);
        }
      }

      const attendees = registrations.length;
      const checkedIn = registrations.filter((reg) => reg.checkedIn).length;

      return mapEventToFrontend(event, attendees, checkedIn);
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  create: async (event: Partial<EventResponse>): Promise<Event> => {
    try {
      const response = await apiClient.post<EventResponse>("/events", event);
      return mapEventToFrontend(response.data);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  update: async (id: number, event: Partial<EventResponse>): Promise<Event> => {
    try {
      // Update event
      await apiClient.put<EventResponse>(`/events/${id}`, event);

      // Fetch updated event to get complete data including organizer
      const updatedEventResponse = await apiClient.get<EventResponse>(
        `/events/${id}`
      );

      // Try to get registrations for attendees/checkedIn
      let registrations: any[] = [];
      try {
        const registrationsResponse = await apiClient.get<any[]>(
          `/event-registrations?eventId=${id}`
        );
        registrations = registrationsResponse.data || [];
      } catch (regError: any) {
        if (regError.response?.status !== 404) {
          console.warn("Error fetching registrations (non-404):", regError);
        }
      }

      const attendees = registrations.length;
      const checkedIn = registrations.filter((reg) => reg.checkedIn).length;

      return mapEventToFrontend(
        updatedEventResponse.data,
        attendees,
        checkedIn
      );
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
