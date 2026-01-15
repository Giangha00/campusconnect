import { apiClient } from "./api-client";
import type { Feedback, FeedbackResponse, EventResponse } from "./types";

// Map Spring Boot feedback to frontend format
async function mapFeedbackToFrontend(
  feedback: FeedbackResponse
): Promise<Feedback> {
  let eventName = "General Event";
  if (feedback.eventId) {
    try {
      const eventResponse = await apiClient.get<EventResponse>(
        `/events/${feedback.eventId}`
      );
      eventName = eventResponse.data.title;
    } catch (error) {
      console.error("Error fetching event name for feedback:", error);
    }
  }

  return {
    id: feedback.id,
    eventAttended: eventName,
    name: feedback.name,
    email: feedback.email,
    userType: feedback.userType as "student" | "faculty" | "visitor",
    rating: feedback.rating,
    feedback: feedback.feedback,
    createdAt: feedback.createdAt || new Date().toISOString(),
    status: feedback.status as "active" | "hidden",
  };
}

export const feedbackApi = {
  getAll: async (): Promise<Feedback[]> => {
    try {
      const response = await apiClient.get<FeedbackResponse[]>("/feedback");
      const feedbacks = await Promise.all(
        response.data.map(mapFeedbackToFrontend)
      );
      return feedbacks;
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn("Feedback endpoint not found, returning empty array");
        return [];
      }
      console.error("Error fetching feedbacks:", error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Feedback> => {
    try {
      const response = await apiClient.get<FeedbackResponse>(`/feedback/${id}`);
      return await mapFeedbackToFrontend(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      throw error;
    }
  },

  create: async (
    feedback: Omit<FeedbackResponse, "id" | "createdAt" | "updatedAt">
  ): Promise<Feedback> => {
    try {
      const response = await apiClient.post<FeedbackResponse>(
        "/feedback",
        feedback
      );
      return await mapFeedbackToFrontend(response.data);
    } catch (error) {
      console.error("Error creating feedback:", error);
      throw error;
    }
  },

  update: async (
    id: number,
    feedback: Partial<FeedbackResponse>
  ): Promise<Feedback> => {
    try {
      const response = await apiClient.put<FeedbackResponse>(
        `/feedback/${id}`,
        feedback
      );
      return await mapFeedbackToFrontend(response.data);
    } catch (error) {
      console.error("Error updating feedback:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/feedback/${id}`);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      throw error;
    }
  },
};
