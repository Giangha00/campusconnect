import { useState, useMemo } from "react";
import { Event, EventCategory, EventStatus, EventSortBy } from "@/types/event";
import eventsData from "@/data/events.json";

export function useEvents() {
  const [filter, setFilter] = useState<EventCategory>("all");
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");
  const [sortBy, setSortBy] = useState<EventSortBy>("date");
  const [searchQuery, setSearchQuery] = useState("");

  const allEventsWithStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (eventsData as Event[]).map((event) => {
      const dateStart = new Date(event.dateStart);
      const dateEnd = new Date(event.dateEnd);

      let status: EventStatus = "completed";

      if (today > dateEnd) {
        status = "completed";
      } else if (today >= dateStart && today <= dateEnd) {
        status = "ongoing";
      } else if (today < dateStart) {
        const registrationStart = event.registrationStart
          ? new Date(event.registrationStart)
          : null;
        const registrationEnd = event.registrationEnd
          ? new Date(event.registrationEnd)
          : null;

        if (
          event.registrationRequired &&
          registrationStart &&
          registrationEnd &&
          today >= registrationStart &&
          today <= registrationEnd
        ) {
          status = "upcoming";
        } else {
          status = "incoming";
        }
      }
      return { ...event, status };
    });
  }, []);

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
        (event) => event.status === statusFilter
      );
    }

    // Create a new array from the (potentially filtered) list before sorting to avoid mutation
    const sortedEvents = [...filteredEvents];

    // Apply sorting
    switch (sortBy) {
      case "date":
        sortedEvents.sort(
          (a, b) =>
            new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()
        );
        break;
      case "name":
        sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
        break;
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
          (a, b) => statusOrder[a.status] - statusOrder[b.status]
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
      .filter((event) => event.status === "upcoming")
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
