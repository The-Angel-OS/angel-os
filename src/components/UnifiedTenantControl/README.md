# Unified Tenant Control Architecture

## Overview

The UnifiedTenantControl component is a consolidated implementation that eliminates code duplication and provides a flexible, variant-based interface system. It inherits the best UI patterns from the Discord clone examples while adding Angel OS-specific functionality.

## Architecture

### Core Components

1. **UnifiedTenantControl/index.tsx** - Main container that orchestrates the layout
2. **BusinessSidebar.tsx** - Adaptive sidebar that changes based on variant
3. **CommandCenter.tsx** - Main content area with dashboard, operations, and tenant management
4. **LeoAssistant.tsx** - AI assistant panel (inherits from Discord clone pattern)
5. **OperationsDashboard.tsx** - Shows active operations/spaces
6. **TenantsManager.tsx** - Manages tenant list and provisioning

### Variants

The system supports three variants controlled by the `variant` prop:

- **`business`** - Standard business interface (blue theme, professional language)
- **`tactical`** - Military/tactical theme (orange/black theme, operations language)
- **`standard`** - Basic interface (minimal styling)

### Design Patterns (from Discord Clone)

1. **Collapsible Sidebar** - Discord-style server list when collapsed
2. **Mobile Responsive** - Auto-collapses on mobile with overlay
3. **Dark Theme** - Consistent with Discord's aesthetic
4. **Real-time Status** - Connection status, activity feeds
5. **Message-style Chat** - Leo AI uses Discord-like message bubbles

### Key Features

- **Schema-driven Forms** - Uses Zod schemas with AutoForm for type-safe forms
- **Unified Leo AI** - Single implementation that adapts to variant
- **Mobile-first** - Responsive design with mobile detection
- **Clean Architecture** - No duplicate code, proper component separation

## Usage

```tsx
// Business variant (default)
<UnifiedTenantControl variant="business" />

// Tactical variant
<UnifiedTenantControl variant="tactical" />

// Standard variant
<UnifiedTenantControl variant="standard" />
```

## Customization

The system is designed to be extended:

1. Add new variants by extending the variant types
2. Customize themes through the variant-based className system
3. Add new quick actions in LeoAssistant
4. Extend the CommandCenter with new sections

## Migration from Old Components

Old components removed:
- `TenantControlPanel.tsx` → Use `UnifiedTenantControl` with `variant="business"`
- `TacticalTenantControl.tsx` → Use `UnifiedTenantControl` with `variant="tactical"`
- Duplicate Leo implementations → Single unified `LeoAssistant.tsx`
