# Angel OS Dashboard Documentation

This directory contains comprehensive documentation for all dashboard pages, components, and functionality in the Angel OS platform.

## Dashboard Structure

The Angel OS dashboard is built with:
- **Next.js App Router** for routing and server-side rendering
- **ShadCN UI** for consistent component library
- **Payload CMS** for backend data management
- **Framer Motion** for smooth animations
- **Multi-tenant architecture** with tenant-scoped data

## Documentation Organization

### Page Documentation
Each dashboard page has its own documentation file covering:
- **Controls and UI elements**
- **Data sources** (mock vs Payload collections)
- **Collection relationships**
- **API endpoints used**
- **Current implementation status**

### Modal Documentation  
Configuration modals are documented separately with:
- **Trigger conditions**
- **Form fields and validation**
- **Backend integration**
- **User flow and UX**

## Dashboard Pages Inventory

| Page | Status | Documentation |
|------|--------|---------------|
| Overview | ✅ Implemented | [overview.md](./pages/overview.md) |
| E-commerce | 🚧 Partial | [ecommerce.md](./pages/ecommerce.md) |
| Sales | 📋 Mock Data | [sales.md](./pages/sales.md) |
| CRM | 📋 Mock Data | [crm.md](./pages/crm.md) |
| Website Analytics | 📋 Mock Data | [analytics.md](./pages/analytics.md) |
| Spaces | 🚧 Partial | [spaces.md](./pages/spaces.md) |
| Project Management | 📋 Mock Data | [project-management.md](./pages/project-management.md) |
| File Manager | ❌ Not Implemented | [file-manager.md](./pages/file-manager.md) |
| Crypto | ❌ Not Implemented | [crypto.md](./pages/crypto.md) |
| Academy/School | ❌ Not Implemented | [academy.md](./pages/academy.md) |
| Hospital Management | ❌ Not Implemented | [hospital.md](./pages/hospital.md) |
| Hotel Dashboard | 🚧 Partial | [hotel.md](./pages/hotel.md) |
| Finance | 🆕 New Feature | [finance.md](./pages/finance.md) |
| AI Chat | 🚧 Coming Soon | [ai-chat.md](./pages/ai-chat.md) |
| Image Generator | 🆕 New Feature | [image-generator.md](./pages/image-generator.md) |
| Settings | ✅ Implemented | [settings.md](./pages/settings.md) |

## Status Legend
- ✅ **Implemented**: Fully functional with Payload CMS integration
- 🚧 **Partial**: Basic UI with some mock data, partial backend integration
- 📋 **Mock Data**: UI implemented but using mock data only
- 🆕 **New Feature**: Recently added, needs implementation
- ❌ **Not Implemented**: Placeholder only

## Key Components

### Core Layout Components
- **Sidebar**: Left navigation with tenant chooser and user profile
- **Header**: Top navigation with search, notifications, and user menu
- **ChatPanel**: Right-side slide-out chat with LEO AI integration
- **ServerConsole**: Bottom expandable console for debugging

### Shared Components
- **TenantChooser**: Multi-tenant selection and switching
- **PayloadChatBubble**: Universal AI chat integration
- **IntegrationHub**: Third-party service management

## Architecture Notes

### Multi-tenant Data Flow
1. User authenticates → Gets tenant memberships
2. Selects active tenant → All data scoped to that tenant
3. Dashboard shows tenant-specific data and controls

### Authentication Flow
1. `/dashboard` route protected by authentication
2. Redirects to `/admin/login` if not authenticated  
3. Uses Payload CMS session management with cookies
4. Real-time user data via `/api/users/me` endpoint

### Collection Integration
Each dashboard page maps to specific Payload collections:
- **Users, Tenants, TenantMemberships**: Core multi-tenancy
- **Products, Orders, Invoices**: E-commerce functionality  
- **Contacts, Messages, Channels**: CRM and communication
- **Spaces, SpaceMemberships**: Collaboration platform
- **BusinessAgents, AIGenerationQueue**: AI automation

## Development Guidelines

1. **Always use real Payload data** when possible
2. **Implement tenant-scoped access control** for all data
3. **Follow ShadCN UI patterns** for consistent design
4. **Add comprehensive error handling** and loading states
5. **Document all new components** and API endpoints

## Getting Started

To contribute to dashboard development:

1. Read the relevant page documentation
2. Check current implementation status
3. Follow the established patterns
4. Update documentation when making changes
5. Test with multiple tenants to verify scoping

## Related Documentation

- [Angel OS Architecture](../angel-os-architecture/)
- [API Endpoints](../api/)
- [Component Library](../components/)
- [Multi-tenant Guide](../multi-tenant.md)
