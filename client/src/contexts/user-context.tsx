import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types/event";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  bookmarkEvent: (eventId: number) => void;
  unbookmarkEvent: (eventId: number) => void;
  isEventBookmarked: (eventId: number) => boolean;
  registerForEvent: (eventId: number) => void;
  unregisterFromEvent: (eventId: number) => void;
  isEventRegistered: (eventId: number) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("campusconnect-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("campusconnect-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("campusconnect-user");
    }
  }, [user]);

  const bookmarkEvent = (eventId: number) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      bookmarkedEvents: [...user.bookmarkedEvents, eventId],
    };
    setUser(updatedUser);
  };

  const unbookmarkEvent = (eventId: number) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      bookmarkedEvents: user.bookmarkedEvents.filter((id) => id !== eventId),
    };
    setUser(updatedUser);
  };

  const isEventBookmarked = (eventId: number): boolean => {
    if (!user) return false;
    return user.bookmarkedEvents.includes(eventId);
  };

  const registerForEvent = (eventId: number) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      registeredEvents: [...user.registeredEvents, eventId],
    };
    setUser(updatedUser);
  };

  const unregisterFromEvent = (eventId: number) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      registeredEvents: user.registeredEvents.filter((id) => id !== eventId),
    };
    setUser(updatedUser);
  };

  const isEventRegistered = (eventId: number): boolean => {
    if (!user) return false;
    return user.registeredEvents.includes(eventId);
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    bookmarkEvent,
    unbookmarkEvent,
    isEventBookmarked,
    registerForEvent,
    unregisterFromEvent,
    isEventRegistered,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
