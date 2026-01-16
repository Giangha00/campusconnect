// Re-export from modular API structure for backward compatibility
// This file is kept to maintain existing imports

export { apiClient, default } from "./api/api-client";

// Export all API modules
export { eventsApi } from "./api/events";
export { usersApi } from "./api/users";
export { feedbackApi } from "./api/feedback";
export { galleryApi } from "./api/gallery";
export { adminApi } from "./api/admin";
export { registrationsApi } from "./api/registrations";
export { bookmarksApi } from "./api/bookmarks";
export { userAuthApi } from "./api/auth";

// Export all types
export type {
  EventResponse,
  Event,
  UserResponse,
  User,
  FeedbackResponse,
  Feedback,
  GalleryResponse,
  GalleryItem,
  AdminResponse,
  AdminUser,
  EventRegistrationResponse,
  Registration,
  EventBookmarkResponse,
  UserLoginRequest,
  UserRegisterRequest,
} from "./api/types";
