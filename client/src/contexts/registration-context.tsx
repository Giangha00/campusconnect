import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "./user-context";
import { sendRegistrationEmail } from "@/lib/email-service";
import { useToast } from "@/hooks/use-toast";
import { canRegisterForEvent } from "@/lib/event-status";
// import eventsData from "@/data/events.json"; // Backup - keeping for reference
import { useEvents } from "./events-context";
import { registrationsApi } from "@/lib/api";
import apiClient from "@/lib/api";

interface Registration {
  eventId: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  registeredAt: string;
  ticket?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

interface RegistrationContextType {
  getRegistrationsByEvent: (eventId: number) => Registration[];
  getRegistrationCount: (eventId: number) => number;
  getCheckInCount: (eventId: number) => number;
  registerForEvent: (eventId: number) => Promise<void>;
  unregisterFromEvent: (eventId: number) => void;
  isEventRegistered: (eventId: number) => boolean;
  checkInUser: (eventId: number, userId: string) => void;
  checkOutUser: (eventId: number, userId: string) => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

interface RegistrationProviderProps {
  children: ReactNode;
}

export function RegistrationProvider({ children }: RegistrationProviderProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const { events } = useEvents();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load registrations from API
  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setIsLoading(true);
        // Always fetch from API
        const apiRegistrations = await registrationsApi.getAll();
        setRegistrations(apiRegistrations);
      } catch (error) {
        console.error("Error loading registrations from API:", error);
        // Set empty array on error
        setRegistrations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  const getRegistrationsByEvent = (eventId: number): Registration[] => {
    return registrations.filter((r) => r.eventId === eventId);
  };

  const getRegistrationCount = (eventId: number): number => {
    return registrations.filter((r) => r.eventId === eventId).length;
  };

  const registerForEvent = async (eventId: number) => {
    if (!user) return;

    // Check if already registered
    const existingRegistration = registrations.find(
      (r) => r.eventId === eventId && r.userId === user.id
    );

    if (existingRegistration) return;

    // Check if registration is allowed based on event dates
    const event = events.find((e) => e.id === eventId);
    if (event && !canRegisterForEvent(event as any)) {
      toast({
        title: "Registration Closed",
        description:
          "Registration is only available 5-30 days before the event",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create registration on server
      // Backend will automatically generate ticketNumber
      const apiRegistration = {
        userId: user.id,
        eventId,
      };

      const created = await registrationsApi.create(apiRegistration);

      // Add registration to state
      setRegistrations((prev) => {
        const updated = [...prev, created];
        return updated;
      });

      // Send confirmation email using ticketNumber from response
      const eventName = event ? event.name : `Event #${eventId}`;
      const ticket = created.ticket || "N/A"; // Use ticket from response
      const emailResult = await sendRegistrationEmail({
        to: user.email,
        name: user.name,
        eventName,
        ticket,
      });

      if (emailResult.success) {
        toast({
          title: "Registration Success!",
          description:
            "Email confirmation has been sent to your email address.",
        });
      } else {
        toast({
          title: "Registration Success!",
          description:
            "However, we were unable to send the email confirmation. Please check your email address.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating registration:", error);

      // Provide more specific error messages
      let errorMessage = "Unable to register for this event. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Check if it's a validation error
      if (error.response?.status === 400) {
        errorMessage =
          errorMessage ||
          "Invalid registration data. Please check your information.";
      } else if (error.response?.status === 409) {
        errorMessage =
          errorMessage || "You are already registered for this event.";
      } else if (error.response?.status === 500) {
        errorMessage = errorMessage || "Server error. Please try again later.";
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const unregisterFromEvent = async (eventId: number) => {
    if (!user) return;

    try {
      // Delete on server using userId and eventId
      await registrationsApi.delete(user.id, eventId);

      // Remove from state
      setRegistrations((prev) => {
        const updated = prev.filter(
          (r) => !(r.eventId === eventId && r.userId === user.id)
        );
        return updated;
      });
    } catch (error) {
      console.error("Error unregistering from event:", error);
      // Optimistic update
      setRegistrations((prev) => {
        const updated = prev.filter(
          (r) => !(r.eventId === eventId && r.userId === user.id)
        );
        return updated;
      });
    }
  };

  const isEventRegistered = (eventId: number): boolean => {
    if (!user) return false;
    return registrations.some(
      (r) => r.eventId === eventId && r.userId === user.id
    );
  };

  const getCheckInCount = (eventId: number): number => {
    return registrations.filter(
      (r) => r.eventId === eventId && r.checkedIn === true
    ).length;
  };

  const checkInUser = async (eventId: number, userId: string) => {
    try {
      const registration = registrations.find(
        (r) => r.eventId === eventId && r.userId === userId
      );

      if (!registration) {
        console.warn("Registration not found for check-in");
        return;
      }

      // Get all registrations from API to find the registration ID
      const allRegsResponse = await registrationsApi.getAll();
      const reg = allRegsResponse.find(
        (r) => r.eventId === eventId && r.userId === userId
      );

      if (!reg) {
        console.warn("Registration not found in API for check-in");
        return;
      }

      // Find registration ID from mapping stored in sessionStorage
      // We need to get all registrations from API and match by userId+eventId
      const mappingKey = "campusconnect-registration-mapping";
      const stored = sessionStorage.getItem(mappingKey);
      if (stored) {
        const mapping: Array<{
          registrationId: string;
          userId: string;
          eventId: number;
        }> = JSON.parse(stored);
        const mapped = mapping.find(
          (m) => m.userId === userId && m.eventId === eventId
        );

        if (mapped) {
          // Call checkIn API with registration ID
          await registrationsApi.checkIn(mapped.registrationId);

          // Update state
          setRegistrations((prev) => {
            const updated = prev.map((r) =>
              r.eventId === eventId && r.userId === userId
                ? {
                    ...r,
                    checkedIn: true,
                    checkedInAt: new Date().toISOString(),
                  }
                : r
            );
            return updated;
          });
          return;
        }
      }

      // If mapping not found, do optimistic update
      console.warn(
        "Registration ID not found in mapping, doing optimistic update"
      );
      setRegistrations((prev) => {
        const updated = prev.map((r) =>
          r.eventId === eventId && r.userId === userId
            ? {
                ...r,
                checkedIn: true,
                checkedInAt: new Date().toISOString(),
              }
            : r
        );
        return updated;
      });
    } catch (error) {
      console.error("Error checking in user:", error);
      // Optimistic update
      setRegistrations((prev) => {
        const updated = prev.map((r) =>
          r.eventId === eventId && r.userId === userId
            ? {
                ...r,
                checkedIn: true,
                checkedInAt: new Date().toISOString(),
              }
            : r
        );
        return updated;
      });
    }
  };

  const checkOutUser = async (eventId: number, userId: string) => {
    // Backend doesn't have check-out endpoint, only check-in
    // So we just update locally
    setRegistrations((prev) => {
      const updated = prev.map((r) =>
        r.eventId === eventId && r.userId === userId
          ? {
              ...r,
              checkedIn: false,
              checkedInAt: undefined,
            }
          : r
      );
      return updated;
    });
  };

  const value: RegistrationContextType = {
    getRegistrationsByEvent,
    getRegistrationCount,
    getCheckInCount,
    registerForEvent,
    unregisterFromEvent,
    isEventRegistered,
    checkInUser,
    checkOutUser,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error(
      "useRegistration must be used within a RegistrationProvider"
    );
  }
  return context;
}
