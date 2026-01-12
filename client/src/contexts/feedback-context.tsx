import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import feedbackData from "@/data/feedback.json"; // Backup - keeping for reference
import { feedbackApi, type Feedback } from "@/lib/api";

// Feedback interface is now imported from api.ts

interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (
    feedback: Omit<Feedback, "id" | "createdAt" | "status">
  ) => void;
  getFeedbacksByEvent: (eventName: string) => Feedback[];
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

interface FeedbackProviderProps {
  children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load feedbacks from API
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setIsLoading(true);
        // Always fetch from API
        const apiFeedbacks = await feedbackApi.getAll();
        // Filter out invalid userTypes
        const validUserTypes: ("student" | "faculty" | "visitor")[] = [
          "student",
          "faculty",
          "visitor",
        ];
        const filteredFeedbacks = apiFeedbacks.filter((f) =>
          validUserTypes.includes(f.userType as any)
        );
        setFeedbacks(filteredFeedbacks);
      } catch (error) {
        console.error("Error loading feedbacks from API:", error);
        // Set empty array on error
        setFeedbacks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  const addFeedback = async (
    newFeedback: Omit<Feedback, "id" | "createdAt" | "status">
  ) => {
    try {
      // Find event ID from event name (this is a limitation - should use eventId directly)
      // For now, we'll need to pass eventId separately or find it
      const apiFeedback = {
        name: newFeedback.name,
        email: newFeedback.email,
        userType: newFeedback.userType,
        rating: newFeedback.rating,
        feedback: newFeedback.feedback,
        // eventId and userId would need to be passed separately
      };

      const created = await feedbackApi.create(apiFeedback);
      setFeedbacks((prev) => {
        const updated = [...prev, created];
        return updated;
      });
    } catch (error) {
      console.error("Error creating feedback:", error);
      // Optimistic update
      const feedback: Feedback = {
        ...newFeedback,
        id: Math.max(...feedbacks.map((f) => f.id), 0) + 1,
        createdAt: new Date().toISOString(),
        status: "active",
      };
      setFeedbacks((prev) => {
        const updated = [...prev, feedback];
        return updated;
      });
    }
  };

  const getFeedbacksByEvent = (eventName: string): Feedback[] => {
    return feedbacks.filter((f) => f.eventAttended === eventName);
  };

  const value: FeedbackContextType = {
    feedbacks,
    addFeedback,
    getFeedbacksByEvent,
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}
