"use client"

import { UniversalChatBubble } from './UniversalChatBubble'

interface ChatProviderProps {
  variant?: 'admin' | 'frontend' | 'spaces'
  pageContext?: string
  userContext?: any
  spaceId?: number
  tenantId?: number
  className?: string
  // For sidebar usage
  inline?: boolean
  compact?: boolean
}

/**
 * ChatProvider - Simple wrapper around UniversalChatBubble
 * 
 * This component provides a clean interface for using the existing
 * UniversalChatBubble in different contexts while maintaining all
 * existing functionality and connecting to the real message pump.
 */
export function ChatProvider({
  variant = 'frontend',
  pageContext,
  userContext,
  spaceId,
  tenantId,
  className = '',
  inline = false,
  compact = false
}: ChatProviderProps) {
  
  // For inline usage (sidebar, embedded), we could modify the bubble behavior
  // but for now, let's keep it simple and use the existing bubble
  
  return (
    <UniversalChatBubble
      variant={variant}
      pageContext={pageContext}
      userContext={userContext}
      className={className}
    />
  )
}

// Export for easy usage in different contexts
export const SidebarChat = (props: Omit<ChatProviderProps, 'inline' | 'compact'>) => (
  <ChatProvider {...props} inline compact />
)

export const PublicSiteChat = (props: Omit<ChatProviderProps, 'variant'>) => (
  <ChatProvider {...props} variant="frontend" />
)

export const AdminChat = (props: Omit<ChatProviderProps, 'variant'>) => (
  <ChatProvider {...props} variant="admin" />
)

export const SpacesChat = (props: Omit<ChatProviderProps, 'variant'>) => (
  <ChatProvider {...props} variant="spaces" />
)
