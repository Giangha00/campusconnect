import { apiClient } from "./api-client";
import type { AdminResponse, AdminUser } from "./types";

export const adminApi = {
  getAll: async (): Promise<AdminResponse[]> => {
    try {
      const response = await apiClient.get<AdminResponse[]>("/admins");
      return response.data;
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw error;
    }
  },

  create: async (admin: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: "admin" | "faculty";
  }): Promise<AdminResponse> => {
    try {
      const response = await apiClient.post<AdminResponse>("/admins", admin);
      return response.data;
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  },

  update: async (
    id: string,
    admin: Partial<AdminResponse> & { active?: boolean; status?: string }
  ): Promise<AdminResponse> => {
    try {
      const response = await apiClient.put<AdminResponse>(`/admins/${id}`, admin);
      return response.data;
    } catch (error) {
      console.error("Error updating admin:", error);
      throw error;
    }
  },

  updateStatus: async (
    id: string,
    active: boolean
  ): Promise<AdminResponse> => {
    try {
      const response = await apiClient.patch<AdminResponse>(
        `/admins/${id}/status`,
        { active }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating admin status:", error);
      throw error;
    }
  },

  login: async (
    username: string,
    password: string
  ): Promise<AdminUser | null> => {
    try {
      const response = await apiClient.post<AdminResponse>("/admins/login", {
        username,
        password,
      });
      // Note: Password should not be returned from backend in production
      // This is just for compatibility with current frontend
      return {
        id: response.data.id,
        username: response.data.username,
        password: "", // Should not store password
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };
    } catch (error) {
      console.error("Error logging in:", error);
      return null;
    }
  },
};
