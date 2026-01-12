import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional - for adding auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (using sessionStorage instead of localStorage)
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 404 errors for event-bookmarks endpoint (it's optional)
    const isBookmarks404 = error.config?.url?.includes('/event-bookmarks') && error.response?.status === 404;
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('API Error: Cannot connect to backend server at', API_BASE_URL);
      console.error('Please ensure the Spring Boot backend is running on http://localhost:8080');
    } else if (!isBookmarks404) {
      // Log detailed error information (except for bookmarks 404)
      if (error.response) {
        console.error('API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
        });
      } else {
        console.error('API Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Events API ====================
export interface EventResponse {
  id: number;
  organizerId?: string;
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
  registrationStart?: string;
  registrationEnd?: string;
}

// Map Spring Boot event to frontend format
function mapEventToFrontend(event: EventResponse, attendees: number = 0, checkedIn: number = 0): Event {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : startDate;
  
  return {
    id: event.id,
    name: event.title,
    dateStart: event.startDate,
    dateEnd: event.endDate || event.startDate,
    time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    venue: event.venue || 'TBA',
    category: event.category,
    department: 'General', // Default value
    description: event.description || '',
    organizer: 'Admin', // Default value, can be fetched from admin table
    image: event.imageUrl || '',
    registrationRequired: event.registrationRequired ?? true,
    capacity: event.capacity || 'Unlimited',
    attendees,
    checkedIn,
    registrationStart: event.registrationStart,
    registrationEnd: event.registrationEnd,
  };
}

export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    try {
      const eventsResponse = await apiClient.get<EventResponse[]>('/events');
      const events = eventsResponse.data;

      // Try to get registrations, but don't fail if endpoint doesn't exist
      let registrations: any[] = [];
      try {
        const registrationsResponse = await apiClient.get<any[]>('/event-registrations');
        registrations = registrationsResponse.data || [];
      } catch (regError: any) {
        // If 404, endpoint doesn't exist yet - use empty array
        if (regError.response?.status !== 404) {
          console.warn('Error fetching registrations (non-404):', regError);
        }
      }

      // Calculate attendees and checkedIn for each event
      const eventStats = events.map(event => {
        const eventRegistrations = registrations.filter(reg => reg.eventId === event.id);
        const attendees = eventRegistrations.length;
        const checkedIn = eventRegistrations.filter(reg => reg.checkedIn).length;
        return { event, attendees, checkedIn };
      });

      return eventStats.map(({ event, attendees, checkedIn }) => 
        mapEventToFrontend(event, attendees, checkedIn)
      );
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Event> => {
    try {
      const eventResponse = await apiClient.get<EventResponse>(`/events/${id}`);
      const event = eventResponse.data;

      // Try to get registrations, but don't fail if endpoint doesn't exist
      let registrations: any[] = [];
      try {
        const registrationsResponse = await apiClient.get<any[]>(`/event-registrations?eventId=${id}`);
        registrations = registrationsResponse.data || [];
      } catch (regError: any) {
        // If 404, endpoint doesn't exist yet - use empty array
        if (regError.response?.status !== 404) {
          console.warn('Error fetching registrations (non-404):', regError);
        }
      }

      const attendees = registrations.length;
      const checkedIn = registrations.filter(reg => reg.checkedIn).length;

      return mapEventToFrontend(event, attendees, checkedIn);
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  create: async (event: Partial<EventResponse>): Promise<Event> => {
    try {
      const response = await apiClient.post<EventResponse>('/events', event);
      return mapEventToFrontend(response.data);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  update: async (id: number, event: Partial<EventResponse>): Promise<Event> => {
    try {
      const response = await apiClient.put<EventResponse>(`/events/${id}`, event);
      return mapEventToFrontend(response.data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/events/${id}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};

// ==================== Users API ====================
export interface UserResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  year?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'faculty' | 'student' | 'visitor';
  department: string;
  designation: string;
  phone: string;
  specialization: string;
  avatar: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  lastLogin: string;
  year?: string;
}

// Map Spring Boot user to frontend format
function mapUserToFrontend(user: UserResponse): User {
  return {
    id: parseInt(user.id) || 0, // Convert UUID to number (temporary)
    name: user.name,
    email: user.email,
    role: user.role as 'faculty' | 'student' | 'visitor',
    department: user.department || 'General',
    designation: user.role === 'faculty' ? 'Faculty Member' : user.role === 'student' ? 'Student' : 'Visitor',
    phone: '', // Not in DB
    specialization: '', // Not in DB
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
    status: 'active',
    joinedDate: user.createdAt || new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString(),
    year: user.year,
  };
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get<UserResponse[]>('/users');
      return response.data.map(mapUserToFrontend);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${id}`);
      return mapUserToFrontend(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  create: async (user: Partial<UserResponse>): Promise<User> => {
    try {
      const response = await apiClient.post<UserResponse>('/users', user);
      return mapUserToFrontend(response.data);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  update: async (id: string, user: Partial<UserResponse>): Promise<User> => {
    try {
      const response = await apiClient.put<UserResponse>(`/users/${id}`, user);
      return mapUserToFrontend(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// ==================== Feedback API ====================
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
  userType: 'student' | 'faculty' | 'visitor';
  rating: number;
  feedback: string;
  createdAt: string;
  status: 'active' | 'hidden';
}

// Map Spring Boot feedback to frontend format
async function mapFeedbackToFrontend(feedback: FeedbackResponse): Promise<Feedback> {
  let eventName = 'General Event';
  if (feedback.eventId) {
    try {
      const eventResponse = await apiClient.get<EventResponse>(`/events/${feedback.eventId}`);
      eventName = eventResponse.data.title;
    } catch (error) {
      console.error('Error fetching event name for feedback:', error);
    }
  }

  return {
    id: feedback.id,
    eventAttended: eventName,
    name: feedback.name,
    email: feedback.email,
    userType: feedback.userType as 'student' | 'faculty' | 'visitor',
    rating: feedback.rating,
    feedback: feedback.feedback,
    createdAt: feedback.createdAt || new Date().toISOString(),
    status: feedback.status as 'active' | 'hidden',
  };
}

export const feedbackApi = {
  getAll: async (): Promise<Feedback[]> => {
    try {
      const response = await apiClient.get<FeedbackResponse[]>('/feedback');
      const feedbacks = await Promise.all(
        response.data.map(mapFeedbackToFrontend)
      );
      return feedbacks;
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn('Feedback endpoint not found, returning empty array');
        return [];
      }
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Feedback> => {
    try {
      const response = await apiClient.get<FeedbackResponse>(`/feedback/${id}`);
      return await mapFeedbackToFrontend(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  create: async (feedback: Omit<FeedbackResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback> => {
    try {
      const response = await apiClient.post<FeedbackResponse>('/feedback', feedback);
      return await mapFeedbackToFrontend(response.data);
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  update: async (id: number, feedback: Partial<FeedbackResponse>): Promise<Feedback> => {
    try {
      const response = await apiClient.put<FeedbackResponse>(`/feedback/${id}`, feedback);
      return await mapFeedbackToFrontend(response.data);
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/feedback/${id}`);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },
};

// ==================== Gallery API ====================
export interface GalleryResponse {
  id: number;
  eventId?: number;
  event?: any | null; // Can be event object or null
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

// Map Spring Boot gallery to frontend format
function mapGalleryToFrontend(gallery: GalleryResponse): GalleryItem {
  // Handle eventId from either eventId field or event object
  const eventId = gallery.eventId || (gallery.event?.id);
  
  return {
    id: gallery.id,
    imageUrl: gallery.imageUrl,
    altText: gallery.altText,
    year: gallery.year,
    category: gallery.category,
    eventName: gallery.eventName,
    date: gallery.date,
  };
}

export const galleryApi = {
  getAll: async (): Promise<GalleryItem[]> => {
    try {
      const response = await apiClient.get<GalleryResponse[]>('/gallery');
      return response.data.map(mapGalleryToFrontend);
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn('Gallery endpoint not found, returning empty array');
        return [];
      }
      console.error('Error fetching gallery:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<GalleryItem> => {
    try {
      const response = await apiClient.get<GalleryResponse>(`/gallery/${id}`);
      return mapGalleryToFrontend(response.data);
    } catch (error) {
      console.error('Error fetching gallery item:', error);
      throw error;
    }
  },

  create: async (gallery: Omit<GalleryResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryItem> => {
    try {
      const response = await apiClient.post<GalleryResponse>('/gallery', gallery);
      return mapGalleryToFrontend(response.data);
    } catch (error) {
      console.error('Error creating gallery item:', error);
      throw error;
    }
  },

  update: async (id: number, gallery: Partial<GalleryResponse>): Promise<GalleryItem> => {
    try {
      const response = await apiClient.put<GalleryResponse>(`/gallery/${id}`, gallery);
      return mapGalleryToFrontend(response.data);
    } catch (error) {
      console.error('Error updating gallery item:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/gallery/${id}`);
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      throw error;
    }
  },
};

// ==================== Admin API ====================
export interface AdminResponse {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty';
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty';
}

export const adminApi = {
  getAll: async (): Promise<AdminResponse[]> => {
    try {
      const response = await apiClient.get<AdminResponse[]>('/admins');
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  login: async (username: string, password: string): Promise<AdminUser | null> => {
    try {
      const response = await apiClient.post<AdminResponse>('/admins/login', {
        username,
        password,
      });
      // Note: Password should not be returned from backend in production
      // This is just for compatibility with current frontend
      return {
        id: response.data.id,
        username: response.data.username,
        password: '', // Should not store password
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  },
};

// ==================== Event Registrations API ====================
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

export const registrationsApi = {
  getAll: async (): Promise<Registration[]> => {
    try {
      const response = await apiClient.get<EventRegistrationResponse[]>('/event-registrations');
      // Need to fetch user details for each registration
      const registrations = await Promise.all(
        response.data.map(async (reg) => {
          try {
            const userResponse = await apiClient.get<UserResponse>(`/users/${reg.userId}`);
            const user = userResponse.data;
            return {
              eventId: reg.eventId,
              userId: reg.userId,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              registeredAt: reg.registrationDate,
              ticket: reg.ticketNumber,
              checkedIn: reg.checkedIn,
              checkedInAt: reg.checkedInAt,
            };
          } catch (error) {
            console.error('Error fetching user for registration:', error);
            return {
              eventId: reg.eventId,
              userId: reg.userId,
              name: 'Unknown',
              email: '',
              role: 'visitor',
              registeredAt: reg.registrationDate,
              ticket: reg.ticketNumber,
              checkedIn: reg.checkedIn,
              checkedInAt: reg.checkedInAt,
            };
          }
        })
      );
      return registrations;
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn('Event registrations endpoint not found, returning empty array');
        return [];
      }
      console.error('Error fetching registrations:', error);
      throw error;
    }
  },

  getByEventId: async (eventId: number): Promise<Registration[]> => {
    try {
      const response = await apiClient.get<EventRegistrationResponse[]>(`/event-registrations?eventId=${eventId}`);
      const registrations = await Promise.all(
        response.data.map(async (reg) => {
          try {
            const userResponse = await apiClient.get<UserResponse>(`/users/${reg.userId}`);
            const user = userResponse.data;
            return {
              eventId: reg.eventId,
              userId: reg.userId,
              name: user.name,
              email: user.email,
              role: user.role,
              department: user.department,
              registeredAt: reg.registrationDate,
              ticket: reg.ticketNumber,
              checkedIn: reg.checkedIn,
              checkedInAt: reg.checkedInAt,
            };
          } catch (error) {
            console.error('Error fetching user for registration:', error);
            return {
              eventId: reg.eventId,
              userId: reg.userId,
              name: 'Unknown',
              email: '',
              role: 'visitor',
              registeredAt: reg.registrationDate,
              ticket: reg.ticketNumber,
              checkedIn: reg.checkedIn,
              checkedInAt: reg.checkedInAt,
            };
          }
        })
      );
      return registrations;
    } catch (error: any) {
      // If 404, endpoint doesn't exist yet - return empty array
      if (error.response?.status === 404) {
        console.warn('Event registrations endpoint not found, returning empty array');
        return [];
      }
      console.error('Error fetching registrations by event:', error);
      throw error;
    }
  },

  create: async (registration: Omit<EventRegistrationResponse, 'id' | 'registrationDate' | 'createdAt' | 'updatedAt'>): Promise<Registration> => {
    try {
      const response = await apiClient.post<EventRegistrationResponse>('/event-registrations', registration);
      // Fetch user details
      const userResponse = await apiClient.get<UserResponse>(`/users/${response.data.userId}`);
      const user = userResponse.data;
      return {
        eventId: response.data.eventId,
        userId: response.data.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        registeredAt: response.data.registrationDate,
        ticket: response.data.ticketNumber,
        checkedIn: response.data.checkedIn,
        checkedInAt: response.data.checkedInAt,
      };
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  },

  update: async (id: string, registration: Partial<EventRegistrationResponse>): Promise<Registration> => {
    try {
      const response = await apiClient.put<EventRegistrationResponse>(`/event-registrations/${id}`, registration);
      const userResponse = await apiClient.get<UserResponse>(`/users/${response.data.userId}`);
      const user = userResponse.data;
      return {
        eventId: response.data.eventId,
        userId: response.data.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        registeredAt: response.data.registrationDate,
        ticket: response.data.ticketNumber,
        checkedIn: response.data.checkedIn,
        checkedInAt: response.data.checkedInAt,
      };
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/event-registrations/${id}`);
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  },
};

// ==================== Event Bookmarks API ====================
export interface EventBookmarkResponse {
  id: string;
  userId: string;
  eventId: number;
  createdAt?: string;
}

export const bookmarksApi = {
  getAll: async (userId?: string): Promise<number[]> => {
    try {
      const url = userId ? `/event-bookmarks?userId=${userId}` : '/event-bookmarks';
      const response = await apiClient.get<EventBookmarkResponse[]>(url);
      return response.data.map(b => b.eventId);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Endpoint not found - silently return empty array (no error logging)
        return [];
      }
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  },

  create: async (userId: string, eventId: number): Promise<EventBookmarkResponse> => {
    try {
      const response = await apiClient.post<EventBookmarkResponse>('/event-bookmarks', {
        userId,
        eventId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }
  },

  delete: async (userId: string, eventId: number): Promise<void> => {
    try {
      // Try to find bookmark ID first
      const bookmarks = await apiClient.get<EventBookmarkResponse[]>(`/event-bookmarks?userId=${userId}&eventId=${eventId}`);
      if (bookmarks.data.length > 0) {
        await apiClient.delete(`/event-bookmarks/${bookmarks.data[0].id}`);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Bookmark doesn't exist, that's fine
        return;
      }
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  },
};

// ==================== User Auth API ====================
export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'visitor';
  department?: string;
  year?: string;
}

export const userAuthApi = {
  login: async (username: string, password: string): Promise<UserResponse | null> => {
    try {
      // Try to get user by username first, then verify password
      // Note: This assumes backend has a login endpoint or we can get user and verify
      const response = await apiClient.post<UserResponse>('/users/login', {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Try alternative: get all users and find match
        try {
          const usersResponse = await apiClient.get<UserResponse[]>('/users');
          const user = usersResponse.data.find(u => u.username === username);
          // Note: Password verification should be done on backend
          // For now, just return user if found
          return user || null;
        } catch (e) {
          return null;
        }
      }
      console.error('Error during login:', error);
      return null;
    }
  },

  register: async (data: UserRegisterRequest): Promise<UserResponse> => {
    try {
      // Ensure all required fields are present
      const requestData = {
        username: data.username.trim(),
        password: data.password,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        department: data.department?.trim() || undefined,
        year: data.year?.trim() || undefined,
      };

      const response = await apiClient.post<UserResponse>('/users', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error during registration:', error);
      
      // Extract error message from response
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Create a more detailed error
      const detailedError = new Error(errorMessage);
      (detailedError as any).response = error.response;
      (detailedError as any).status = error.response?.status;
      throw detailedError;
    }
  },
};

export default apiClient;
