// src/types/user-preferences.ts

export interface UserPreferences {
  activityLog?: {
    timestamp: string;
    event: string; // e.g., 'item_created', 'login', 'profile_updated'
    collectionName?: string; // e.g., 'products', 'orders'
    itemId?: string; // ID of the item related to the event
    details?: Record<string, any>; // Any additional structured data about the event
    ipAddress?: string; // Optional: for security-related logs
    userAgent?: string; // Optional: for session-related logs
  }[];

  theme?: 'light' | 'dark' | 'auto'; // From Users.theme
  timezone?: string; // From Users.timezone. Example: 'America/New_York'

  // From Users.privacySettings
  privacySettings?: {
    profileVisibility?: 'public' | 'members_only' | 'private';
    allowDirectMessages?: boolean;
    showOnlineStatus?: boolean;
    emailNotifications?: boolean; // This could be more granular in a dedicated notification settings section
  };

  // Example for more granular notification preferences if needed later
  // notificationSettings?: {
  //   email?: {
  //     newMessages?: boolean;
  //     orderUpdates?: boolean;
  //     systemAnnouncements?: boolean;
  //   };
  //   push?: {
  //     newMessages?: boolean;
  //     mentions?: boolean;
  //   };
  // };

  // Any other user-specific preferences can be added here.
  // For example, language, itemsPerPage for lists, default sorting, etc.
  language?: string; // e.g., 'en', 'es'
  dashboardLayout?: Record<string, any>; // User-customized dashboard configuration
}
