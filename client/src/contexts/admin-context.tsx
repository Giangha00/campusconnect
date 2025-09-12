import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import adminData from "@/data/admin.json";

interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: "admin";
}

interface AdminContextType {
  admin: AdminUser | null;
  login: (
    username: string,
    password: string
  ) => { ok: boolean; message: string };
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in from localStorage
    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem("admin");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string) => {
    // Check against admin.json data (adminData is an array with one admin object)
    const adminUser = adminData.find(
      (admin) => admin.username === username && admin.password === password
    );

    if (adminUser) {
      const loggedInAdmin: AdminUser = {
        id: adminUser.id,
        username: adminUser.username,
        password: adminUser.password,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      };

      setAdmin(loggedInAdmin);
      localStorage.setItem("admin", JSON.stringify(loggedInAdmin));
      return { ok: true, message: "Login successful" };
    }

    return { ok: false, message: "Invalid username or password" };
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
