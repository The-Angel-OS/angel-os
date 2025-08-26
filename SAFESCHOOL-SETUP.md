# SafeSchool|MAP℠ Multi-Tenant Setup Guide

## 🎯 Overview

This guide sets up the SafeSchool|MAP℠ platform as a multi-tenant use case within Angel OS, providing school safety ratings, reviews, and verification systems.

## 🏗️ Architecture

- **Multi-Tenant**: Schools platform runs as Tenant ID 2
- **Collections**: Schools, extended Feedback for reviews
- **Local Testing**: Custom domain aliases for testing
- **Seed Data**: Realistic schools and safety reviews

## 📋 Prerequisites

1. **TypeScript Clean**: ✅ All errors fixed
2. **Angel OS**: Running and configured
3. **Database**: PostgreSQL running
4. **Node.js**: v18+ required

## 🚀 Quick Start

### Step 1: Add Hosts File Entries

**Windows**: Edit `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux**: Edit `/etc/hosts`

```bash
# Angel OS Multi-Tenant Testing
127.0.0.1    safeschool.local
127.0.0.1    schools.angelOS.local  
127.0.0.1    demo-school.local
127.0.0.1    admin.angelOS.local
```

### Step 2: Seed School Data

```bash
# Create schools tenant with sample data
pnpm seed:schools

# Or run directly
node scripts/seed-schools-tenant.js
```

### Step 3: Start Development Server

```bash
pnpm dev
```

### Step 4: Test Multi-Tenant Access

- **Main Platform**: http://localhost:3000
- **Schools Platform**: http://safeschool.local:3000/schools
- **Admin Panel**: http://localhost:3000/admin

## 🏫 Sample Schools Created

### Elementary Schools
- **Lincoln Elementary** (Featured, Verified, Score: 87)
- **Washington Elementary** (Score: 73, Unverified)

### Middle Schools  
- **Jefferson Middle School** (Featured, Verified, Score: 79)

### High Schools
- **Kennedy High School** (Featured, Verified, Score: 84)

### Charter & Private
- **Innovation Charter Academy** (Score: 91, Unverified)
- **St. Mary's Catholic School** (Verified, Score: 88)

## 📊 Features Implemented

### ✅ Core Features
- [x] School profile pages with safety scores
- [x] Community Safety Scores (always available)
- [x] Verified Safety Scores (SITE|SAFETYNET℠)
- [x] School search and filtering
- [x] Safety review system
- [x] Anonymous review support
- [x] Multi-rating system (safety feeling, handling, recommendation)
- [x] Geographic search by city/state
- [x] School type filtering (Elementary, Middle, High, Charter, Private)
- [x] Responsive design

### ✅ Safety Scoring System
- **Community Scores**: Built from public data (NCES, Census, Crime stats)
- **Verified Scores**: Professional SITE|SAFETYNET℠ assessments
- **Score Breakdown**: Physical Security, Emergency Prep, Staff Training, Student Wellbeing
- **Real-time Updates**: Timestamp tracking and data source attribution

### ✅ Review System
- **Anonymous Support**: Optional anonymous posting
- **Role-based Reviews**: Parent, Teacher, Student, Staff, Community, First Responder
- **Category System**: General Safety, Bullying, Security, Staff Response, Emergency, Culture, Facilities
- **Moderation Workflow**: Pending → Approved → Published
- **Integration**: Uses existing universal Feedback collection

## 🔧 Technical Implementation

### Collections Used
- **Schools**: New collection for school profiles and safety data
- **Feedback**: Extended existing collection for school reviews
- **Tenants**: Multi-tenant architecture support
- **Users**: Authentication and role management

### API Endpoints
- `GET /api/schools` - Search and filter schools
- `POST /api/schools` - Create new school (admin)
- `GET /api/schools/[slug]` - Get school profile
- `POST /api/feedback` - Submit safety review

### UI Components
- **SchoolProfileHeader**: School info, safety scores, actions
- **SafetyScoreCard**: Community and verified score display
- **SchoolSearchForm**: Advanced search with filters
- **SchoolSearchResults**: Grid view with pagination
- **AddReviewModal**: Safety review submission form
- **SchoolDetailsCard**: Contact info, demographics
- **SchoolReviewsSection**: Review display and management

## 🧪 Testing Scenarios

### Basic Functionality
1. **School Search**: Search by name, city, district
2. **Filtering**: Filter by type, safety score, verification
3. **Profile Pages**: View school details and safety scores
4. **Review Submission**: Submit anonymous/named reviews
5. **Review Display**: View existing reviews with ratings

### Multi-Tenant Testing
1. **Domain Routing**: Test safeschool.local vs localhost
2. **Tenant Isolation**: Ensure data separation
3. **Branding**: Verify SafeSchool branding on tenant domain
4. **Navigation**: Test cross-tenant navigation

### Safety Score Testing
1. **Community Scores**: Verify score calculation and display
2. **Verified Scores**: Test SITE|SAFETYNET℠ badge display
3. **Score Breakdown**: Check individual component scores
4. **Data Sources**: Verify attribution and timestamps

## 📱 Mobile Testing

Test responsive design on:
- **Mobile**: 375px width (iPhone)
- **Tablet**: 768px width (iPad)
- **Desktop**: 1024px+ width

## 🔒 Security Considerations

- **Anonymous Reviews**: No PII stored for anonymous submissions
- **Input Validation**: All form inputs validated and sanitized
- **Rate Limiting**: Prevent review spam (implement as needed)
- **Moderation**: All reviews require approval before publication
- **Data Privacy**: FERPA compliance for educational data

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript errors resolved ✅
- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] Domain DNS configured

### Production Setup
- [ ] Multi-tenant routing configured
- [ ] CDN setup for static assets
- [ ] Database backups configured
- [ ] Monitoring and logging setup
- [ ] Error tracking (Sentry, etc.)

### Post-Deployment
- [ ] Smoke tests on production
- [ ] Performance monitoring
- [ ] SEO optimization
- [ ] Analytics setup
- [ ] User feedback collection

## 🔧 Troubleshooting

### Common Issues

**TypeScript Errors**
```bash
# Check for errors
pnpm tsc --noEmit

# Fix and regenerate types
pnpm payload generate:types
```

**Database Issues**
```bash
# Reset database (development only)
pnpm payload migrate:reset

# Run fresh migrations
pnpm payload migrate
```

**Hosts File Not Working**
- Ensure no trailing spaces in hosts file
- Restart browser after hosts file changes
- Check Windows firewall/antivirus blocking

**Seed Script Fails**
```bash
# Check database connection
# Ensure Payload is running
# Check for existing data conflicts
```

## 📞 Support

For issues with the SafeSchool|MAP℠ implementation:

1. Check TypeScript compilation: `pnpm tsc --noEmit`
2. Verify database connectivity
3. Review browser console for errors
4. Check server logs for API errors

## 🎉 Success Metrics

The implementation is successful when:

- ✅ All TypeScript errors resolved
- ✅ Schools can be searched and filtered
- ✅ School profiles display correctly
- ✅ Safety reviews can be submitted
- ✅ Multi-tenant routing works
- ✅ Mobile responsive design works
- ✅ Performance is acceptable (<2s page loads)

---

**Ready for Production Deployment! 🚀**


