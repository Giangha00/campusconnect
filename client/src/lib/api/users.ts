import { apiClient } from "./api-client";
import type { User, UserResponse } from "./types";

// Map Spring Boot user to frontend format
function mapUserToFrontend(user: UserResponse): User {
  return {
    id: user.id, // Keep as string (UUID)
    name: user.name,
    email: user.email,
    role: user.role as "faculty" | "student" | "visitor",
    department: user.department || "General",
    designation:
      user.role === "faculty"
        ? "Faculty Member"
        : user.role === "student"
        ? "Student"
        : "Visitor",
    phone: "", // Not in DB
    specialization: "", // Not in DB
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name
    )}&background=random`,
    status: "active",
    joinedDate: user.createdAt || new Date().toISOString().split("T")[0],
    lastLogin: new Date().toISOString(),
    year: user.year,
  };
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>("/users");
      return response.data.map(mapUserToFrontend);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${id}`);
      return mapUserToFrontend(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  create: async (user: Partial<UserResponse>): Promise<User> => {
    try {
      const response = await apiClient.post<UserResponse>("/users", user);
      return mapUserToFrontend(response.data);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  update: async (id: string, user: Partial<UserResponse>): Promise<User> => {
    try {
      const response = await apiClient.put<UserResponse>(`/users/${id}`, user);
      return mapUserToFrontend(response.data);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};
