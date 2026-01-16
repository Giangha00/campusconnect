import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (optional - for adding auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (using sessionStorage instead of localStorage)
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 404 errors for event-bookmarks endpoint (it's optional)
    const isBookmarks404 =
      error.config?.url?.includes("/event-bookmarks") &&
      error.response?.status === 404;

    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      console.error(
        "API Error: Cannot connect to backend server at",
        API_BASE_URL
      );
      console.error(
        "Please ensure the Spring Boot backend is running on http://localhost:8080"
      );
    } else if (!isBookmarks404) {
      // Log detailed error information (except for bookmarks 404)
      if (error.response) {
        console.error("API Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
        });
      } else {
        console.error("API Error:", error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
