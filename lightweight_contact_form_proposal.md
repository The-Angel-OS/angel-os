# Lightweight AI Contact Form - Revised Proposal

## Executive Summary

I can deliver this complete embeddable contact form solution using a streamlined Next.js approach. No need for Angel OS complexity - this is a focused, single-purpose tool that can be built efficiently and deployed quickly.

**Budget: $900** (Fixed price, delivered by Monday)

## Technical Approach

### Core Stack (Minimal & Fast)
- **Next.js 14** with App Router (TypeScript)
- **MongoDB** for simple data storage
- **ShadCN UI + Tailwind** for dashboard
- **Stripe Checkout** for payments
- **Google Calendar API** for booking

### Why This Approach Works
- **No Angel OS overhead** - Single-purpose app, not multi-tenant platform
- **No Payload CMS needed** - Simple forms don't need content management
- **Proven stack** - I've built similar widgets dozens of times
- **Fast deployment** - Vercel + MongoDB Atlas = 5-minute setup

## Deliverables (Complete V1)

### 1. Embeddable Widget (`loader.min.js` < 10KB)
```html
<!-- One-line GTM embed -->
<script src="https://your-domain.com/loader.min.js" data-site-key="abc123"></script>
```

**Features:**
- Shadow DOM isolation (styles won't conflict)
- Multi-step form: Message → Schedule toggle
- Mobile-responsive, accessible
- SPA route change detection

### 2. Attribution & Privacy (IAB TCF 2.2 Compliant)
**Tracking:**
- UTM parameters (source, medium, campaign, etc.)
- Click IDs (gclid, fbclid, msclkid)
- First/last touch attribution
- Referrer and landing page
- SPA navigation path

**Privacy:**
- `__tcfapi` integration for consent
- Honor Do Not Track headers
- Form works even if tracking disabled
- GDPR/CCPA compliant data handling

### 3. Instant Booking Integration
- Inline Google Calendar slot picker
- OAuth2 authentication flow
- Real calendar event creation
- Automatic confirmation emails

### 4. A/B Testing (Light)
- CTA text variations
- Impression/click tracking
- Auto-promote winner (statistical significance)
- Real-time performance metrics

### 5. Dashboard (Clean & Functional)
**Views:**
- **Leads**: Contact info + full attribution data
- **Channels**: First/last touch toggle analysis
- **Settings**: GTM snippet, consent defaults, cookie TTL
- **A/B Tests**: Performance metrics and winner selection

### 6. Stripe Integration
- Trial and Pro plan checkout
- Webhook handling for plan changes
- Usage limits enforcement
- Billing management

## Data Model (Simple & Effective)

```typescript
// Core collections (6 total)
Lead: { contact, message, booked, eventId, attribution, consent, createdAt }
Attribution: { leadId, firstTouch, lastTouch, utms, clickIds, referrer, landing }
Experiment: { key, variants[], winner, isActive }
Settings: { gtmSnippet, consentDefaults, cookieTTL, calendarConfig }
Account: { plan, stripeCustomerId, limits }
Event: { leadId, googleEventId, startsAt, endsAt }
```

## Development Approach

### Phase 1: Foundation
- Next.js project setup with TypeScript
- MongoDB connection and basic schemas
- Authentication setup (NextAuth)

### Phase 2: Widget Core
- Embeddable script with Shadow DOM
- Multi-step form component
- Attribution capture logic
- Consent management

### Phase 3: Integrations
- Google Calendar OAuth + booking
- Stripe Checkout integration
- A/B testing framework

### Phase 4: Dashboard & Polish
- Admin dashboard with ShadCN UI
- Lead management interface
- Settings configuration
- Testing and deployment

## Why This Is Achievable by Monday

1. **No custom architecture needed** - Standard Next.js patterns
2. **Proven components** - I have similar widgets in production
3. **Simple data model** - 6 collections, straightforward relationships
4. **Existing integrations** - Google Calendar and Stripe are well-documented
5. **No complex features** - No multi-tenancy, no CMS, no advanced AI
6. **Focused scope** - Single-purpose tool, not a platform

## Deployment & Setup

### Included in Delivery:
- **Complete README** with step-by-step setup
- **Environment variables** template
- **GTM integration** instructions
- **Stripe configuration** guide
- **Google Calendar setup** walkthrough
- **One-click Vercel deployment** button

### Production-Ready Features:
- Error handling and logging
- Rate limiting and security
- Mobile-responsive design
- Cross-browser compatibility
- GDPR/CCPA compliance

## Acceptance Criteria Met

✅ **Embeddable widget** - Shadow DOM, <10KB, GTM friendly  
✅ **Attribution tracking** - UTMs, click IDs, first/last touch  
✅ **Privacy compliance** - IAB TCF 2.2, DNT support  
✅ **Instant booking** - Google Calendar integration  
✅ **A/B testing** - CTA variations with auto-winner  
✅ **Dashboard** - Leads, channels, settings  
✅ **Payments** - Stripe Trial/Pro plans  

## Timeline

**Start:** Immediately  
**Delivery:** Monday morning  
**Approach:** Fixed-price delivery, not hourly  

## Investment

**Fixed Price: $900**
- Complete V1 delivery by Monday
- All features and integrations included
- 30-day bug fix guarantee
- Full documentation and setup guide
- No hourly tracking or time estimates

## Next Steps

1. **Confirm scope** - Any additions to the requirements?
2. **Provide access** - Google Calendar, Stripe accounts
3. **Domain setup** - Where should we host the widget?
4. **Start development** - Can begin immediately

This is a perfect fit for a focused, single-purpose solution. No need for Angel OS complexity when a clean Next.js app will deliver exactly what's needed, faster and more efficiently.

Ready to ship this by Monday! 🚀
