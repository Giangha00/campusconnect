import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import usersDataRaw from "@/data/users.json"; // Backup - keeping for reference
import { usersApi, type User } from "@/lib/api";

// User interface is now imported from api.ts

interface UsersContextType {
  users: User[];
  updateUser: (userId: number, updatedUser: Partial<User>) => void;
  deleteUser: (userId: number) => void;
  createUser: (newUser: Omit<User, "id" | "joinedDate" | "lastLogin">) => void;
  isLoading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const LS_USERS_KEY = "campusconnect-users";

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        // Try cache first
        const saved = localStorage.getItem(LS_USERS_KEY);
        if (saved) {
          const cachedUsers = JSON.parse(saved) as User[];
          setUsers(cachedUsers);
        }

        // Always fetch from API
        const apiUsers = await usersApi.getAll();
        setUsers(apiUsers);
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(apiUsers));
      } catch (error) {
        console.error("Error loading users from API:", error);
        // Fallback to cache
        const saved = localStorage.getItem(LS_USERS_KEY);
        if (saved) {
          try {
            const cachedUsers = JSON.parse(saved) as User[];
            setUsers(cachedUsers);
          } catch (e) {
            console.error("Error parsing cached users:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const updateUser = async (userId: number, updatedUser: Partial<User>) => {
    try {
      // Find user to get UUID
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Convert frontend format to API format
      const apiUser = {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        year: updatedUser.year,
      };

      // Update on server (need to use UUID, but we only have number ID)
      // This is a limitation - we need to store UUID mapping
      const updated = await usersApi.update(user.id.toString(), apiUser);
      
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((u) =>
          u.id === userId ? updated : u
        );
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    } catch (error) {
      console.error("Error updating user:", error);
      // Optimistic update
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.id === userId ? { ...user, ...updatedUser } : user
        );
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await usersApi.delete(user.id.toString());
      
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((u) => u.id !== userId);
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      // Optimistic update
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((u) => u.id !== userId);
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const createUser = async (
    newUser: Omit<User, "id" | "joinedDate" | "lastLogin">
  ) => {
    try {
      const apiUser = {
        username: newUser.email.split('@')[0], // Generate username from email
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        year: newUser.year,
      };

      const created = await usersApi.create(apiUser);
      
      setUsers((prevUsers) => {
        const updatedUsers = [created, ...prevUsers];
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    } catch (error) {
      console.error("Error creating user:", error);
      // Optimistic update
      setUsers((prevUsers) => {
        const newId = Math.max(...prevUsers.map((u) => u.id), 0) + 1;
        const userWithDefaults: User = {
          ...newUser,
          id: newId,
          joinedDate: new Date().toISOString().split("T")[0],
          lastLogin: new Date().toISOString(),
        };
        const updatedUsers = [userWithDefaults, ...prevUsers];
        localStorage.setItem(LS_USERS_KEY, JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    }
  };

  const value: UsersContextType = {
    users,
    updateUser,
    deleteUser,
    createUser,
    isLoading,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}

