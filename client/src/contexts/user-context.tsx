import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types/event";
import {
  userAuthApi,
  bookmarksApi,
  usersApi,
  type UserResponse,
} from "@/lib/api";
import apiClient from "@/lib/api";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  bookmarkEvent: (eventId: number) => Promise<void>;
  unbookmarkEvent: (eventId: number) => Promise<void>;
  isEventBookmarked: (eventId: number) => boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  register: (data: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
  }) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [bookmarkedEvents, setBookmarkedEvents] = useState<number[]>([]);
  const isInitialMount = useRef(true);
  const isSavingRef = useRef(false);

  // Load bookmarks from API (silently returns empty array if endpoint doesn't exist)
  // Always query with userId to get only current user's bookmarks
  // This ensures we get the correct data even when switching between machines
  const loadBookmarks = useCallback(async (userId: string) => {
    try {
      const bookmarks = await bookmarksApi.getAll(userId);
      setBookmarkedEvents(bookmarks);
    } catch (error) {
      // If error (not 404), log it but still set empty array
      console.error("Error loading bookmarks:", error);
      setBookmarkedEvents([]);
    }
  }, []);

  // Load user from sessionStorage on mount (only once)
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    try {
      const savedUser = sessionStorage.getItem("campusconnect-user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
        // Load bookmarks from API
        if (parsedUser.id) {
          loadBookmarks(parsedUser.id);
        }
      }
    } catch (error) {
      console.error("Error loading user from sessionStorage:", error);
      sessionStorage.removeItem("campusconnect-user");
    }
  }, [loadBookmarks]);

  // Save user to sessionStorage when it changes (prevent infinite loop)
  useEffect(() => {
    // Prevent saving during initial mount
    if (isInitialMount.current) return;

    // Prevent recursive saves
    if (isSavingRef.current) return;

    isSavingRef.current = true;

    try {
      if (user) {
        // Update user with current bookmarks before saving
        const userWithBookmarks = {
          ...user,
          bookmarkedEvents: bookmarkedEvents,
        };
        const userString = JSON.stringify(userWithBookmarks);
        const currentSaved = sessionStorage.getItem("campusconnect-user");

        // Only save if data actually changed to prevent unnecessary updates
        if (currentSaved !== userString) {
          sessionStorage.setItem("campusconnect-user", userString);
        }
      } else {
        sessionStorage.removeItem("campusconnect-user");
        if (bookmarkedEvents.length > 0) {
          setBookmarkedEvents([]);
        }
      }
    } catch (error) {
      console.error("Error saving user to sessionStorage:", error);
    } finally {
      // Reset flag in next tick
      requestAnimationFrame(() => {
        isSavingRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, bookmarkedEvents will be included in user object

  const bookmarkEvent = async (eventId: number) => {
    if (!user) return;

    // First, reload bookmarks from backend to ensure we have latest state
    try {
      const apiBookmarks = await bookmarksApi.getAll(user.id);
      setBookmarkedEvents(apiBookmarks);
      
      // Check if already bookmarked after reload
      if (apiBookmarks.includes(eventId)) {
        // Already bookmarked - silently return
        return;
      }
    } catch (error) {
      console.error("Error reloading bookmarks before bookmark:", error);
      // Continue with bookmark attempt even if reload fails
    }

    if (bookmarkedEvents.includes(eventId)) return; // no-op if already bookmarked

    try {
      // Try to create bookmark on server first
      await bookmarksApi.create(user.id, eventId);

      // Reload bookmarks from backend to ensure state is in sync
      try {
        const apiBookmarks = await bookmarksApi.getAll(user.id);
        setBookmarkedEvents(apiBookmarks);
        const updatedUser = {
          ...user,
          bookmarkedEvents: apiBookmarks,
        };
        setUser(updatedUser);
      } catch (reloadError) {
        console.error("Error reloading bookmarks after bookmark:", reloadError);
        // Fallback to optimistic update
        const updatedBookmarks = [...bookmarkedEvents, eventId];
        setBookmarkedEvents(updatedBookmarks);
        const updatedUser = {
          ...user,
          bookmarkedEvents: updatedBookmarks,
        };
        setUser(updatedUser);
      }
    } catch (error: any) {
      // Handle 409 Conflict - bookmark already exists
      if (error.response?.status === 409) {
        // Reload bookmarks from backend to sync state silently
        try {
          const apiBookmarks = await bookmarksApi.getAll(user.id);
          setBookmarkedEvents(apiBookmarks);
          const updatedUser = {
            ...user,
            bookmarkedEvents: apiBookmarks,
          };
          setUser(updatedUser);
        } catch (reloadError) {
          console.error("Error reloading bookmarks:", reloadError);
        }
        return; // Exit silently
      }
      
      // Log error but don't update UI if API fails
      if (error.response?.status === 404) {
        console.warn(
          "Bookmark endpoint not found (404). Bookmark not saved to server."
        );
        // Still update UI for better UX, but warn user it's not persisted
        const updatedBookmarks = [...bookmarkedEvents, eventId];
        setBookmarkedEvents(updatedBookmarks);
        const updatedUser = {
          ...user,
          bookmarkedEvents: updatedBookmarks,
        };
        setUser(updatedUser);
      } else {
        console.error("Error bookmarking event:", error);
        // Don't update UI if there's a real error (not 404)
        // User will see the bookmark didn't work
      }
    }
  };

  const unbookmarkEvent = async (eventId: number) => {
    if (!user) return;

    try {
      // Try to delete bookmark on server first
      await bookmarksApi.delete(user.id, eventId);

      // Reload bookmarks from backend to ensure state is in sync
      try {
        const apiBookmarks = await bookmarksApi.getAll(user.id);
        setBookmarkedEvents(apiBookmarks);
        const updatedUser = {
          ...user,
          bookmarkedEvents: apiBookmarks,
        };
        setUser(updatedUser);
      } catch (reloadError) {
        console.error("Error reloading bookmarks after unbookmark:", reloadError);
        // Fallback to optimistic update
        const updatedBookmarks = bookmarkedEvents.filter((id) => id !== eventId);
        setBookmarkedEvents(updatedBookmarks);
        const updatedUser = {
          ...user,
          bookmarkedEvents: updatedBookmarks,
        };
        setUser(updatedUser);
      }
    } catch (error: any) {
      // Check if bookmark was actually deleted (might have been deleted already)
      try {
        const apiBookmarks = await bookmarksApi.getAll(user.id);
        const stillExists = apiBookmarks.includes(eventId);
        if (!stillExists) {
          // Bookmark was deleted, sync state
          setBookmarkedEvents(apiBookmarks);
          const updatedUser = {
            ...user,
            bookmarkedEvents: apiBookmarks,
          };
          setUser(updatedUser);
        } else {
          // Bookmark still exists, log error
          console.error("Error unbookmarking event:", error);
        }
      } catch (reloadError) {
        console.error("Error checking bookmark status:", reloadError);
        // Optimistic update as last resort
        const updatedBookmarks = bookmarkedEvents.filter((id) => id !== eventId);
        setBookmarkedEvents(updatedBookmarks);
        const updatedUser = {
          ...user,
          bookmarkedEvents: updatedBookmarks,
        };
        setUser(updatedUser);
      }
    }
  };

  const isEventBookmarked = (eventId: number): boolean => {
    return bookmarkedEvents.includes(eventId);
  };

  // Login using API - check user from /api/users
  const login: UserContextType["login"] = async (username, password) => {
    try {
      // Validate input
      if (!username || !username.trim()) {
        return { ok: false, message: "Username is required" };
      }
      if (!password || !password.trim()) {
        return { ok: false, message: "Password is required" };
      }

      const userResponse = await userAuthApi.login(username.trim(), password);

      if (userResponse) {
        // Map API user to frontend User format
        const loggedUser: User = {
          id: userResponse.id,
          name: userResponse.name,
          email: userResponse.email,
          role: userResponse.role as UserRole,
          department: userResponse.department,
          bookmarkedEvents: [], // Will be loaded from API
          registeredEvents: [], // Will be loaded from registrations API
        };

        setUser(loggedUser);
        // Load bookmarks
        await loadBookmarks(loggedUser.id);

        return { ok: true };
      }

      // User not found in API
      return { ok: false, message: "Invalid username or password" };
    } catch (error: any) {
      console.error("Error during login:", error);

      // Provide more specific error messages
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        return {
          ok: false,
          message: "Cannot connect to server. Please check your connection.",
        };
      }

      if (error.response?.status === 404) {
        return { ok: false, message: "User not found" };
      }

      return { ok: false, message: "Error connecting to server" };
    }
  };

  // Register using API
  const register: UserContextType["register"] = async ({
    username,
    password,
    name,
    email,
    role,
    department,
  }) => {
    try {
      const userResponse = await userAuthApi.register({
        username,
        password,
        name,
        email,
        role,
        department,
      });

      // Map API user to frontend User format
      const newUser: User = {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.role as UserRole,
        department: userResponse.department,
        bookmarkedEvents: [],
        registeredEvents: [],
      };

      // Auto-login after successful registration
      setUser(newUser);
      // Load bookmarks (will return empty array if endpoint doesn't exist)
      await loadBookmarks(newUser.id);

      return { ok: true };
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Don't try to auto-login if it's a conflict error (409) - username/email already exists
      if (error.response?.status === 409) {
        // Extract error message for duplicate username/email
        let errorMessage = "Username hoặc email đã tồn tại";
        if (error.response?.data) {
          const errorData = error.response.data;
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
        return { ok: false, message: errorMessage };
      }

      // SECURITY FIX: Never auto-login on 500 error - this is a serious security vulnerability
      // If registration fails with 500, it means there was an error, not a success
      // We should NOT check if user exists and auto-login - this allows unauthorized access
      // The old logic was dangerous: if someone tried to register with existing credentials,
      // the 500 error would trigger auto-login, giving them access to someone else's account!

      // Extract error message
      let errorMessage = "Registration failed";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Provide more specific error messages
      if (error.response?.status === 400) {
        errorMessage =
          errorMessage || "Invalid registration data. Please check all fields.";
      } else if (error.response?.status === 409) {
        errorMessage =
          errorMessage ||
          "Username or email already exists. Please try a different one.";
      } else if (error.response?.status === 500) {
        errorMessage = errorMessage || "Server error. Please try again later.";
      }

      return { ok: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setBookmarkedEvents([]);
    sessionStorage.removeItem("campusconnect-user");
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
