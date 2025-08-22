# 007 - Shadcn UI Kit Foundation with Dynamic Widget Ecosystem

## Overview
Implement foundational Shadcn UI Kit system with dynamic widget ecosystem and LEO AI integration. Create switchboard pattern for control loading, Page Flakes-style moveable widgets, and AI-generated components.

### Key Innovations
- **Switchboard Pattern**: Single route handler with dynamic control loading
- **Widget Ecosystem**: Moveable, AI-generated widgets like Page Flakes
- **LEO Integration**: AI creates custom controls and widgets on demand
- **JSON Distribution**: Publishable component ecosystem
- **Channel Integration**: Widget results flow into appropriate channels

## Current State Analysis

### ✅ What We Have
- **Theme System**: Dual compatibility (Payload + Shadcn UI) with CSS variables
- **Basic Components**: Button, Input, Avatar, Badge, ScrollArea, Tabs, Switch, DropdownMenu
- **Layout Foundation**: ShadcnSpacesLayout with sidebar, header, main content
- **Channel System**: Text, Notes, Dashboard, Settings channel types
- **Framer Motion**: Already installed and functional

### 🎯 Target Implementation
Complete replication of [Shadcn UI Kit](https://shadcnuikit.com) features:

#### **Core Layout & Navigation**
- **Sidebar Navigation**: Collapsible with elegant icons (like Discord)
- **Command Palette**: Global search (`Cmd+K` / `Ctrl+K`)
- **Header Bar**: Clean, minimal with user menu and theme toggle
- **Breadcrumbs**: Dynamic navigation context

#### **Dashboard Features**
1. **E-commerce Dashboard** → Product/Service Management
2. **Sales Dashboard** → Revenue Analytics  
3. **CRM Dashboard** → Contact/Customer Management
4. **Website Analytics** → Traffic/Engagement Metrics
5. **Project Management** → Task/Project Tracking
6. **File Manager** → Document/Media Management

#### **AI Features**
1. **AI Chat** → Leo Assistant Integration
2. **AI Chat V2** → Multi-agent conversations
3. **Image Generator** → AI-powered content creation

#### **Apps Integration**
1. **Notes** → Lexical editor with Notion-style collaboration
2. **Chats** → Multi-channel messaging (current implementation)
3. **Mail** → Communication hub
4. **Todo List** → Task management
5. **Calendar** → Appointment/scheduling system
6. **Kanban** → Project boards
7. **API Keys** → Integration management
8. **POS App** → Point of sale for venues

#### **Pages & Settings**
1. **Users List** → Team/member management
2. **Profile** → User account settings
3. **Settings** → Multi-level configuration (Space/User/Tenant/System)
4. **Pricing** → Subscription/billing management

## Technical Requirements

### **Layout Restructuring**
```typescript
// Remove Payload CMS wrapper for /spaces routes
// Create dedicated Spaces layout without Header/Footer
// Maintain admin access through dynamic permissions

interface SpacesLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean // Back to main site
  adminAccess?: boolean    // Show admin controls
}
```

### **Component Architecture**
```typescript
// Standardize on Shadcn UI Kit patterns
interface DashboardWidget {
  id: string
  type: 'chart' | 'kpi' | 'table' | 'calendar' | 'notes'
  title: string
  position: GridPosition
  config: WidgetConfig
}

interface GridPosition {
  x: number
  y: number
  w: number // width in grid units
  h: number // height in grid units
}
```

### **Animation System**
```typescript
// Framer Motion integration for:
// - Sidebar collapse/expand
// - Page transitions
// - Modal/drawer animations
// - Loading states
// - Hover effects

import { motion, AnimatePresence } from 'framer-motion'
```

### **Navigation Integration**
```typescript
// Maintain connection to main site
interface NavigationContext {
  backToSite: () => void
  adminPanel: () => void
  currentSpace: Space
  breadcrumbs: BreadcrumbItem[]
}
```

## Implementation Phases

### **Phase 1: Foundation Architecture**
- [ ] Remove Payload CMS Header/Footer from `/spaces` routes
- [ ] Implement switchboard pattern with dynamic control loading
- [ ] Create dedicated Spaces layout with Shadcn UI Kit
- [ ] Add navigation back to main site with admin access preservation
- [ ] Implement command palette (`Cmd+K`) for global search

### **Phase 2: Widget Ecosystem**
- [ ] Implement react-grid-layout for Page Flakes-style dashboards
- [ ] Create widget registry and dynamic loading system
- [ ] Build foundational widget types (chart, form, data, geo)
- [ ] Implement widget positioning and resizing
- [ ] Create widget marketplace/catalog interface

### **Phase 3: LEO AI Integration**
- [ ] Connect LEO to widget generation system
- [ ] Implement AI-powered control creation
- [ ] Create code validation and security layer
- [ ] Build prompt-to-component pipeline
- [ ] Add widget sharing and distribution

### **Phase 4: Channel Integration**
- [ ] Connect widget outputs to channel system
- [ ] Implement result posting to appropriate channels
- [ ] Create message threading for widget results
- [ ] Add contact tracking and follow-up systems
- [ ] Build workflow automation

### **Phase 5: Advanced Ecosystem**
- [ ] Tenant-specific widget customization
- [ ] Third-party API integration framework
- [ ] Data scraping and validation widgets
- [ ] Geo-location and mapping widgets
- [ ] Compliance and legal workflow widgets

## Technical Challenges & Solutions

### **Challenge 1: Payload CMS Integration**
**Problem**: Removing Header/Footer while maintaining admin access
**Solution**: 
```typescript
// Conditional layout based on route
const useSpacesLayout = (pathname: string) => {
  if (pathname.startsWith('/spaces')) {
    return 'spaces' // No Payload wrapper
  }
  return 'default' // With Header/Footer
}
```

### **Challenge 2: Permission System**
**Problem**: Dynamic admin controls without Payload AdminBar
**Solution**:
```typescript
// Integrate permissions into Spaces header
const SpacesHeader = ({ user, permissions }) => {
  const showAdminControls = permissions.includes('admin')
  return (
    <header>
      {showAdminControls && <AdminDropdown />}
      <UserMenu />
      <ThemeToggle />
    </header>
  )
}
```

### **Challenge 3: Data Integration**
**Problem**: Connecting Shadcn UI Kit patterns to Payload collections
**Solution**:
```typescript
// Create adapter layer
interface PayloadToShadcnAdapter {
  products: Product[] → EcommerceData
  contacts: Contact[] → CRMData  
  analytics: Analytics[] → DashboardData
}
```

### **Challenge 4: Animation Performance**
**Problem**: Smooth animations with complex layouts
**Solution**:
```typescript
// Optimize Framer Motion usage
const sidebarVariants = {
  expanded: { width: 280, transition: { type: "spring", damping: 20 } },
  collapsed: { width: 64, transition: { type: "spring", damping: 20 } }
}
```

## Dependencies Required

### **New Packages**
```json
{
  "@radix-ui/react-command": "^1.0.0",
  "@radix-ui/react-dialog": "^1.0.0", 
  "@radix-ui/react-popover": "^1.0.0",
  "@radix-ui/react-select": "^1.0.0",
  "@radix-ui/react-separator": "^1.0.0",
  "@radix-ui/react-sheet": "^1.0.0",
  "@radix-ui/react-toast": "^1.0.0",
  "react-grid-layout": "^1.4.0",
  "recharts": "^2.8.0",
  "cmdk": "^0.2.0"
}
```

### **Existing Assets**
- ✅ Framer Motion
- ✅ Tailwind CSS
- ✅ Radix UI primitives (partial)
- ✅ Lucide React icons
- ✅ Next.js App Router

## Success Criteria

### **User Experience**
- [ ] Seamless navigation between main site and Spaces
- [ ] Consistent design language across all features
- [ ] Smooth animations and transitions
- [ ] Responsive design on all devices
- [ ] Accessible keyboard navigation

### **Developer Experience**
- [ ] Reusable component library
- [ ] Type-safe interfaces
- [ ] Clear documentation
- [ ] Easy customization
- [ ] Performance optimized

### **Business Requirements**
- [ ] Multi-tenant support maintained
- [ ] Permission system preserved
- [ ] Admin access controls functional
- [ ] Integration with existing collections
- [ ] Scalable architecture

## Implementation Readiness

### **✅ Ready to Implement**
- Core layout restructuring
- Basic dashboard components
- Theme system integration
- Animation framework
- Navigation patterns

### **🔄 Needs Research**
- Grid layout system optimization
- Advanced chart components
- Real-time data synchronization
- Performance optimization strategies

### **⚠️ Potential Blockers**
- Complex Payload CMS integration patterns
- Multi-tenant data isolation in dashboards
- Real-time updates across multiple users
- Mobile responsiveness for complex dashboards

## Next Steps

1. **Immediate**: Remove Payload wrapper from `/spaces` routes
2. **Week 1**: Implement core Shadcn UI Kit layout
3. **Week 2**: Build dashboard foundation with grid system
4. **Week 3**: Integrate existing collections with new UI
5. **Week 4**: Add animations and polish

## References

- [Shadcn UI Kit Dashboard](https://shadcnuikit.com/dashboard)
- [Shadcn UI Kit Chat App](https://shadcnuikit.com/dashboard/apps/chat)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

---

**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 4-6 weeks  
**Dependencies**: None (all requirements met)
