import { apiClient } from "./api-client";
import type { EventBookmarkResponse } from "./types";

// Internal mapping to track eventId for each bookmark ID
// Store in sessionStorage to persist across page reloads
const BOOKMARK_MAPPING_KEY = "campusconnect-bookmark-mapping";

function getBookmarkMapping(): Map<string, number> {
  try {
    const stored = sessionStorage.getItem(BOOKMARK_MAPPING_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return new Map(Object.entries(data).map(([k, v]) => [k, Number(v)]));
    }
  } catch (e) {
    console.error("Error loading bookmark mapping:", e);
  }
  return new Map();
}

function saveBookmarkMapping(map: Map<string, number>) {
  try {
    const data = Object.fromEntries(map);
    sessionStorage.setItem(BOOKMARK_MAPPING_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving bookmark mapping:", e);
  }
}

export const bookmarksApi = {
  getAll: async (userId?: string): Promise<number[]> => {
    try {
      // Backend uses userId (camelCase) in query param
      // Query with userId to get only current user's bookmarks
      const url = userId
        ? `/event-bookmarks?userId=${encodeURIComponent(userId)}`
        : "/event-bookmarks";
      const response = await apiClient.get<EventBookmarkResponse[]>(url);

      // Backend now returns userId and eventId in response
      // Extract eventIds directly from response
      const eventIds: number[] = [];
      response.data.forEach((bookmark) => {
        if (bookmark.eventId) {
          eventIds.push(bookmark.eventId);
        }
      });

      return eventIds;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Endpoint not found - silently return empty array (no error logging)
        return [];
      }
      console.error("Error fetching bookmarks:", error);
      throw error;
    }
  },

  create: async (
    userId: string,
    eventId: number
  ): Promise<EventBookmarkResponse> => {
    try {
      console.log("Creating bookmark:", { userId, eventId });
      // Backend expects userId and eventId (camelCase) in request body
      const response = await apiClient.post<EventBookmarkResponse>(
        "/event-bookmarks",
        {
          userId: userId,
          eventId: eventId,
        }
      );
      console.log("Bookmark created successfully:", response.data);

      // Backend now returns userId and eventId in response, no need for mapping
      // But we still keep mapping for backward compatibility with existing code
      const mapping = getBookmarkMapping();
      if (response.data.userId && response.data.eventId) {
        mapping.set(response.data.id, response.data.eventId);
        saveBookmarkMapping(mapping);
      }

      return response.data;
    } catch (error: any) {
      // Log detailed error information
      if (error.response) {
        console.error("Error creating bookmark:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
        });
      } else {
        console.error("Error creating bookmark:", error.message || error);
      }
      throw error;
    }
  },

  delete: async (userId: string, eventId: number): Promise<void> => {
    try {
      // Use new endpoint that accepts userId and eventId directly
      // This is more reliable than using sessionStorage mapping
      await apiClient.delete(
        `/event-bookmarks?userId=${encodeURIComponent(
          userId
        )}&eventId=${eventId}`
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Bookmark doesn't exist, that's fine
        return;
      }
      console.error("Error deleting bookmark:", error);
      throw error;
    }
  },
};
