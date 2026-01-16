import { apiClient } from "./api-client";
import type { GalleryItem, GalleryResponse } from "./types";

// Map Spring Boot gallery to frontend format
function mapGalleryToFrontend(gallery: GalleryResponse): GalleryItem {
  // Handle eventId from either eventId field or event object
  const eventId = gallery.eventId || gallery.event?.id;

  return {
    id: gallery.id,
    imageUrl: gallery.imageUrl,
    altText: gallery.altText,
    year: gallery.year,
    category: gallery.category,
    eventName: gallery.eventName,
    date: gallery.date,
  };
}

export const galleryApi = {
  getAll: async (): Promise<GalleryItem[]> => {
    try {
      const response = await apiClient.get<GalleryResponse[]>("/gallery");
      return response.data.map(mapGalleryToFrontend);
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn("Gallery endpoint not found, returning empty array");
        return [];
      }
      console.error("Error fetching gallery:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<GalleryItem> => {
    try {
      const response = await apiClient.get<GalleryResponse>(`/gallery/${id}`);
      return mapGalleryToFrontend(response.data);
    } catch (error) {
      console.error("Error fetching gallery item:", error);
      throw error;
    }
  },

  create: async (
    gallery: Omit<GalleryResponse, "id" | "createdAt" | "updatedAt">
  ): Promise<GalleryItem> => {
    try {
      const response = await apiClient.post<GalleryResponse>(
        "/gallery",
        gallery
      );
      return mapGalleryToFrontend(response.data);
    } catch (error) {
      console.error("Error creating gallery item:", error);
      throw error;
    }
  },

  update: async (
    id: number,
    gallery: Partial<GalleryResponse>
  ): Promise<GalleryItem> => {
    try {
      const response = await apiClient.put<GalleryResponse>(
        `/gallery/${id}`,
        gallery
      );
      return mapGalleryToFrontend(response.data);
    } catch (error) {
      console.error("Error updating gallery item:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/gallery/${id}`);
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      throw error;
    }
  },
};
