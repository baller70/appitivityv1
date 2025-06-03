# Deployment Guide - Apptivity

## Overview
This guide covers deploying Apptivity to various platforms with focus on Vercel (recommended), along with environment setup, database migrations, and monitoring.

## Prerequisites

### Required Accounts
- **Vercel Account**: For hosting and deployment
- **Clerk Account**: For authentication services
- **Supabase Account**: For database and backend services
- **GitHub Account**: For source code management

### Local Development Setup
Ensure your local development environment is working before deployment:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your actual values

# Run database migrations
npm run migrate

# Test locally
npm run dev
npm run build
npm run test
```

## Environment Variables

### Required Environment Variables
Create these in your deployment platform:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Settings
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Optional: Analytics & Monitoring
VERCEL_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn
```

### Environment-Specific Values

#### Development
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### Staging
```bash
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
NODE_ENV=production
```

#### Production
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## Vercel Deployment (Recommended)

### Initial Setup

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   
   # Import project to Vercel
   # Visit: https://vercel.com/new
   # Select your repository
   ```

2. **Configure Environment Variables**
   ```bash
   # In Vercel dashboard:
   # Settings → Environment Variables
   # Add all required variables listed above
   ```

3. **Deploy**
   ```bash
   # Automatic deployment on push to main branch
   # Or manual deployment:
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, no-cache, must-revalidate"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "destination": "/dashboard",
      "permanent": false
    }
  ]
}
```

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Settings → Domains
   - Add your custom domain

2. **Configure DNS**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.19
   ```

3. **SSL Certificate**
   - Automatically handled by Vercel
   - Let's Encrypt certificates

## Alternative Deployment Options

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Build and run:

```bash
# Build image
docker build -t apptivity .

# Run container
docker run -p 3000:3000 --env-file .env.local apptivity
```

### Railway Deployment

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and create project
   railway login
   railway init
   ```

2. **Configure**
   ```bash
   # Add environment variables
   railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   railway variables set CLERK_SECRET_KEY=sk_live_...
   # ... add all other variables
   ```

3. **Deploy**
   ```bash
   railway up
   ```

## Database Setup & Migrations

### Supabase Setup

1. **Create Project**
   - Visit https://supabase.com
   - Create new project
   - Note your project URL and API keys

2. **Run Migrations**
   ```bash
   # Using Supabase CLI
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. **Enable Row Level Security**
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
   ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
   ```

### Migration Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "migrate": "node scripts/migrate.js",
    "migrate:rollback": "node scripts/rollback.js",
    "seed": "node scripts/seed.js"
  }
}
```

### Production Migration Process

```bash
# Before deployment
npm run migrate

# Verify migrations
npm run test:db

# Deploy application
vercel --prod

# Verify deployment
curl -f https://your-domain.com/api/health
```

## Authentication Setup

### Clerk Configuration

1. **Production Instance**
   - Create production instance in Clerk dashboard
   - Configure allowed origins: `https://your-domain.com`
   - Set redirect URLs

2. **Social Providers**
   ```javascript
   // Configure in Clerk dashboard:
   // - Google OAuth
   // - GitHub OAuth
   // - Email/Password
   ```

3. **Webhooks**
   ```bash
   # Set webhook endpoint in Clerk:
   # https://your-domain.com/api/webhooks/clerk
   ```

## Monitoring & Analytics

### Error Monitoring (Sentry)

1. **Setup Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure**
   ```javascript
   // sentry.client.config.ts
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### Performance Monitoring

1. **Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Custom Metrics**
   ```typescript
   // lib/analytics.ts
   export const trackEvent = (event: string, properties?: Record<string, any>) => {
     if (typeof window !== 'undefined') {
       // Track custom events
       analytics.track(event, properties);
     }
   };
   ```

### Health Checks

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    // Check database connection
    const supabase = createClient();
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

## Security Configuration

### Content Security Policy

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Environment Security

```bash
# Never commit these files:
.env.local
.env.production
.env*.local

# Use Vercel's encrypted environment variables
# Enable "Sensitive" flag for secrets
```

## Backup & Recovery

### Database Backups

```bash
# Automated Supabase backups (enabled by default)
# Manual backup:
supabase db dump --data-only > backup.sql

# Restore:
supabase db reset
psql -h your-host -U postgres -d your-db < backup.sql
```

### Application Backups

```bash
# Backup user data via API
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://your-domain.com/api/export/all > backup.json

# Restore via import API
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d @backup.json \
  https://your-domain.com/api/import/all
```

## Performance Optimization

### Next.js Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  swcMinify: true,
};
```

### Database Optimization

```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_bookmarks_user_created 
ON bookmarks(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_bookmarks_search 
ON bookmarks USING gin(to_tsvector('english', title || ' ' || description));
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Check ESLint errors
   npm run lint
   
   # Clear cache
   rm -rf .next node_modules
   npm install
   ```

2. **Database Connection Issues**
   ```bash
   # Verify environment variables
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   
   # Test connection
   curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users?select=id&limit=1"
   ```

3. **Authentication Issues**
   ```bash
   # Check Clerk configuration
   # Verify redirect URLs match deployment URL
   # Check environment variables
   ```

### Logs & Debugging

```bash
# Vercel logs
vercel logs your-deployment-url

# Local debugging
npm run dev -- --debug

# Database logs
# Check Supabase dashboard → Logs
```

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   npm run test
   ```

2. **Monitor Performance**
   - Check Vercel analytics
   - Review Sentry error reports
   - Monitor database performance

3. **Security Updates**
   ```bash
   npm audit fix
   # Review and update Clerk/Supabase SDKs
   ```

### Scaling Considerations

- **Database**: Upgrade Supabase plan for more connections
- **Hosting**: Vercel Pro for team features and better performance
- **CDN**: Consider additional CDN for global assets
- **Caching**: Implement Redis for session caching at scale 