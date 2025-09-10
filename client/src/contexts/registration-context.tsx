import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useUser } from "./user-context";

interface Registration {
  eventId: number;
  userId: string;
  name: string;
  role: string;
  department?: string;
  registeredAt: string;
}

interface RegistrationContextType {
  getRegistrationsByEvent: (eventId: number) => Registration[];
  getRegistrationCount: (eventId: number) => number;
  registerForEvent: (eventId: number) => void;
  unregisterFromEvent: (eventId: number) => void;
  isEventRegistered: (eventId: number) => boolean;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

interface RegistrationProviderProps {
  children: ReactNode;
}

export function RegistrationProvider({ children }: RegistrationProviderProps) {
  const { user } = useUser();
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

  const registerForEvent = (eventId: number) => {
    if (!user) return;

    // Check if already registered
    const existingRegistration = registrations.find(
      (r) => r.eventId === eventId && r.userId === user.id
    );

    if (existingRegistration) return;

    const newRegistration: Registration = {
      eventId,
      userId: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      registeredAt: new Date().toISOString(),
    };

    setRegistrations((prev) => [...prev, newRegistration]);
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

  const value: RegistrationContextType = {
    getRegistrationsByEvent,
    getRegistrationCount,
    registerForEvent,
    unregisterFromEvent,
    isEventRegistered,
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
