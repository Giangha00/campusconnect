import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import eventsDataRaw from "@/data/events.json"; // Backup - keeping for reference
import { cache } from "@/lib/indexeddb-cache";
import { eventsApi, type Event } from "@/lib/api";

// Event interface is now imported from api.ts

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
  const [events, setEvents] = useState<Event[]>([]);
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

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        // Try to get from cache first
        const cachedEvents = await cache.get<Event[]>("events");
        if (cachedEvents && cachedEvents.length > 0) {
          const sortedEvents = sortEventsByDate(cachedEvents);
          setEvents(sortedEvents);
          setIsLoading(false);
        }

        // Always fetch from API to get latest data
        const apiEvents = await eventsApi.getAll();
        const sortedEvents = sortEventsByDate(apiEvents);
        setEvents(sortedEvents);
        
        // Update cache
        await cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000); // 7 days
        localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
      } catch (error) {
        console.error("Error loading events from API:", error);
        // Fallback to cache or localStorage
        try {
          const cachedEvents = await cache.get<Event[]>("events");
          if (cachedEvents && cachedEvents.length > 0) {
            const sortedEvents = sortEventsByDate(cachedEvents);
            setEvents(sortedEvents);
          } else {
            const savedEvents = localStorage.getItem("campusconnect-events");
            if (savedEvents) {
              const parsedEvents = JSON.parse(savedEvents);
              const sortedEvents = sortEventsByDate(parsedEvents);
              setEvents(sortedEvents);
            }
          }
        } catch (cacheError) {
          console.error("Error loading from cache:", cacheError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const updateEvent = async (eventId: number, updatedEvent: Partial<Event>) => {
    try {
      // Update on server
      const updated = await eventsApi.update(eventId, updatedEvent);
      
      // Update local state
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.id === eventId ? updated : event
        );
        const sortedEvents = sortEventsByDate(updatedEvents);
        
        // Update cache
        localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
        cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000).catch(console.error);
        
        return sortedEvents;
      });
    } catch (error) {
      console.error("Error updating event:", error);
      // Still update locally for optimistic UI
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.id === eventId ? { ...event, ...updatedEvent } : event
        );
        const sortedEvents = sortEventsByDate(updatedEvents);
        localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
        cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000).catch(console.error);
        return sortedEvents;
      });
    }
  };

  const deleteEvent = async (eventId: number) => {
    try {
      // Delete on server
      await eventsApi.delete(eventId);
      
      // Update local state
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.filter((event) => event.id !== eventId);
        localStorage.setItem("campusconnect-events", JSON.stringify(updatedEvents));
        cache.set("events", updatedEvents, 7 * 24 * 60 * 60 * 1000).catch(console.error);
        return updatedEvents;
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      // Still update locally for optimistic UI
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.filter((event) => event.id !== eventId);
        localStorage.setItem("campusconnect-events", JSON.stringify(updatedEvents));
        cache.set("events", updatedEvents, 7 * 24 * 60 * 60 * 1000).catch(console.error);
        return updatedEvents;
      });
    }
  };

  const createEvent = async (
    newEvent: Omit<Event, "id" | "attendees" | "checkedIn">
  ) => {
    try {
      // Create on server - map frontend format to API format
      const apiEvent = {
        title: newEvent.name,
        description: newEvent.description,
        startDate: newEvent.dateStart,
        endDate: newEvent.dateEnd,
        venue: newEvent.venue,
        category: newEvent.category,
        imageUrl: newEvent.image,
        registrationRequired: newEvent.registrationRequired,
        capacity: typeof newEvent.capacity === 'number' ? newEvent.capacity : undefined,
        registrationStart: newEvent.registrationStart,
        registrationEnd: newEvent.registrationEnd,
      };
      
      const created = await eventsApi.create(apiEvent);
      
      // Update local state
      setEvents((prevEvents) => {
        const updatedEvents = [created, ...prevEvents];
        const sortedEvents = sortEventsByDate(updatedEvents);
        localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
        cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000).catch(console.error);
        return sortedEvents;
      });
    } catch (error) {
      console.error("Error creating event:", error);
      // Still update locally for optimistic UI
      setEvents((prevEvents) => {
        const newId = Math.max(...prevEvents.map((e) => e.id), 0) + 1;
        const eventWithDefaults: Event = {
          ...newEvent,
          id: newId,
          attendees: 0,
          checkedIn: 0,
        };
        const updatedEvents = [eventWithDefaults, ...prevEvents];
        const sortedEvents = sortEventsByDate(updatedEvents);
        localStorage.setItem("campusconnect-events", JSON.stringify(sortedEvents));
        cache.set("events", sortedEvents, 7 * 24 * 60 * 60 * 1000).catch(console.error);
        return sortedEvents;
      });
    }
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
