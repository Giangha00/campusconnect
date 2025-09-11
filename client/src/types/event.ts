export interface Event {
  id: number;
  name: string;
  date: string; // Keep for backward compatibility
  dateStart: string;
  dateEnd: string;
  time: string;
  venue: string;
  category: 'academic' | 'cultural' | 'sports' | 'technical';
  department: string;
  description: string;
  organizer: string;
  image: string;
  status: 'incoming' | 'upcoming' | 'ongoing' | 'completed';
  registrationRequired?: boolean;
  capacity?: number | "No limit";
  attendees?: number;
  bookmarked?: boolean;
  registrationStart?: string;
  registrationEnd?: string;
}

export type EventCategory = Event['category'] | 'all';
export type EventStatus = Event['status'] | 'all';
export type EventSortBy = 'date' | 'name' | 'category' | 'status' | 'time';

export type UserRole = 'student' | 'faculty' | 'visitor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  bookmarkedEvents: number[];
  registeredEvents: number[];
}
