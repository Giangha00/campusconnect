import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types/event";

// LocalStorage keys
const LS_USER_KEY = "campusconnect-user";
const LS_ACCOUNTS_KEY = "campusconnect-accounts";
const LS_USERNAME_KEY = "campusconnect-username";

// Account stored in localStorage for frontend-only auth
interface Account {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  bookmarkedEvents: number[];
  registeredEvents: number[];
}

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(LS_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(LS_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  bookmarkEvent: (eventId: number) => void;
  unbookmarkEvent: (eventId: number) => void;
  isEventBookmarked: (eventId: number) => boolean;
  // Auth API (frontend-only)
  login: (
    username: string,
    password: string
  ) => { ok: true } | { ok: false; message: string };
  register: (data: {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    department?: string;
  }) => { ok: true } | { ok: false; message: string };
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Load user and username from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(LS_USER_KEY);
    const savedUsername = localStorage.getItem(LS_USERNAME_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedUsername) {
      setCurrentUsername(savedUsername);
    }
  }, []);

  // Save user and username to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem(LS_USERNAME_KEY, currentUsername);
    } else {
      localStorage.removeItem(LS_USERNAME_KEY);
    }
  }, [currentUsername]);

  const persistBookmarksToAccount = (updated: User) => {
    if (!currentUsername) return;
    const accounts = loadAccounts();
    const idx = accounts.findIndex((a) => a.username === currentUsername);
    if (idx !== -1) {
      accounts[idx].bookmarkedEvents = updated.bookmarkedEvents;
      // also sync profile fields in case they changed
      accounts[idx].name = updated.name;
      accounts[idx].role = updated.role;
      accounts[idx].department = updated.department;
      saveAccounts(accounts);
    }
  };

  const bookmarkEvent = (eventId: number) => {
    if (!user) return;

    if (user.bookmarkedEvents.includes(eventId)) return; // no-op if already bookmarked

    const updatedUser: User = {
      ...user,
      bookmarkedEvents: [...user.bookmarkedEvents, eventId],
    };
    setUser(updatedUser);
    persistBookmarksToAccount(updatedUser);
  };

  const unbookmarkEvent = (eventId: number) => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      bookmarkedEvents: user.bookmarkedEvents.filter((id) => id !== eventId),
    };
    setUser(updatedUser);
    persistBookmarksToAccount(updatedUser);
  };

  const isEventBookmarked = (eventId: number): boolean => {
    if (!user) return false;
    return user.bookmarkedEvents.includes(eventId);
  };

  // Frontend-only login
  const login: UserContextType["login"] = (username, password) => {
    const accounts = loadAccounts();
    const account = accounts.find((a) => a.username === username);
    if (!account) {
      return { ok: false, message: "Account does not exist" };
    }
    if (account.password !== password) {
      return { ok: false, message: "Incorrect password" };
    }

    const loggedUser: User = {
      id: account.id,
      name: account.name,
      role: account.role,
      department: account.department,
      bookmarkedEvents: account.bookmarkedEvents || [],
      registeredEvents: account.registeredEvents || [],
    };
    setUser(loggedUser);
    setCurrentUsername(account.username);
    return { ok: true };
  };

  // Frontend-only register
  const register: UserContextType["register"] = ({
    username,
    password,
    name,
    role,
    department,
  }) => {
    const accounts = loadAccounts();
    const exists = accounts.some((a) => a.username === username);
    if (exists) {
      return { ok: false, message: "Username already exists" };
    }

    const id = generateId();
    const newAccount: Account = {
      id,
      username,
      password,
      name: name.trim(),
      role,
      department: department?.trim() || undefined,
      bookmarkedEvents: [],
      registeredEvents: [],
    };

    const next = [...accounts, newAccount];
    saveAccounts(next);

    const newUser: User = {
      id,
      name: newAccount.name,
      role: newAccount.role,
      department: newAccount.department,
      bookmarkedEvents: [],
      registeredEvents: [],
    };

    setUser(newUser);
    setCurrentUsername(username);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    setCurrentUsername(null);
  };

  const value: UserContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    bookmarkEvent,
    unbookmarkEvent,
    isEventBookmarked,
    login,
    register,
    logout,
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
