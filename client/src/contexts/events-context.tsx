import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import eventsDataRaw from "@/data/events.json";

interface Event {
  id: number;
  name: string;
  dateStart: string;
  dateEnd: string;
  time: string;
  venue: string;
  category: string;
  department: string;
  description: string;
  organizer: string;
  image: string;
  registrationRequired: boolean;
  capacity: number | string;
  attendees: number;
  checkedIn: number;
  registrationStart: string;
  registrationEnd: string;
}

interface EventsContextType {
  events: Event[];
  updateEvent: (eventId: number, updatedEvent: Partial<Event>) => void;
  deleteEvent: (eventId: number) => void;
  createEvent: (
    newEvent: Omit<Event, "id" | "attendees" | "checkedIn">
  ) => void;
  isLoading: boolean;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(eventsDataRaw);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize events data from localStorage if available
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error parsing saved events:", error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateEvent = (eventId: number, updatedEvent: Partial<Event>) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updatedEvent } : event
      );

      // Update localStorage
      localStorage.setItem("events", JSON.stringify(updatedEvents));

      return updatedEvents;
    });
  };

  const deleteEvent = (eventId: number) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.filter((event) => event.id !== eventId);

      // Update localStorage
      localStorage.setItem("events", JSON.stringify(updatedEvents));

      return updatedEvents;
    });
  };

  const createEvent = (
    newEvent: Omit<Event, "id" | "attendees" | "checkedIn">
  ) => {
    setEvents((prevEvents) => {
      // Generate new ID (highest existing ID + 1)
      const newId = Math.max(...prevEvents.map((e) => e.id), 0) + 1;

      const eventWithDefaults: Event = {
        ...newEvent,
        id: newId,
        attendees: 0,
        checkedIn: 0,
      };

      const updatedEvents = [eventWithDefaults, ...prevEvents];

      // Update localStorage
      localStorage.setItem("events", JSON.stringify(updatedEvents));

      return updatedEvents;
    });
  };

  const value: EventsContextType = {
    events,
    updateEvent,
    deleteEvent,
    createEvent,
    isLoading,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
