# V0.dev Specification: Angel OS Spaces Dashboard

## Overview
Create a modern, responsive dashboard interface for Angel OS Spaces using ShadCN UI components, implementing a dynamic channel-based workspace with role-based permissions and AI integration.

## Design System
- **Framework**: React with TypeScript
- **UI Library**: ShadCN/UI components
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: Dark/Light mode support

## Layout Architecture

### Main Dashboard Shell
```typescript
interface DashboardShell {
  sidebar: CollapsibleSidebar
  header: TopNavigationHeader
  mainContent: DynamicChannelContent
  aiChat?: OptionalLeoAISidebar
}
```

### Sidebar Navigation (280px width, collapsible)
**Top Section:**
- Angel OS logo with space selector dropdown
- Search bar for channels/content
- User avatar with status indicator

**Channels Section:**
- Channel list with icons and unread badges
- Channel types: Chat, Notes, Calendar, CRM, Analytics, Files, Dashboard
- Create channel button with type selection
- Channel categories/folders support

**Bottom Section:**
- User profile with dropdown menu
- Settings and logout options
- Online status indicator

### Header Bar (56px height)
**Left Side:**
- Hamburger menu (when sidebar collapsed)
- Breadcrumb navigation (Space > Channel)
- Channel type indicator icon

**Right Side:**
- LiveKit controls (when applicable)
- Leo AI toggle button
- Notifications bell
- Settings gear
- User avatar (mobile)

## Channel Types & Dynamic Loading

### 1. Chat Channels
**Interface Pattern**: Messaging application
- Message list with user avatars
- Rich text input with file upload
- Thread support and replies
- Voice/video call integration
- Message search and filtering
- User presence indicators

### 2. Notes Channels  
**Interface Pattern**: Collaborative document editor
- Rich text editor (Lexical/TipTap)
- Real-time collaborative editing
- Version history sidebar
- Comment system
- Export options (PDF, Markdown)
- Template library

### 3. Dashboard Channels
**Interface Pattern**: Business intelligence dashboard
- Drag-and-drop widget grid
- Chart.js integration for analytics
- KPI cards with trend indicators
- Customizable layout
- Data filtering and date ranges
- Export and sharing options

### 4. Calendar Channels
**Interface Pattern**: Event management system
- Month/week/day view toggles
- Event creation modal
- Drag-and-drop scheduling
- Recurring event support
- Integration with booking system
- Color-coded categories

### 5. CRM Channels
**Interface Pattern**: Customer relationship management
- Lead pipeline with drag-and-drop
- Contact list with search/filter
- Activity timeline
- Task management
- Revenue tracking charts
- Email integration preview

### 6. Files Channels
**Interface Pattern**: File management system
- Grid/list view toggle
- Folder navigation with breadcrumbs
- File preview panel
- Drag-and-drop upload
- Search and filtering
- Version control for documents

### 7. Analytics Channels
**Interface Pattern**: Business intelligence reports
- Chart gallery with multiple visualizations
- Data table with sorting/filtering
- Export capabilities
- Custom report builder
- Scheduled report delivery
- Dashboard sharing options

## Permission System Integration

### User Role Display
```typescript
interface UserPermissions {
  canViewChannel: boolean
  canEditContent: boolean
  canInviteUsers: boolean
  canManageSettings: boolean
  canAccessAnalytics: boolean
}
```

### Content Filtering
- Channels only show if user has view permissions
- Features disabled based on role restrictions
- Paywall indicators for premium content
- Guest user experience with limited access

### Permission Indicators
- Lock icons for restricted content
- Upgrade prompts for premium features
- Role badges in user lists
- Permission tooltips on hover

## AI Integration (Leo Assistant)

### Chat Interface (320px sidebar)
- Collapsible from right side
- Context-aware responses based on current channel
- Voice input/output support
- File sharing capabilities
- Conversation history
- AI model selection (OpenAI, Claude, etc.)

### Channel-Specific AI Features
- **Chat**: Message suggestions, sentiment analysis
- **Notes**: Writing assistance, grammar checking
- **Dashboard**: Data insights, anomaly detection
- **Calendar**: Smart scheduling suggestions
- **CRM**: Lead scoring, next action recommendations
- **Files**: Content summarization, tag suggestions
- **Analytics**: Trend analysis, forecast generation

## Component Specifications

### Sidebar Component
```typescript
interface SidebarProps {
  spaces: Space[]
  channels: Channel[]
  currentUser: User
  activeSpace: Space
  activeChannel: Channel
  onChannelSelect: (channel: Channel) => void
  onSpaceSelect: (space: Space) => void
  collapsed: boolean
  onToggleCollapse: () => void
}
```

### Channel Content Component
```typescript
interface ChannelContentProps {
  channel: Channel
  user: User
  permissions: UserPermissions
  onContentChange?: (content: any) => void
  liveKitEnabled?: boolean
}
```

### Header Component
```typescript
interface HeaderProps {
  currentSpace: Space
  currentChannel: Channel
  user: User
  onSidebarToggle: () => void
  onLeoToggle: () => void
  showLiveKitControls: boolean
}
```

## Responsive Design

### Desktop (1024px+)
- Full sidebar visible
- Three-column layout (sidebar, content, optional Leo chat)
- All features accessible

### Tablet (768px - 1024px)
- Collapsible sidebar overlay
- Two-column layout
- Swipe gestures for navigation

### Mobile (< 768px)
- Bottom navigation bar
- Full-screen channel content
- Drawer-style sidebar
- Simplified header

## State Management

### Global State
```typescript
interface AppState {
  currentUser: User
  currentSpace: Space
  currentChannel: Channel
  sidebarCollapsed: boolean
  leoVisible: boolean
  notifications: Notification[]
  connectionStatus: 'online' | 'offline' | 'connecting'
}
```

### Channel State
```typescript
interface ChannelState {
  content: any
  participants: User[]
  lastActivity: Date
  unreadCount: number
  loading: boolean
  error?: string
}
```

## Real-time Features

### WebSocket Integration
- Live channel updates
- User presence indicators
- Real-time collaboration
- Notification delivery
- Connection status monitoring

### LiveKit Integration
- Voice/video calls in channels
- Screen sharing capabilities
- Recording functionality
- Participant management
- Quality controls

## Data Flow Architecture

### Payload CMS Collections
```typescript
// Core Collections
interface Collections {
  spaces: Space[]           // Workspace containers
  channels: Channel[]       // Dynamic content channels
  messages: Message[]       // Universal message system
  users: User[]            // User management with roles
  memberships: Membership[] // Space/channel access control
}

// Extended Collections
interface ExtendedCollections {
  posts: Post[]            // Content management
  products: Product[]      // E-commerce integration
  forms: Form[]           // Dynamic form builder
  analytics: Analytics[]   // Business intelligence
  workflows: Workflow[]    // Automation rules
}
```

### API Integration
```typescript
interface APIEndpoints {
  '/api/spaces': SpaceOperations
  '/api/channels': ChannelOperations
  '/api/messages': MessageOperations
  '/api/leo-chat': AIAssistantAPI
  '/api/livekit': WebRTCManagement
  '/api/analytics': BusinessIntelligence
}
```

## Security & Privacy

### Authentication Flow
- JWT token-based authentication
- Refresh token rotation
- Session management
- Multi-factor authentication support

### Data Protection
- End-to-end encryption for sensitive data
- GDPR compliance
- Data retention policies
- Audit logging

### Access Control
- Role-based permissions (RBAC)
- Channel-level access control
- Content-based restrictions
- API rate limiting

## Performance Optimizations

### Code Splitting
- Lazy load channel components
- Dynamic imports for features
- Route-based splitting
- Component-level splitting

### Caching Strategy
- React Query for API caching
- LocalStorage for user preferences
- Service Worker for offline support
- CDN for static assets

### Bundle Optimization
- Tree shaking unused code
- Image optimization
- Font subsetting
- Compression and minification

## Accessibility Features

### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus management
- ARIA labels and descriptions

### User Experience
- Loading states and skeletons
- Error boundaries with recovery
- Offline mode indicators
- Progressive enhancement

## Implementation Examples

### Channel Switcher Component
```jsx
<div className="space-y-1">
  {channels.map((channel) => (
    <ChannelButton
      key={channel.id}
      channel={channel}
      active={activeChannel?.id === channel.id}
      unreadCount={channel.unreadCount}
      liveKitEnabled={channel.liveKitEnabled}
      onClick={() => onChannelSelect(channel)}
      permissions={getUserPermissions(user, channel)}
    />
  ))}
</div>
```

### Dynamic Content Loader
```jsx
<Suspense fallback={<ChannelSkeleton />}>
  {activeChannel?.type === 'chat' && <ChatChannel {...props} />}
  {activeChannel?.type === 'notes' && <NotesChannel {...props} />}
  {activeChannel?.type === 'dashboard' && <DashboardChannel {...props} />}
  {activeChannel?.type === 'calendar' && <CalendarChannel {...props} />}
  {activeChannel?.type === 'crm' && <CRMChannel {...props} />}
  {activeChannel?.type === 'files' && <FilesChannel {...props} />}
  {activeChannel?.type === 'analytics' && <AnalyticsChannel {...props} />}
</Suspense>
```

### Permission-Based Rendering
```jsx
<PermissionGate 
  permissions={userPermissions} 
  required="canViewChannel"
  fallback={<PaywallPrompt />}
>
  <ChannelContent channel={activeChannel} />
</PermissionGate>
```

## Success Criteria

### Functional Requirements
- ✅ All channel types render correctly with ShadCN components
- ✅ Smooth navigation between channels and spaces
- ✅ Real-time updates and collaboration
- ✅ Permission-based access control working
- ✅ Leo AI integration functional
- ✅ LiveKit voice/video calls operational
- ✅ Responsive design across all devices

### Performance Requirements
- ✅ Initial page load < 2 seconds
- ✅ Channel switching < 500ms
- ✅ Real-time message delivery < 100ms
- ✅ Bundle size optimized for fast loading
- ✅ Smooth animations at 60fps

### User Experience Requirements
- ✅ Intuitive navigation patterns
- ✅ Consistent visual design
- ✅ Accessible to all users
- ✅ Works offline with service worker
- ✅ Error handling with graceful degradation

This specification provides a comprehensive blueprint for creating a modern, scalable workspace dashboard that combines the best of ShadCN UI design patterns with powerful business functionality and AI integration.
