# AI Work Request 008: Spaces ShadCN Dashboard Migration

## Overview
Complete replacement of the `/spaces` root and below with ShadCN UI Kit Dashboard system, implementing intelligent channel architecture with Payload CMS integration and reusable Leo AI chat control.

## Current State Analysis

### Existing Architecture
- **Current Layout**: AngelOSCommandCenter with complex LCARS-style interface
- **Channel System**: ChannelSwitchboard with hardcoded mock channels
- **Leo AI**: Integrated sidebar component (LeoAssistant) with tactical/business variants
- **Navigation**: Mixed routing between spaces/[spaceId]/[channelId] and spaces/channel/[channelId]
- **Data Source**: Mock data with minimal Payload CMS integration

### Problems to Solve
1. **Inconsistent UI**: LCARS styling doesn't match ShadCN design system
2. **Broken Leo Panel**: Current implementation has popout issues
3. **Mock Data Dependencies**: Hardcoded channels instead of CMS-driven content
4. **Limited Extensibility**: Difficult to add new channel types
5. **No LiveKit Integration**: Missing real-time communication features
6. **Naming Inconsistencies**: Multiple "enhanced/extended" component variants

## Target Architecture (Based on ShadCN Screenshots)

### Dashboard Layout Components
1. **Main Dashboard**: Clean sidebar + content area layout
2. **Sidebar Navigation**: 
   - Collapsible left sidebar with dashboard sections
   - Clean icons and typography
   - User profile section at bottom
3. **Content Areas**:
   - Chat interface with clean message bubbles
   - File manager with grid/list views
   - CRM dashboard with cards and metrics
   - Calendar with event management
   - Notes app with rich text editing

### Channel Architecture
```typescript
interface Channel {
  id: string
  name: string
  type: 'chat' | 'notes' | 'calendar' | 'crm' | 'analytics' | 'files' | 'dashboard'
  displayMode: 'messages' | 'notes' | 'cards' | 'grid' | 'calendar'
  liveKitEnabled: boolean
  payloadCollection?: string
  widgetConfig?: ChannelWidget[]
}
```

## Implementation Tasks

### Phase 1: Foundation Architecture
**Priority**: High | **Complexity**: Medium | **Estimated Effort**: 2-3 days

#### Task 1.1: Create New Spaces Layout System
- **File**: `src/app/(frontend)/spaces/layout.tsx`
- **Action**: Replace with ShadCN-based dashboard layout
- **Requirements**:
  - Clean HTML structure without LCARS styling
  - Responsive sidebar navigation
  - Proper meta tags and SEO optimization
  - Theme provider integration

#### Task 1.2: Implement ShadCN Dashboard Shell
- **File**: `src/components/spaces/ShadcnDashboardShell.tsx`
- **Action**: Create new component based on screenshot layouts
- **Requirements**:
  - Left sidebar with collapsible navigation
  - Main content area with proper overflow handling
  - User profile section with logout functionality
  - Search functionality in header
  - Breadcrumb navigation

#### Task 1.3: Channel Registry System
- **File**: `src/components/spaces/ChannelRegistry.tsx`
- **Action**: Create dynamic channel loading system
- **Requirements**:
  - TypeScript interfaces for all channel types
  - Dynamic component loading with React.lazy
  - Error boundaries for failed channel loads
  - Loading states and skeleton UI

### Phase 2: Channel Implementation
**Priority**: High | **Complexity**: High | **Estimated Effort**: 4-5 days

#### Task 2.1: Chat Channel (Primary)
- **File**: `src/components/spaces/channels/ChatChannel.tsx`
- **Action**: Implement clean chat interface matching screenshots
- **Requirements**:
  - Message bubbles with user avatars
  - File upload support with drag-and-drop
  - Message threading and replies
  - LiveKit voice/video toggle integration
  - Real-time message updates via WebSocket

#### Task 2.2: Notes Channel
- **File**: `src/components/spaces/channels/NotesChannel.tsx`
- **Action**: Rich text editor with collaborative features
- **Requirements**:
  - Lexical editor integration
  - Real-time collaborative editing
  - View toggle: Messages ↔ Notes ↔ Documents
  - Version history and auto-save
  - Export to PDF/Markdown

#### Task 2.3: Dashboard Channel
- **File**: `src/components/spaces/channels/DashboardChannel.tsx`
- **Action**: Business metrics dashboard with widgets
- **Requirements**:
  - Drag-and-drop widget grid
  - Chart.js integration for analytics
  - KPI cards with trend indicators
  - Customizable widget configuration
  - Real-time data updates

#### Task 2.4: File Manager Channel
- **File**: `src/components/spaces/channels/FilesChannel.tsx`
- **Action**: File management interface matching screenshots
- **Requirements**:
  - Grid and list view toggles
  - File upload with progress indicators
  - Folder navigation and breadcrumbs
  - File preview and download
  - Search and filtering capabilities

#### Task 2.5: CRM Channel
- **File**: `src/components/spaces/channels/CRMChannel.tsx`
- **Action**: Customer relationship management interface
- **Requirements**:
  - Lead pipeline with drag-and-drop
  - Contact management with search
  - Activity timeline and notes
  - Task management integration
  - Revenue tracking and forecasting

#### Task 2.6: Calendar Channel
- **File**: `src/components/spaces/channels/CalendarChannel.tsx`
- **Action**: Event management with scheduling
- **Requirements**:
  - Month/week/day view toggles
  - Event creation and editing modal
  - Recurring event support
  - Integration with appointment booking
  - Color-coded event categories

### Phase 3: Leo AI Rewrite
**Priority**: High | **Complexity**: Medium | **Estimated Effort**: 2-3 days

#### Task 3.1: Reusable Chat Control Component
- **File**: `src/components/ui/ChatControl.tsx`
- **Action**: Extract and rewrite Leo AI as standalone component
- **Requirements**:
  - Framework-agnostic design for external hosting
  - WebSocket support for real-time messaging
  - Provider-agnostic AI integration (OpenAI, Claude, etc.)
  - Customizable themes and branding
  - Voice input/output capabilities
  - File sharing and image analysis

#### Task 3.2: Leo Configuration System
- **File**: `src/components/spaces/LeoConfiguration.tsx`
- **Action**: Configuration panel for Leo AI behavior
- **Requirements**:
  - Personality mode selection (Business/Tactical/Custom)
  - AI provider selection and API key management
  - Context window and memory settings
  - Custom prompt templates
  - Integration with Corina AI system

#### Task 3.3: Leo Integration Points
- **Files**: Multiple channel components
- **Action**: Integrate Leo chat control into all channels
- **Requirements**:
  - Context-aware responses based on channel type
  - Channel-specific AI capabilities
  - Seamless handoff between channels
  - Persistent conversation history

### Phase 4: Payload CMS Integration
**Priority**: Medium | **Complexity**: Medium | **Estimated Effort**: 2-3 days

#### Task 4.1: Channel Collection Schema
- **File**: `src/collections/Channels.ts`
- **Action**: Create Payload collection for dynamic channels
- **Requirements**:
  - Channel metadata and configuration
  - Access control and permissions
  - Widget configuration storage
  - Activity logging and analytics

#### Task 4.2: Real-time Sync Service
- **File**: `src/services/ChannelSyncService.ts`
- **Action**: WebSocket service for real-time updates
- **Requirements**:
  - Channel subscription management
  - Message broadcasting
  - Conflict resolution for concurrent edits
  - Offline support with sync queues

#### Task 4.3: API Route Optimization
- **Files**: `src/app/api/spaces/**/*.ts`
- **Action**: Optimize API routes for new architecture
- **Requirements**:
  - GraphQL endpoint for complex queries
  - Caching strategy with Redis
  - Rate limiting and security
  - Error handling and logging

### Phase 5: LiveKit Integration
**Priority**: Medium | **Complexity**: High | **Estimated Effort**: 3-4 days

#### Task 5.1: LiveKit Service Layer
- **File**: `src/services/LiveKitService.ts`
- **Action**: WebRTC integration for voice/video
- **Requirements**:
  - Room creation and management
  - Participant permissions and controls
  - Screen sharing capabilities
  - Recording and playback features

#### Task 5.2: Voice/Video UI Components
- **File**: `src/components/ui/LiveKitControls.tsx`
- **Action**: UI controls for voice/video features
- **Requirements**:
  - Mute/unmute and camera toggle
  - Participant grid and speaker view
  - Chat overlay during calls
  - Quality settings and diagnostics

### Phase 6: View Switching System
**Priority**: Low | **Complexity**: Medium | **Estimated Effort**: 1-2 days

#### Task 6.1: View Toggle Component
- **File**: `src/components/spaces/ViewToggle.tsx`
- **Action**: Unified view switching for all channels
- **Requirements**:
  - Tab-based view selection
  - Smooth transitions with Framer Motion
  - Persistent view preferences
  - Keyboard shortcuts for power users

#### Task 6.2: Channel View Adapters
- **Files**: Multiple channel components
- **Action**: Implement view switching logic
- **Requirements**:
  - Messages view: Traditional chat interface
  - Notes view: Rich text document editor
  - Cards view: Kanban-style task management
  - Grid view: File/media gallery
  - Calendar view: Event scheduling interface

### Phase 7: Cleanup and Optimization
**Priority**: Low | **Complexity**: Low | **Estimated Effort**: 1 day

#### Task 7.1: Component Consolidation
- **Action**: Remove all enhanced/extended/revised components
- **Requirements**:
  - Merge duplicate functionality
  - Update all imports and references
  - Remove unused files and dependencies
  - Update TypeScript definitions

#### Task 7.2: Performance Optimization
- **Action**: Optimize bundle size and runtime performance
- **Requirements**:
  - Code splitting for channel components
  - Image optimization and lazy loading
  - Service worker for offline support
  - Performance monitoring and metrics

## API Integrations

### Payload CMS Collections
```typescript
// Spaces Collection (existing)
interface Space {
  id: string
  name: string
  description: string
  tenant: Tenant
  channels: Channel[]
  members: SpaceMembership[]
}

// New Channels Collection
interface Channel {
  id: string
  name: string
  slug: string
  type: ChannelType
  space: Space
  configuration: ChannelConfig
  liveKitRoom?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Channel Messages Collection
interface ChannelMessage {
  id: string
  channel: Channel
  author: User
  content: string
  messageType: 'text' | 'file' | 'system' | 'ai'
  metadata?: MessageMetadata
  threadParent?: ChannelMessage
  reactions: MessageReaction[]
  createdAt: Date
}
```

### External Service Integration
- **Leo AI**: `/api/leo-chat` endpoint with multi-provider support
- **LiveKit**: WebRTC room management and signaling
- **File Storage**: Payload Media with cloud storage backend
- **Search**: Elasticsearch for full-text search across channels
- **Analytics**: Custom metrics collection for business intelligence

## Testing Strategy

### Unit Tests
- All new components with Jest and React Testing Library
- Service layer tests with mocked dependencies
- Payload CMS collection validation tests

### Integration Tests
- End-to-end channel navigation and messaging
- Leo AI conversation flows
- LiveKit voice/video functionality
- File upload and management workflows

### Performance Tests
- Bundle size analysis and optimization
- Runtime performance profiling
- WebSocket connection stability
- Database query optimization

## Migration Path

### Phase 1: Parallel Development
- Develop new system alongside existing implementation
- Use feature flags to control rollout
- Maintain backward compatibility during transition

### Phase 2: Gradual Rollout
- Enable new system for beta users
- Monitor performance and gather feedback
- Fix issues and optimize based on real usage

### Phase 3: Full Migration
- Switch all users to new system
- Remove old components and routes
- Clean up legacy code and dependencies

## Success Criteria

### Functional Requirements
- ✅ All channel types working with ShadCN UI components
- ✅ Leo AI chat control reusable for external hosting
- ✅ LiveKit integration functional across all channels
- ✅ View switching works seamlessly in all contexts
- ✅ Payload CMS integration provides dynamic channel management
- ✅ No enhanced/extended/revised component naming

### Performance Requirements
- ✅ Page load time < 2 seconds on 3G connection
- ✅ Real-time message delivery < 100ms latency
- ✅ Voice/video calls establish < 3 seconds
- ✅ File uploads progress smoothly with visual feedback
- ✅ Bundle size reduced by 30% from current implementation

### User Experience Requirements
- ✅ Intuitive navigation matching modern dashboard patterns
- ✅ Responsive design works on mobile and desktop
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Smooth animations and transitions
- ✅ Consistent visual design across all channels

## Risk Mitigation

### Technical Risks
- **WebRTC Complexity**: Extensive testing across browsers and networks
- **Real-time Sync**: Implement conflict resolution and offline support
- **Performance**: Continuous monitoring and optimization
- **Security**: Comprehensive access control and input validation

### Business Risks
- **User Adoption**: Gradual rollout with training and support
- **Data Migration**: Comprehensive backup and rollback procedures
- **Integration Issues**: Thorough testing with existing systems
- **Timeline Pressure**: Agile development with regular checkpoints

## Conclusion

This migration represents a significant architectural improvement that will:
1. **Modernize the UI** with clean, professional ShadCN components
2. **Improve Maintainability** with better code organization and patterns
3. **Enhance Functionality** with LiveKit, view switching, and Leo AI improvements
4. **Increase Flexibility** with dynamic channel loading and configuration
5. **Prepare for Scale** with proper API design and performance optimization

The estimated total effort is **15-20 development days** across all phases, with the ability to deliver incrementally and gather feedback throughout the process.
