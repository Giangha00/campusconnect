export interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  venue: string;
  category: 'academic' | 'cultural' | 'sports' | 'departmental';
  department: string;
  description: string;
  organizer: string;
  image: string;
  status: 'upcoming' | 'ongoing' | 'past';
  registrationRequired?: boolean;
  capacity?: number;
  bookmarked?: boolean;
}

export type EventCategory = Event['category'] | 'all';
export type EventSortBy = 'date' | 'name' | 'category' | 'venue' | 'time';

export type UserRole = 'student' | 'faculty' | 'visitor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  bookmarkedEvents: number[];
}
