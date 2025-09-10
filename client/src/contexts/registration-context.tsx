import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUser } from "@/contexts/user-context";

export interface Registration {
  eventId: number;
  userId: string;
  name: string;
  role: "student" | "faculty" | "visitor";
  department?: string;
  registeredAt: string; // ISO date
}

const LS_REGISTRATIONS_KEY = "campusconnect-registrations";

function loadAll(): Record<number, Registration[]> {
  try {
    const raw = localStorage.getItem(LS_REGISTRATIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<number, Registration[]>) : {};
  } catch {
    return {};
  }
}

function saveAll(map: Record<number, Registration[]>) {
  localStorage.setItem(LS_REGISTRATIONS_KEY, JSON.stringify(map));
}

interface RegistrationContextType {
  getRegistrationsByEvent: (eventId: number) => Registration[];
  getRegistrationCount: (eventId: number) => number;
  isUserRegistered: (eventId: number, userId?: string) => boolean;
  registerForEvent: (
    eventId: number
  ) => { ok: true } | { ok: false; message: string };
  unregisterFromEvent: (eventId: number) => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [map, setMap] = useState<Record<number, Registration[]>>({});

  useEffect(() => {
    setMap(loadAll());
  }, []);

  useEffect(() => {
    saveAll(map);
  }, [map]);

  const getRegistrationsByEvent = (eventId: number) => map[eventId] || [];

  const getRegistrationCount = (eventId: number) =>
    getRegistrationsByEvent(eventId).length;

  const isUserRegistered = (eventId: number, userId?: string) => {
    if (!userId) return false;
    return getRegistrationsByEvent(eventId).some((r) => r.userId === userId);
  };

  const registerForEvent: RegistrationContextType["registerForEvent"] = (
    eventId
  ) => {
    if (!user)
      return { ok: false, message: "You must be logged in to register" };

    const current = getRegistrationsByEvent(eventId);
    if (current.some((r) => r.userId === user.id)) {
      return {
        ok: false,
        message: "You are already registered for this event",
      };
    }

    const reg: Registration = {
      eventId,
      userId: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      registeredAt: new Date().toISOString(),
    };

    setMap((prev) => ({ ...prev, [eventId]: [...current, reg] }));
    return { ok: true };
  };

  const unregisterFromEvent = (eventId: number) => {
    if (!user) return;
    const current = getRegistrationsByEvent(eventId);
    setMap((prev) => ({
      ...prev,
      [eventId]: current.filter((r) => r.userId !== user.id),
    }));
  };

  const value = useMemo(
    () => ({
      getRegistrationsByEvent,
      getRegistrationCount,
      isUserRegistered,
      registerForEvent,
      unregisterFromEvent,
    }),
    [map, user]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx)
    throw new Error("useRegistration must be used within RegistrationProvider");
  return ctx;
}
