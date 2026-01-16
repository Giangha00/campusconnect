// ==================== Events Types ====================
export interface EventResponse {
  id: number;
  organizerId?: string;
  organizer?: {
    id: string;
    name: string;
    username?: string;
    email?: string;
  };
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  category: string;
  status: string;
  imageUrl?: string;
  registrationRequired: boolean;
  capacity?: number;
  registrationStart?: string;
  registrationEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: number;
  name: string;
  date?: string; // For backward compatibility with frontend Event type
  dateStart: string;
  dateEnd: string;
  time: string;
  venue: string;
  category: string;
  department: string;
  description: string;
  organizer: string;
  organizerId?: string;
  image: string;
  status?: "incoming" | "upcoming" | "ongoing" | "completed"; // For backward compatibility
  registrationRequired: boolean;
  capacity: number | string;
  attendees: number;
  checkedIn: number;
  registrationStart?: string;
  registrationEnd?: string;
}

// ==================== Users Types ====================
export interface UserResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  department?: string;
  year?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "faculty" | "student" | "visitor";
  department: string;
  designation: string;
  phone: string;
  specialization: string;
  avatar: string;
  status: "active" | "inactive";
  joinedDate: string;
  lastLogin: string;
  year?: string;
}

// ==================== Feedback Types ====================
export interface FeedbackResponse {
  id: number;
  userId?: string;
  eventId?: number;
  name: string;
  email: string;
  userType: string;
  rating: number;
  feedback: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feedback {
  id: number;
  eventAttended: string;
  name: string;
  email: string;
  userType: "student" | "faculty" | "visitor";
  rating: number;
  feedback: string;
  createdAt: string;
  status: "active" | "hidden";
}

// ==================== Gallery Types ====================
export interface GalleryResponse {
  id: number;
  eventId?: number;
  event?: any | null;
  imageUrl: string;
  altText?: string;
  year: string;
  category: string;
  eventName?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  altText?: string;
  year: string;
  category: string;
  eventName?: string;
  date?: string;
}

// ==================== Admin Types ====================
export interface AdminResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "faculty";
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: "admin" | "faculty";
}

// ==================== Event Registrations Types ====================
export interface EventRegistrationResponse {
  id: string;
  userId: string;
  eventId: number;
  ticketNumber: string;
  registrationDate: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Registration {
  eventId: number;
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  registeredAt: string;
  ticket?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

// ==================== Event Bookmarks Types ====================
export interface EventBookmarkResponse {
  id: string;
  userId: string;
  eventId: number;
  createdAt?: string;
}

// ==================== User Auth Types ====================
export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "visitor";
  department?: string;
  year?: string;
}
