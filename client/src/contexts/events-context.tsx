import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import eventsDataRaw from "@/data/events.json";
import { cache } from "@/lib/indexeddb-cache";

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

  // Initialize events data - prioritize IndexedDB cache, then localStorage, then JSON file
  // If JSON file has more events (newer data), merge them
  // Always sort events by dateStart after loading
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // ✅ Check IndexedDB cache first (7 days expiry)
        const cachedEvents = await cache.get<Event[]>("events");
        if (cachedEvents && cachedEvents.length > 0) {
          const sortedEvents = sortEventsByDate(cachedEvents);
          setEvents(sortedEvents);
          setIsLoading(false);
          // Also update localStorage for backward compatibility
          localStorage.setItem(
            "campusconnect-events",
            JSON.stringify(sortedEvents)
          );
          return;
        }

        // Fallback to localStorage
        const savedEvents = localStorage.getItem("campusconnect-events");
        if (savedEvents) {
          try {
            const parsedEvents = JSON.parse(savedEvents);
            // Check if JSON file has more events (indicating new events were added)
            if (eventsDataRaw.length > parsedEvents.length) {
              // Merge: keep saved events but add new ones from JSON
              const savedEventIds = new Set(
                parsedEvents.map((e: Event) => e.id)
              );
              const newEventsFromJson = eventsDataRaw.filter(
                (e) => !savedEventIds.has(e.id)
              );
              // Merge saved events with new events from JSON
              const mergedEvents = [...parsedEvents, ...newEventsFromJson];
              // Sort by dateStart
              const sortedEvents = sortEventsByDate(mergedEvents);
              setEvents(sortedEvents);
              // Update both localStorage and IndexedDB cache
              localStorage.setItem(
                "campusconnect-events",
                JSON.stringify(sortedEvents)
              );
              await cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000); // 7 days
            } else {
              // Use saved events if JSON doesn't have more, but sort them
              const sortedEvents = sortEventsByDate(parsedEvents);
              setEvents(sortedEvents);
              // Update both localStorage and IndexedDB cache
              localStorage.setItem(
                "campusconnect-events",
                JSON.stringify(sortedEvents)
              );
              await cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000); // 7 days
            }
          } catch (error) {
            console.error("Error parsing saved events:", error);
            // Fallback to JSON file if localStorage is corrupted
            const sortedEvents = sortEventsByDate(eventsDataRaw);
            setEvents(sortedEvents);
            localStorage.setItem(
              "campusconnect-events",
              JSON.stringify(sortedEvents)
            );
            await cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000); // 7 days
          }
        } else {
          // No saved events, use JSON file and save to both localStorage and IndexedDB
          const sortedEvents = sortEventsByDate(eventsDataRaw);
          setEvents(sortedEvents);
          localStorage.setItem(
            "campusconnect-events",
            JSON.stringify(sortedEvents)
          );
          await cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000); // 7 days
        }
      } catch (error) {
        console.error("Error loading events from cache:", error);
        // Fallback to localStorage or JSON file
        const savedEvents = localStorage.getItem("campusconnect-events");
        if (savedEvents) {
          try {
            const parsedEvents = JSON.parse(savedEvents);
            const sortedEvents = sortEventsByDate(parsedEvents);
            setEvents(sortedEvents);
          } catch {
            const sortedEvents = sortEventsByDate(eventsDataRaw);
            setEvents(sortedEvents);
          }
        } else {
          const sortedEvents = sortEventsByDate(eventsDataRaw);
          setEvents(sortedEvents);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const updateEvent = (eventId: number, updatedEvent: Partial<Event>) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.map((event) =>
        event.id === eventId ? { ...event, ...updatedEvent } : event
      );

      // Sort by dateStart after update
      const sortedEvents = sortEventsByDate(updatedEvents);

      // Update both localStorage and IndexedDB cache
      localStorage.setItem(
        "campusconnect-events",
        JSON.stringify(sortedEvents)
      );
      cache
        .set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000)
        .catch(console.error);

      return sortedEvents;
    });
  };

  const deleteEvent = (eventId: number) => {
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents.filter((event) => event.id !== eventId);

      // Update both localStorage and IndexedDB cache
      localStorage.setItem(
        "campusconnect-events",
        JSON.stringify(updatedEvents)
      );
      cache
        .set("events", updatedEvents, 7 * 24 * 60 * 60 * 1000)
        .catch(console.error);

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

      // Update both localStorage and IndexedDB cache
      localStorage.setItem(
        "campusconnect-events",
        JSON.stringify(sortedEvents)
      );
      cache
        .set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000)
        .catch(console.error);

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
