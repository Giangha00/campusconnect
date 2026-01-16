import { useState, useMemo, useEffect } from "react";
import { Event, EventCategory, EventStatus, EventSortBy } from "@/types/event";
// import eventsData from "@/data/events.json"; // Backup - keeping for reference
import { calculateEventStatus } from "@/lib/event-status";
import { eventsApi, type Event as ApiEvent } from "@/lib/api";

export function useEvents() {
  const [filter, setFilter] = useState<EventCategory>("all");
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");
  const [sortBy, setSortBy] = useState<EventSortBy>("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [eventsData, setEventsData] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const events = await eventsApi.getAll();
        setEventsData(events);
      } catch (error) {
        console.error('Error loading events:', error);
        setEventsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const allEventsWithStatus = useMemo(() => {
    return eventsData.map((event) => {
      const status = calculateEventStatus(event as any);
      // Map API Event to frontend Event type with required fields
      return { 
        ...event, 
        status,
        date: event.dateStart, // Add date for backward compatibility
      } as any; // Type assertion needed due to type mismatch between API and frontend Event types
    });
  }, [eventsData]);

  const events = useMemo(() => {
    let filteredEvents = allEventsWithStatus;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.department.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filter !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) => event.category === filter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) => calculateEventStatus(event) === statusFilter
      );
    }

    // Create a new array from the (potentially filtered) list before sorting to avoid mutation
    const sortedEvents = [...filteredEvents];

    // Apply sorting
    switch (sortBy) {
      case "date":
        // Sort by status priority first (Ongoing → Upcoming → Incoming → Complete), then by date within each status
        const statusPriority = {
          ongoing: 0,
          upcoming: 1,
          incoming: 2,
          completed: 3,
        };
        sortedEvents.sort((a, b) => {
          const statusA = calculateEventStatus(a);
          const statusB = calculateEventStatus(b);
          
          // First, sort by status priority
          if (statusPriority[statusA] !== statusPriority[statusB]) {
            return statusPriority[statusA] - statusPriority[statusB];
          }
          
          // If same status, sort by date (newest first within each status group)
          return new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime();
        });
        break;
      // "name" is not a valid EventSortBy, removed
      case "category":
        sortedEvents.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "status":
        const statusOrder = {
          incoming: 0,
          upcoming: 1,
          ongoing: 2,
          completed: 3,
        };
        sortedEvents.sort(
          (a, b) => statusOrder[calculateEventStatus(a)] - statusOrder[calculateEventStatus(b)]
        );
        break;
      case "time":
        sortedEvents.sort((a, b) => a.time.localeCompare(b.time));
        break;
    }

    return sortedEvents;
  }, [allEventsWithStatus, filter, statusFilter, sortBy, searchQuery]);

  const upcomingEvents = useMemo(() => {
    return allEventsWithStatus
      .filter((event) => calculateEventStatus(event) === "upcoming")
      .sort(
        (a, b) =>
          new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
      )
      .slice(0, 3);
  }, [allEventsWithStatus]);

  return {
    events,
    upcomingEvents,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  };
}
