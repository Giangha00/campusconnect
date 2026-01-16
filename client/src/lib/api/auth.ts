import { apiClient } from "./api-client";
import type { UserResponse, UserLoginRequest, UserRegisterRequest } from "./types";

export const userAuthApi = {
  login: async (
    username: string,
    password: string
  ): Promise<UserResponse | null> => {
    try {
      // Call login endpoint to verify username and password
      const response = await apiClient.post<UserResponse>("/users/login", {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error during login:", error);
      // If API call fails (401 Unauthorized or other error), return null
      return null;
    }
  },

  register: async (data: UserRegisterRequest): Promise<UserResponse> => {
    try {
      // Ensure all required fields are present
      const requestData = {
        username: data.username.trim(),
        password: data.password,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        department: data.department?.trim() || undefined,
        year: data.year?.trim() || undefined,
      };

      const response = await apiClient.post<UserResponse>(
        "/users",
        requestData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error during registration:", error);

      // Extract error message from response
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

      // Create a more detailed error
      const detailedError = new Error(errorMessage);
      (detailedError as any).response = error.response;
      (detailedError as any).status = error.response?.status;
      throw detailedError;
    }
  },
};
