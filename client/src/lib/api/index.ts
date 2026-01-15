// Re-export everything for backward compatibility
// This allows existing imports like `import { eventsApi } from '@/lib/api'` to still work

export { apiClient, default } from "./api-client";

// Export all API modules
export { eventsApi } from "./events";
export { usersApi } from "./users";
export { feedbackApi } from "./feedback";
export { galleryApi } from "./gallery";
export { adminApi } from "./admin";
export { registrationsApi } from "./registrations";
export { bookmarksApi } from "./bookmarks";
export { userAuthApi } from "./auth";

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
} from "./types";
