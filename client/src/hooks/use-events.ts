import { useState, useMemo } from 'react';
import { Event, EventCategory, EventStatus, EventSortBy } from '@/types/event';
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

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filteredEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'name':
        filteredEvents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        filteredEvents.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'status':
        // Sort by status in logical order: upcoming -> ongoing -> past
        const statusOrder = { upcoming: 0, ongoing: 1, past: 2 };
        filteredEvents.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      case 'time':
        filteredEvents.sort((a, b) => a.time.localeCompare(b.time));
        break;
    }

    return filteredEvents;
  }, [filter, statusFilter, sortBy, searchQuery]);

  const upcomingEvents = useMemo(() => {
    return (eventsData as Event[])
      .filter(event => event.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
