import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import feedbackData from "@/data/feedback.json";

export interface Feedback {
  id: number;
  eventAttended: string;
  name: string;
  email: string;
  userType: "student" | "faculty" | "visitor";
  rating: number;
  feedback: string;
  createdAt: string;
  status: "active" | "hidden";
}

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

const LS_FEEDBACKS_KEY = "campusconnect-feedbacks";

function loadFeedbacks(): Feedback[] {
  try {
    const saved = localStorage.getItem(LS_FEEDBACKS_KEY);
    if (saved) {
      const parsedFeedbacks = JSON.parse(saved) as Feedback[];
      // Filter out feedbacks with invalid userType (staff, alumni)
      const validUserTypes: ("student" | "faculty" | "visitor")[] = [
        "student",
        "faculty",
        "visitor",
      ];
      const filteredFeedbacks = parsedFeedbacks.filter((f) =>
        validUserTypes.includes(f.userType as any)
      );
      // If we filtered out any feedbacks, save the cleaned data
      if (filteredFeedbacks.length !== parsedFeedbacks.length) {
        localStorage.setItem(
          LS_FEEDBACKS_KEY,
          JSON.stringify(filteredFeedbacks)
        );
      }
      return filteredFeedbacks;
    }
    // If no saved data, use initial data from JSON file
    return feedbackData.feedbacks as Feedback[];
  } catch {
    return feedbackData.feedbacks as Feedback[];
  }
}

function saveFeedbacks(feedbacks: Feedback[]) {
  localStorage.setItem(LS_FEEDBACKS_KEY, JSON.stringify(feedbacks));
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Load feedbacks from localStorage on mount
  useEffect(() => {
    const loadedFeedbacks = loadFeedbacks();
    // Filter out any feedbacks with invalid userType (staff, alumni)
    const validUserTypes: ("student" | "faculty" | "visitor")[] = [
      "student",
      "faculty",
      "visitor",
    ];
    const filteredFeedbacks = loadedFeedbacks.filter((f) =>
      validUserTypes.includes(f.userType as any)
    );
    setFeedbacks(filteredFeedbacks);
  }, []);

  // Save feedbacks to localStorage when they change
  useEffect(() => {
    if (feedbacks.length > 0) {
      saveFeedbacks(feedbacks);
    }
  }, [feedbacks]);

  const addFeedback = (
    newFeedback: Omit<Feedback, "id" | "createdAt" | "status">
  ) => {
    const feedback: Feedback = {
      ...newFeedback,
      id: Math.max(...feedbacks.map((f) => f.id), 0) + 1,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    setFeedbacks((prev) => [...prev, feedback]);
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
