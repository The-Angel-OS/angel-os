import { z } from "zod"

// Profile Settings Schema
export const profileSettingsSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio too long").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  urls: z.array(z.string().url("Invalid URL")).max(5, "Maximum 5 URLs allowed").optional(),
  timezone: z.string().optional(),
  language: z.string().default("en"),
})

export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>

// Account Settings Schema
export const accountSettingsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  confirmPassword: z.string().optional(),
  twoFactorEnabled: z.boolean().default(false),
  loginNotifications: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>

// Appearance Settings Schema
export const appearanceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").default("#3b82f6"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  sidebarCollapsed: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
})

export type AppearanceSettingsFormData = z.infer<typeof appearanceSettingsSchema>

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  emailNotifications: z.object({
    newMessages: z.boolean().default(true),
    orderUpdates: z.boolean().default(true),
    systemAlerts: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
    weeklyDigest: z.boolean().default(true),
  }),
  pushNotifications: z.object({
    enabled: z.boolean().default(false),
    newMessages: z.boolean().default(true),
    mentions: z.boolean().default(true),
    systemAlerts: z.boolean().default(true),
  }),
  inAppNotifications: z.object({
    sound: z.boolean().default(true),
    desktop: z.boolean().default(true),
    mentions: z.boolean().default(true),
  }),
})

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>

// Integration Settings Schema
export const integrationSettingsSchema = z.object({
  googleCalendar: z.object({
    enabled: z.boolean().default(false),
    calendarId: z.string().optional(),
    syncDirection: z.enum(["import", "export", "bidirectional"]).default("bidirectional"),
  }),
  googlePhotos: z.object({
    enabled: z.boolean().default(false),
    albumId: z.string().optional(),
    autoSync: z.boolean().default(false),
    syncFrequency: z.enum(["hourly", "daily", "weekly"]).default("daily"),
  }),
  googleDrive: z.object({
    enabled: z.boolean().default(false),
    folderId: z.string().optional(),
    autoSync: z.boolean().default(false),
    fileTypes: z.array(z.string()).default(["jpg", "png", "pdf", "doc", "docx"]),
  }),
  socialMedia: z.object({
    facebook: z.object({
      enabled: z.boolean().default(false),
      pageId: z.string().optional(),
      autoPost: z.boolean().default(false),
    }),
    instagram: z.object({
      enabled: z.boolean().default(false),
      accountId: z.string().optional(),
      autoPost: z.boolean().default(false),
    }),
    twitter: z.object({
      enabled: z.boolean().default(false),
      accountId: z.string().optional(),
      autoPost: z.boolean().default(false),
    }),
  }),
})

export type IntegrationSettingsFormData = z.infer<typeof integrationSettingsSchema>

// Display Settings Schema
export const displaySettingsSchema = z.object({
  layout: z.enum(["default", "compact", "expanded"]).default("default"),
  itemsPerPage: z.number().min(10).max(100).default(20),
  showSidebar: z.boolean().default(true),
  showMinimap: z.boolean().default(false),
  gridView: z.boolean().default(false),
  showPreview: z.boolean().default(true),
})

export type DisplaySettingsFormData = z.infer<typeof displaySettingsSchema>


