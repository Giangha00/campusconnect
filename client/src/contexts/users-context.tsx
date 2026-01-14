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
  updateUser: (userId: string, updatedUser: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  createUser: (newUser: Omit<User, "id" | "joinedDate" | "lastLogin">) => void;
  isLoading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        // Always fetch from API
        const apiUsers = await usersApi.getAll();
        setUsers(apiUsers);
      } catch (error) {
        console.error("Error loading users from API:", error);
        // Set empty array on error
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const updateUser = async (userId: string, updatedUser: Partial<User>) => {
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

      // Update on server using UUID
      const updated = await usersApi.update(user.id, apiUser);
      
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((u) =>
          u.id === userId ? updated : u
        );
        return updatedUsers;
      });
    } catch (error) {
      console.error("Error updating user:", error);
      // Optimistic update
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user.id === userId ? { ...user, ...updatedUser } : user
        );
        return updatedUsers;
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await usersApi.delete(user.id);
      
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((u) => u.id !== userId);
        return updatedUsers;
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      // Optimistic update
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.filter((u) => u.id !== userId);
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

