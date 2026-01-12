import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import adminData from "@/data/admin.json"; // Backup - keeping for reference
import { adminApi, type AdminUser } from "@/lib/api";

// AdminUser interface is now imported from api.ts

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
    // Check if admin is logged in from sessionStorage
    const savedAdmin = sessionStorage.getItem("admin");
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        sessionStorage.removeItem("admin");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const adminUser = await adminApi.login(username, password);
      
      if (adminUser) {
        setAdmin(adminUser);
        sessionStorage.setItem("admin", JSON.stringify(adminUser));
        return { ok: true, message: "Login successful" };
      }

      return { ok: false, message: "Invalid username or password" };
    } catch (error) {
      console.error("Error during login:", error);
      return { ok: false, message: "Error connecting to server" };
    }
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem("admin");
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
