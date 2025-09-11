import { useState, useMemo } from 'react';
import { Event, EventCategory, EventStatus, EventSortBy } from '@/types/event';
import { calculateEventStatus } from '@/lib/event-status';
import eventsData from '@/data/events.json';

export function useEvents() {
  const [filter, setFilter] = useState<EventCategory>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all');
  const [sortBy, setSortBy] = useState<EventSortBy>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const events = useMemo(() => {
    let filteredEvents = eventsData as Event[];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.department.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query) ||
        event.venue.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filter !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === filter);
    }

    // Apply status filter using calculated status
    if (statusFilter !== 'all') {
      filteredEvents = filteredEvents.filter(event => calculateEventStatus(event) === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        // Newest first: sort by dateStart descending, fallback to date if needed
        filteredEvents.sort((a, b) => {
          const aTime = new Date(a.dateStart ?? a.date).getTime();
          const bTime = new Date(b.dateStart ?? b.date).getTime();
          return bTime - aTime;
        });
        break;
      case 'name':
        filteredEvents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        filteredEvents.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'status':
        // Sort by status in logical order: incoming -> upcoming -> ongoing -> completed
        const statusOrder = { incoming: 0, upcoming: 1, ongoing: 2, completed: 3 };
        filteredEvents.sort((a, b) => {
          const statusA = calculateEventStatus(a);
          const statusB = calculateEventStatus(b);
          return statusOrder[statusA] - statusOrder[statusB];
        });
        break;
      case 'time':
        filteredEvents.sort((a, b) => a.time.localeCompare(b.time));
        break;
    }

    return filteredEvents;
  }, [filter, statusFilter, sortBy, searchQuery]);

  const upcomingEvents = useMemo(() => {
    return (eventsData as Event[])
      .filter(event => calculateEventStatus(event) === 'upcoming')
      .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
      .slice(0, 3);
  }, []);

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
