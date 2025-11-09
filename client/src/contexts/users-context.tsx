import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import usersDataRaw from "@/data/users.json";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "faculty" | "student" | "visitor";
  department: string;
  designation: string;
  phone: string;
  specialization: string;
  avatar: string;
  status: "active" | "inactive";
  joinedDate: string;
  lastLogin: string;
  year?: string;
}

interface UsersContextType {
  users: User[];
  updateUser: (userId: number, updatedUser: Partial<User>) => void;
  deleteUser: (userId: number) => void;
  createUser: (newUser: Omit<User, "id" | "joinedDate" | "lastLogin">) => void;
  isLoading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const LS_USERS_KEY = "campusconnect-users";

function loadUsers(): User[] {
  try {
    const saved = localStorage.getItem(LS_USERS_KEY);
    if (saved) {
      return JSON.parse(saved) as User[];
    }
    // If no saved data, use initial data from JSON file
    return usersDataRaw.users as User[];
  } catch {
    return usersDataRaw.users as User[];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize users data from localStorage if available
  useEffect(() => {
    const loadedUsers = loadUsers();
    setUsers(loadedUsers);
    setIsLoading(false);
  }, []);

  // Save users to localStorage when they change
  useEffect(() => {
    if (users.length > 0) {
      saveUsers(users);
    }
  }, [users]);

  const updateUser = (userId: number, updatedUser: Partial<User>) => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.map((user) =>
        user.id === userId ? { ...user, ...updatedUser } : user
      );

      return updatedUsers;
    });
  };

  const deleteUser = (userId: number) => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.filter((user) => user.id !== userId);
      return updatedUsers;
    });
  };

  const createUser = (
    newUser: Omit<User, "id" | "joinedDate" | "lastLogin">
  ) => {
    setUsers((prevUsers) => {
      // Generate new ID (highest existing ID + 1)
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

