# Dynamic Permission-Based Control Panels Implementation

**Priority:** High  
**Type:** Enhancement  
**Status:** In Progress  
**Created:** 2025-01-19  
**Agent:** Assistant (Current)

## Executive Summary

Transform the existing tenant-control panel into a universal, permission-aware control system that dynamically configures itself based on user roles and permissions. This creates a single, scalable interface for managing all Angel OS entities (Tenants, Spaces, Products, Users, etc.) while maintaining the beautiful LCARS UX already implemented.

## Current State

### What's Working
- ✅ Angel OS Command Center with LCARS interface
- ✅ Bouncing side panels (File Explorer, Leo AI)
- ✅ System Console for monitoring and debugging
- ✅ UnifiedTenantControl component for tenant management
- ✅ Beautiful animations and Avatar color scheme

### What's Needed
- ❌ Permission-based UI configuration
- ❌ Dynamic module loading based on user role
- ❌ Spaces control panel
- ❌ Products control panel
- ❌ Users control panel
- ❌ Universal routing system

## Proposed Architecture

### 1. Universal Control Panel Route
```
/control/[entity]/[action]

Examples:
- /control/tenants/manage
- /control/spaces/create
- /control/products/inventory
- /control/users/permissions
```

### 2. Permission System Integration

```typescript
interface ControlPanelConfig {
  modules: {
    tenants?: {
      enabled: boolean
      permissions: ['create', 'read', 'update', 'delete']
      actions: ControlAction[]
    }
    spaces?: {
      enabled: boolean
      permissions: ['create', 'read', 'update', 'delete']
      actions: ControlAction[]
    }
    products?: {
      enabled: boolean
      permissions: ['create', 'read', 'update', 'delete']
      actions: ControlAction[]
    }
    users?: {
      enabled: boolean
      permissions: ['create', 'read', 'update', 'delete']
      actions: ControlAction[]
    }
  }
}
```

### 3. Component Structure

```
src/components/
  UniversalControl/
    index.tsx                 # Main controller
    PermissionGate.tsx       # Permission checking wrapper
    ModuleLoader.tsx         # Dynamic module loading
    modules/
      TenantModule/          # Existing tenant functionality
      SpaceModule/           # New space management
      ProductModule/         # Product management
      UserModule/            # User management
    hooks/
      usePermissions.ts      # Permission checking
      useControlConfig.ts    # Dynamic configuration
```

## Implementation Tasks

### Phase 1: Foundation (Current)
- [x] Angel OS Command Center wrapper
- [x] LCARS UI implementation
- [x] System Console integration
- [ ] Permission system design

### Phase 2: Core Refactoring
- [ ] Create UniversalControl component
- [ ] Implement PermissionGate wrapper
- [ ] Add usePermissions hook
- [ ] Create dynamic routing system
- [ ] Refactor UnifiedTenantControl into TenantModule

### Phase 3: Module Implementation
- [ ] SpaceModule - Complete space management
  - List all spaces
  - Create/edit space
  - Space settings
  - Space analytics
- [ ] ProductModule - Product management
  - Product catalog
  - Inventory management
  - Pricing controls
  - Product analytics
- [ ] UserModule - User management
  - User list
  - Role assignment
  - Permission management
  - Activity logs

### Phase 4: Permission Integration
- [ ] Connect to Payload CMS role system
- [ ] Implement role-based UI hiding/showing
- [ ] Add permission checks to all actions
- [ ] Create permission denied states
- [ ] Add audit logging for all actions

### Phase 5: Polish & Enhancement
- [ ] Add keyboard shortcuts for power users
- [ ] Implement bulk operations
- [ ] Add export/import functionality
- [ ] Create help system integration
- [ ] Add customizable dashboards

## Technical Specifications

### Permission Checking
```typescript
// Example permission check
const canCreateTenant = usePermission('tenants.create')
const canViewSpaces = usePermission('spaces.read')
const canEditProduct = usePermission('products.update', productId)
```

### Module Registration
```typescript
// Modules self-register their capabilities
registerModule({
  id: 'spaces',
  name: 'Space Management',
  icon: '🏢',
  requiredPermissions: ['spaces.read'],
  routes: [
    { path: 'list', component: SpaceList },
    { path: 'create', component: SpaceCreate, permission: 'spaces.create' },
    { path: ':id/edit', component: SpaceEdit, permission: 'spaces.update' }
  ]
})
```

### Dynamic Navigation
```typescript
// Navigation automatically built from available modules
const navigation = useModuleNavigation() // Returns only permitted modules
```

## Success Criteria

1. **Single Control Panel** - One unified interface for all management tasks
2. **Permission Aware** - UI adapts to user's actual permissions
3. **Consistent UX** - Same beautiful LCARS experience everywhere
4. **Modular** - Easy to add new management modules
5. **Performant** - Fast loading and switching between modules
6. **Secure** - All actions properly permission-checked

## API Endpoints Required

### Permission Check Endpoint
```
GET /api/auth/permissions
Response: {
  user: { id, email, role },
  permissions: {
    tenants: ['create', 'read', 'update', 'delete'],
    spaces: ['read'],
    products: ['read', 'update'],
    users: []
  }
}
```

### Module Configuration Endpoint
```
GET /api/control/config
Response: {
  modules: [...available modules based on permissions],
  settings: {...user preferences}
}
```

## Migration Path

1. Keep existing routes working (/tenant-control, /tactical-control)
2. Implement new universal system alongside
3. Gradually migrate features to new system
4. Deprecate old routes once stable
5. Redirect old routes to new system

## Testing Requirements

- [ ] Unit tests for permission checking
- [ ] Integration tests for module loading
- [ ] E2E tests for each module
- [ ] Permission denial testing
- [ ] Performance testing with many modules
- [ ] Accessibility testing

## Documentation Needs

- [ ] Developer guide for adding new modules
- [ ] Permission system documentation
- [ ] User guide for each module
- [ ] API documentation
- [ ] Migration guide

## Notes

- The current tenant-control is an excellent prototype
- We should preserve all the beautiful UI work
- Focus on making it data-driven and permission-aware
- Consider using React.lazy() for code splitting modules
- System Console should log all permission checks and denials

## References

- Current Implementation: `/tenant-control`, `/tactical-control`
- Angel OS UX Guide: `/docs/ANGEL_OS_UX_DESIGN_GUIDE.md`
- Payload Multi-tenant: `@payloadcms/plugin-multi-tenant`

## Immediate UX Fixes Required

### 1. Leo Assistant Chat Experience
**Problem:** Chat doesn't properly hug/scroll from bottom  
**Solution:**
- Implement reverse scroll direction (newest messages at bottom)
- Use `flex-direction: column-reverse` for message container
- Auto-scroll to bottom on new messages
- Keep input field pinned to bottom

### 2. Excessive Vertical Scroll Issue
**Problem:** ~200px extra padding forcing unnecessary page scroll  
**Solution:**
- Audit all container heights - use `h-screen` with proper calculations
- Remove any margin/padding on outer containers
- Ensure main content area uses `calc(100vh - header - console)`
- Check for hidden overflow elements

### 3. Status Bar Positioning
**Problem:** Status bar is below the main frame instead of above  
**Solution:**
- Move "Spaces Commerce / Premium Tenant / Guardian Active" bar above main content
- This should be part of the header hierarchy, not within the content frame
- Structure:
  ```
  Header (Angel OS Intelligence)
  └── Status Bar (Tenant Info)
      └── Navigation Tabs (Dashboard, Browser, etc.)
          └── Main Content Frame
  ```

### 4. Channels Navigation Implementation
**Problem:** "Channels" section in file explorer not wired up  
**Solution:** Channels as navigation contexts that load appropriate control interfaces

#### Channel Architecture
Channels aren't just chat rooms - they're navigation contexts that load different functional areas:
- `#general` - Loads chat/communication interface
- `#orders` - Loads order management dashboard
- `#analytics` - Loads analytics dashboard
- `#products` - Loads product catalog manager

#### Benefits
- **Familiar UX** - Users understand channels from Discord/Slack
- **Extensible** - Easy to add new channel types
- **Permission-Aware** - Channels hidden based on user role
- **Context Switching** - Clean mental model for different work modes
- **Real-time Badges** - Show pending items naturally

### Implementation Order
1. Fix Leo Assistant chat scrolling (Priority: High)
2. Fix excessive scroll/padding (Priority: High)
3. Reposition status bar (Priority: Medium)
4. Wire up channels (Priority: Medium)

### Technical Details

#### Leo Assistant Fixes
```css
/* Message container */
.leo-messages {
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  flex: 1;
}

/* Keep newest at bottom */
.leo-input-container {
  position: sticky;
  bottom: 0;
  background: inherit;
}
```

#### Height Calculations
```typescript
// Proper height management
const mainContentHeight = `calc(100vh - ${headerHeight}px - ${statusBarHeight}px - ${consoleHeight}px)`
```

#### Channel Navigation Structure
```typescript
interface Channel {
  id: string
  name: string
  icon: string
  type: 'chat' | 'orders' | 'analytics' | 'products' | 'custom'
  component: ChannelComponent
  permissions?: string[]
  badge?: number | string
  description?: string
}

type ChannelComponent = 
  | 'ChatContainer'      // Real-time chat interface
  | 'OrdersManager'      // Order management dashboard
  | 'AnalyticsDashboard' // Real-time metrics
  | 'ProductCatalog'     // Product management
  | 'CustomComponent'    // Extensible for future

const channels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    icon: '#',
    type: 'chat',
    component: 'ChatContainer',
    description: 'Team communication'
  },
  {
    id: 'orders',
    name: 'orders',
    icon: '📦',
    type: 'orders',
    component: 'OrdersManager',
    badge: 3,
    permissions: ['orders.read']
  },
  {
    id: 'analytics',
    name: 'analytics',
    icon: '📊',
    type: 'analytics',
    component: 'AnalyticsDashboard',
    permissions: ['analytics.view']
  },
  {
    id: 'products',
    name: 'products',
    icon: '🛍️',
    type: 'products',
    component: 'ProductCatalog',
    permissions: ['products.read']
  }
]
```

#### Channel Router Implementation
```typescript
// app/(frontend)/control/channel/[channelId]/page.tsx
export default function ChannelPage({ params }: { params: { channelId: string } }) {
  const channel = useChannel(params.channelId)
  const Component = getChannelComponent(channel.component)
  
  return (
    <AngelOSCommandCenter>
      <ChannelContainer channel={channel}>
        <Component channelId={channel.id} />
      </ChannelContainer>
    </AngelOSCommandCenter>
  )
}

// Channel component registry
const channelComponents = {
  ChatContainer: dynamic(() => import('@/components/channels/ChatContainer')),
  OrdersManager: dynamic(() => import('@/components/channels/OrdersManager')),
  AnalyticsDashboard: dynamic(() => import('@/components/channels/AnalyticsDashboard')),
  ProductCatalog: dynamic(() => import('@/components/channels/ProductCatalog')),
}
```

#### Channel-Specific Features
- **#general** - Real-time messaging, presence, file sharing, @mentions
- **#orders** - Order grid, status filters, quick actions, exports
- **#analytics** - Real-time charts, KPIs, date ranges, reports
- **#products** - Product grid, inventory, quick edit, bulk ops
