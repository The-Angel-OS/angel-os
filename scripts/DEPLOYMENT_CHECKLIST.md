# Angel OS Deployment Checklist

## 🚀 Vercel Deployment to angel-os.kendev.co

### Pre-Deployment Checklist

- [x] **Passwords Updated** - Changed from `K3nD3v!host` to `angelos`
- [x] **Domain Configuration** - Updated seed script to use `angel-os.kendev.co`
- [x] **Environment Variables** - Updated `env.example` with production URLs
- [x] **CSRF Protection** - Added `angel-os.kendev.co` to Payload config
- [x] **Documentation** - Updated README.md and GETTING_STARTED.md with live URLs
- [x] **Vercel Config** - Created `vercel.json` with proper aliases and settings
- [x] **Vercel Analytics** - Added `@vercel/analytics` to both frontend and dashboard layouts
- [x] **Multi-Tenant URL Resolution** - Updated URL utilities to handle tenant-specific domains
- [x] **Middleware Enhancement** - Enhanced middleware for proper domain/subdomain routing

### Vercel Environment Variables Required

```env
# Database
DATABASE_URI=postgresql://...

# Payload CMS
PAYLOAD_SECRET=your-secure-secret-here
ENCRYPTION_SECRET=your-encryption-secret-here

# Application URLs
NEXT_PUBLIC_SERVER_URL=https://angel-os.kendev.co
PAYLOAD_PUBLIC_SERVER_URL=https://angel-os.kendev.co

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Services (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...

# System User
SYSTEM_USER_EMAIL=guardian@angel-os.kendev.co
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: prepare for angel-os.kendev.co deployment"
   git push origin master
   ```

2. **Create Vercel Project**
   - Connect GitHub repository
   - Set project name: `angel-os`
   - Configure custom domain: `angel-os.kendev.co`

3. **Configure Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Ensure `NEXT_PUBLIC_SERVER_URL` points to `https://angel-os.kendev.co`

4. **Deploy**
   - Trigger deployment from Vercel dashboard
   - Monitor build logs for any issues

5. **Post-Deployment Verification**
   - [ ] Visit `https://angel-os.kendev.co` - Homepage loads
   - [ ] Visit `https://angel-os.kendev.co/dashboard` - Dashboard accessible
   - [ ] Visit `https://angel-os.kendev.co/admin` - Payload admin loads
   - [ ] Test login with `kenneth.courtney@gmail.com` / `angelos`
   - [ ] Run seed script if needed: `https://angel-os.kendev.co/api/seed`
   - [ ] Verify Vercel Analytics is tracking page views in Vercel dashboard

### Domain Configuration

**Vercel Project Settings:**
- Project Name: `angel-os`
- Custom Domain: `angel-os.kendev.co`
- Framework Preset: `Next.js`
- Build Command: `pnpm build`
- Output Directory: `.next`

**DNS Configuration (if managing DNS):**
- CNAME: `angel-os.kendev.co` → `cname.vercel-dns.com`

**Multi-Tenant Domain Support:**
- **Main Platform**: `angel-os.kendev.co` (default tenant)
- **Subdomain Pattern**: `{tenant}.kendev.co` (e.g., `hays.kendev.co`)
- **Custom Domains**: Any domain configured in tenant settings
- **Local Development**: `localhost:3000` (defaults to kendevco tenant)

### Troubleshooting

**Common Issues:**
1. **Build Timeout** - Increase Node.js memory in `vercel.json`
2. **Database Connection** - Verify `DATABASE_URI` in environment variables
3. **CORS Issues** - Check CSRF configuration in `payload.config.ts`
4. **Static Generation** - Ensure all required data is available during build

**Build Optimization:**
- Node.js memory increased to 8GB
- API routes have extended timeouts for seed/import operations
- Static generation optimized for events and products

### Success Criteria

✅ **Deployment Complete When:**
- Homepage loads at `https://angel-os.kendev.co`
- Dashboard accessible with authentication
- Admin panel functional
- Demo login works with new credentials
- All API routes responding correctly
- Static pages generating properly

---

**Next Steps After Deployment:**
1. Test all major functionality
2. Run comprehensive seed script
3. Verify multi-tenant operations
4. Test payment processing (if configured)
5. Monitor performance and error logs