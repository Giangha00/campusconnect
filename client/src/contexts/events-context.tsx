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

  // Helper function to sort events by dateStart (descending - farthest to nearest)
  const sortEventsByDate = (eventsList: Event[]): Event[] => {
    return [...eventsList].sort((a, b) => {
      const dateA = new Date(a.dateStart).getTime();
      const dateB = new Date(b.dateStart).getTime();
      // If same dateStart, sort by dateEnd (descending)
      if (dateA === dateB) {
        return new Date(b.dateEnd).getTime() - new Date(a.dateEnd).getTime();
      }
      return dateB - dateA; // Descending order (farthest to nearest)
    });
  };

  // Initialize events data - prioritize localStorage if available, otherwise use JSON file
  // If JSON file has more events (newer data), merge them
  // Always sort events by dateStart after loading
  useEffect(() => {
    const savedEvents = localStorage.getItem("campusconnect-events");
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents);
        // Check if JSON file has more events (indicating new events were added)
        if (eventsDataRaw.length > parsedEvents.length) {
          // Merge: keep saved events but add new ones from JSON
          const savedEventIds = new Set(parsedEvents.map((e: Event) => e.id));
          const newEventsFromJson = eventsDataRaw.filter(
            (e) => !savedEventIds.has(e.id)
          );
          // Merge saved events with new events from JSON
          const mergedEvents = [...parsedEvents, ...newEventsFromJson];
          // Sort by dateStart
          const sortedEvents = sortEventsByDate(mergedEvents);
          setEvents(sortedEvents);
          // Update localStorage with sorted merged data
          localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
        } else {
          // Use saved events if JSON doesn't have more, but sort them
          const sortedEvents = sortEventsByDate(parsedEvents);
          setEvents(sortedEvents);
          // Update localStorage with sorted data
          localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
        }
      } catch (error) {
        console.error("Error parsing saved events:", error);
        // Fallback to JSON file if localStorage is corrupted
        const sortedEvents = sortEventsByDate(eventsDataRaw);
        setEvents(sortedEvents);
        localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
      }
    } else {
      // No saved events, use JSON file and save to localStorage
      // JSON file is already sorted, but ensure it's sorted
      const sortedEvents = sortEventsByDate(eventsDataRaw);
      setEvents(sortedEvents);
      localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
    }
    setIsLoading(false);
  }, []);

  const updateEvent = (eventId: number, updatedEvent: Partial<Event>) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updatedEvent } : event
      );

      // Sort by dateStart after update
      const sortedEvents = sortEventsByDate(updatedEvents);

      // Update localStorage
      localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));

      return sortedEvents;
    });
  };

  const deleteEvent = (eventId: number) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.filter((event) => event.id !== eventId);

      // Update localStorage
      localStorage.setItem("campusconnect-events", JSON.stringify(updatedEvents));

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

      // Sort by dateStart after create
      const sortedEvents = sortEventsByDate(updatedEvents);

      // Update localStorage
      localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));

      return sortedEvents;
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
