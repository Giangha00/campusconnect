import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "./user-context";
import {
  sendRegistrationEmail,
  generateTicketNumber,
} from "@/lib/email-service";
import { useToast } from "@/hooks/use-toast";
import eventsData from "@/data/events.json";

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
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Load registrations from localStorage on mount
  useEffect(() => {
    const savedRegistrations = localStorage.getItem(
      "campusconnect-registrations"
    );
    if (savedRegistrations) {
      setRegistrations(JSON.parse(savedRegistrations));
    }
  }, []);

  // Save registrations to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "campusconnect-registrations",
      JSON.stringify(registrations)
    );
  }, [registrations]);

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

    // Generate ticket number
    const ticket = generateTicketNumber();

    const newRegistration: Registration = {
      eventId,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      registeredAt: new Date().toISOString(),
      ticket,
    };

    // Add registration to state
    setRegistrations((prev) => [...prev, newRegistration]);

    // Send confirmation email
    try {
      // Get event name from events data
      const event = eventsData.find((e) => e.id === eventId);
      const eventName = event ? event.name : `Event #${eventId}`;

      const emailResult = await sendRegistrationEmail({
        to: user.email,
        name: user.name,
        eventName,
        ticket,
      });

      if (emailResult.success) {
        toast({
          title: "Login Success!",
          description:
            "Email confirmation has been sent to your email address.",
        });
      } else {
        toast({
          title: "Register Success!",
          description:
            "However, we were unable to send the email confirmation. Please check your email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      toast({
        title: "Register Success!",
        description: "However, we were unable to send the email confirmation.",
        variant: "destructive",
      });
    }
  };

  const unregisterFromEvent = (eventId: number) => {
    if (!user) return;

    setRegistrations((prev) =>
      prev.filter((r) => !(r.eventId === eventId && r.userId === user.id))
    );
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

  const checkInUser = (eventId: number, userId: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.eventId === eventId && r.userId === userId
          ? {
              ...r,
              checkedIn: true,
              checkedInAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const checkOutUser = (eventId: number, userId: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.eventId === eventId && r.userId === userId
          ? {
              ...r,
              checkedIn: false,
              checkedInAt: undefined,
            }
          : r
      )
    );
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
