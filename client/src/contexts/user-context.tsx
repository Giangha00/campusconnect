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

    if (bookmarkedEvents.includes(eventId)) return; // no-op if already bookmarked

    // Optimistic update first
    const updatedBookmarks = [...bookmarkedEvents, eventId];
    setBookmarkedEvents(updatedBookmarks);
    // Update user in one call to avoid multiple re-renders
    const updatedUser = {
      ...user,
      bookmarkedEvents: updatedBookmarks,
    };
    setUser(updatedUser);

    try {
      // Try to create bookmark on server (if endpoint exists)
      await bookmarksApi.create(user.id, eventId);
    } catch (error: any) {
      // If 404, endpoint doesn't exist - that's fine, we keep the optimistic update
      if (error.response?.status !== 404) {
        console.error("Error bookmarking event:", error);
      }
      // Keep the optimistic update even if API call fails
    }
  };

  const unbookmarkEvent = async (eventId: number) => {
    if (!user) return;

    // Optimistic update first
    const updatedBookmarks = bookmarkedEvents.filter((id) => id !== eventId);
    setBookmarkedEvents(updatedBookmarks);
    // Update user in one call to avoid multiple re-renders
    const updatedUser = {
      ...user,
      bookmarkedEvents: updatedBookmarks,
    };
    setUser(updatedUser);

    try {
      // Try to delete bookmark on server (if endpoint exists)
      await bookmarksApi.delete(user.id, eventId);
    } catch (error: any) {
      // If 404, endpoint doesn't exist - that's fine, we keep the optimistic update
      if (error.response?.status !== 404) {
        console.error("Error unbookmarking event:", error);
      }
      // Keep the optimistic update even if API call fails
    }
  };

  const isEventBookmarked = (eventId: number): boolean => {
    return bookmarkedEvents.includes(eventId);
  };

  // Login using API
  const login: UserContextType["login"] = async (username, password) => {
    try {
      const userResponse = await userAuthApi.login(username, password);

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

      return { ok: false, message: "Invalid username or password" };
    } catch (error) {
      console.error("Error during login:", error);
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

      // Check if user was actually created despite the error (500 error but user exists)
      if (error.response?.status === 500) {
        try {
          // Wait a bit for database to commit (if user was just created)
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Try to get user by email from API directly
          const allUsers = await apiClient.get<UserResponse[]>("/users");
          const actualUser = allUsers.data.find(
            (u: UserResponse) =>
              u.email.toLowerCase() === email.toLowerCase().trim() ||
              u.username.toLowerCase() === username.toLowerCase().trim()
          );

          if (actualUser) {
            // User was created successfully despite 500 error, auto-login
            const newUser: User = {
              id: actualUser.id, // Use UUID string from API
              name: actualUser.name,
              email: actualUser.email,
              role: actualUser.role as UserRole,
              department: actualUser.department,
              bookmarkedEvents: [],
              registeredEvents: [],
            };

            setUser(newUser);
            await loadBookmarks(newUser.id);

            // Return success - user was created
            return { ok: true };
          }
        } catch (checkError) {
          console.error("Error checking if user was created:", checkError);
          // Continue to show error message below
        }
      }

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
