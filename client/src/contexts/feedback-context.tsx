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
    feedback: Omit<Feedback, "id" | "createdAt" | "status"> & {
      userId?: string;
      eventId?: number;
    }
  ) => Promise<Feedback>;
  getFeedbacksByEvent: (eventName: string) => Feedback[];
  getFeedbacksByEventId: (eventId: number) => Feedback[];
  loadFeedbacksByEventId: (eventId: number) => Promise<Feedback[]>;
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
    newFeedback: Omit<Feedback, "id" | "createdAt" | "status"> & {
      userId?: string;
      eventId?: number;
    }
  ) => {
    // IMPORTANT: do not "optimistically succeed" here. If API fails,
    // we should bubble the error so UI can inform the user that DB wasn't updated.
    const apiFeedback: any = {
      name: newFeedback.name,
      email: newFeedback.email,
      userType: newFeedback.userType,
      rating: newFeedback.rating,
      feedback: newFeedback.feedback,
      status: "active",
    };
    
    // Only include userId and eventId if they are provided (not undefined)
    if (newFeedback.userId) {
      apiFeedback.userId = newFeedback.userId;
    }
    if (newFeedback.eventId !== undefined && newFeedback.eventId !== null) {
      apiFeedback.eventId = newFeedback.eventId;
    }

    const created = await feedbackApi.create(apiFeedback);
    setFeedbacks((prev) => [...prev, created]);
    return created;
  };

  const getFeedbacksByEvent = (eventName: string): Feedback[] => {
    return feedbacks.filter((f) => f.eventAttended === eventName);
  };

  const getFeedbacksByEventId = (eventId: number): Feedback[] => {
    return feedbacks.filter((f) => {
      // Try to match by eventId if available in the feedback object
      // Note: This requires the feedback to have eventId property
      // For now, we'll need to fetch from API directly
      return false; // Placeholder - will use loadFeedbacksByEventId instead
    });
  };

  const loadFeedbacksByEventId = async (eventId: number): Promise<Feedback[]> => {
    try {
      const apiFeedbacks = await feedbackApi.getAll(eventId);
      const validUserTypes: ("student" | "faculty" | "visitor")[] = [
        "student",
        "faculty",
        "visitor",
      ];
      const filteredFeedbacks = apiFeedbacks.filter((f) =>
        validUserTypes.includes(f.userType as any)
      );
      return filteredFeedbacks;
    } catch (error) {
      console.error("Error loading feedbacks by eventId:", error);
      return [];
    }
  };

  const value: FeedbackContextType = {
    feedbacks,
    addFeedback,
    getFeedbacksByEvent,
    getFeedbacksByEventId,
    loadFeedbacksByEventId,
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
