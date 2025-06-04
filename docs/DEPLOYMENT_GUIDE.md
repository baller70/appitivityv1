# BookmarkHub Deployment Guide

## 🚀 **Overview**

This guide covers deploying BookmarkHub to various platforms with comprehensive setup instructions for production environments.

---

## 📋 **Pre-deployment Checklist**

### **Required Services**
- ✅ **Supabase Account** - Database hosting
- ✅ **Clerk Account** - Authentication service
- ✅ **Git Repository** - Code versioning
- ✅ **Domain Name** (optional) - Custom domain

### **Environment Variables**
Ensure all required environment variables are configured:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🔗 **Vercel Deployment** (Recommended)

### **Why Vercel?**
- ✅ Optimized for Next.js applications
- ✅ Automatic deployments from Git
- ✅ Global CDN and edge functions
- ✅ Built-in analytics and monitoring
- ✅ Free tier available

### **Step-by-Step Deployment**

#### **1. Connect Repository**
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Login to Vercel
vercel login

# Initialize project
vercel
```

#### **2. Configure via Vercel Dashboard**
1. Visit [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Select `baller70/appitivityv1`
5. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

#### **3. Environment Variables**
In Vercel Dashboard → Project → Settings → Environment Variables:
```bash
# Add each variable individually
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### **4. Deploy**
- Automatic deployment triggers on Git push
- Manual deployment via Vercel dashboard
- CLI deployment: `vercel --prod`

### **Custom Domain Setup**
1. **Vercel Dashboard** → Domains
2. **Add Domain** → Enter your domain
3. **Configure DNS** with your domain provider:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

---

## 🌊 **Netlify Deployment**

### **Setup Instructions**

#### **1. Connect Repository**
1. Visit [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub and select repository
4. Configure build settings:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

#### **2. Environment Variables**
In Netlify Dashboard → Site Settings → Environment Variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app
```

#### **3. Build Configuration**
Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🚂 **Railway Deployment**

### **Setup Instructions**

#### **1. Deploy from GitHub**
1. Visit [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose `baller70/appitivityv1`

#### **2. Environment Configuration**
```bash
# Railway automatically detects Next.js
# Add environment variables in Railway dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
```

#### **3. Custom Domain**
1. **Railway Dashboard** → Settings → Domains
2. **Add Custom Domain**
3. Configure DNS with CNAME record

---

## 🐳 **Docker Deployment**

### **Dockerfile**
Create `Dockerfile` in project root:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **Docker Compose**
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  bookmarkhub:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    env_file:
      - .env.production
    restart: unless-stopped

networks:
  default:
    name: bookmarkhub-network
```

### **Deploy Commands**
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Update deployment
docker-compose pull && docker-compose up -d
```

---

## ☁️ **AWS Deployment**

### **AWS Amplify**

#### **1. Setup**
```bash
# Install AWS Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize project
amplify init
```

#### **2. Deploy**
```bash
# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### **AWS EC2 with PM2**

#### **1. Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### **2. Application Setup**
```bash
# Clone repository
git clone https://github.com/baller70/appitivityv1.git
cd appitivityv1

# Install dependencies
npm install

# Build application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bookmarkhub',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/appitivityv1',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **3. Nginx Configuration**
```nginx
# /etc/nginx/sites-available/bookmarkhub
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 **Database Setup**

### **Supabase Configuration**

#### **1. Create Project**
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - Anon public key
   - Service role key

#### **2. Database Schema**
Run the following SQL in Supabase SQL Editor:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT NOT NULL DEFAULT 'Folder',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  visits INTEGER DEFAULT 0,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, user_id)
);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Folder policies
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can manage own folders" ON folders
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Bookmark policies
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Tag policies
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can manage own tags" ON tags
  FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
```

#### **3. Insert Default Folders**
```sql
-- Default folders for each user (run after user creation)
INSERT INTO folders (id, name, description, color, icon, user_id) VALUES
  ('development', 'Development', 'Programming resources and developer tools', '#3b82f6', 'Code', (SELECT id FROM users WHERE clerk_id = 'USER_ID')),
  ('design', 'Design', 'Design tools and inspiration', '#8b5cf6', 'Palette', (SELECT id FROM users WHERE clerk_id = 'USER_ID')),
  ('productivity', 'Productivity', 'Productivity and task management tools', '#10b981', 'CheckSquare', (SELECT id FROM users WHERE clerk_id = 'USER_ID')),
  ('learning', 'Learning', 'Educational resources and courses', '#f59e0b', 'BookOpen', (SELECT id FROM users WHERE clerk_id = 'USER_ID')),
  ('entertainment', 'Entertainment', 'Media and entertainment platforms', '#ec4899', 'Play', (SELECT id FROM users WHERE clerk_id = 'USER_ID')),
  ('uncategorized', 'Uncategorized', 'Bookmarks without specific category', '#6b7280', 'FileText', (SELECT id FROM users WHERE clerk_id = 'USER_ID'));
```

---

## 🔐 **Authentication Setup**

### **Clerk Configuration**

#### **1. Create Clerk Application**
1. Visit [clerk.com](https://clerk.com)
2. Create new application
3. Configure authentication methods:
   - Email/Password
   - Social logins (Google, GitHub, etc.)

#### **2. Configure Domains**
Add your deployment domains in Clerk Dashboard:
- `localhost:3000` (development)
- `your-app.vercel.app` (production)
- `your-custom-domain.com` (custom domain)

#### **3. Webhook Configuration** (Optional)
For real-time user sync:
```javascript
// pages/api/clerk-webhook.js
import { Webhook } from 'svix'

export default async function handler(req, res) {
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
  
  try {
    const payload = webhook.verify(req.body, req.headers)
    
    if (payload.type === 'user.created') {
      // Create user in database
      await createUser(payload.data)
    }
    
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(400).json({ error: 'Webhook verification failed' })
  }
}
```

---

## 📊 **Monitoring & Analytics**

### **Application Monitoring**

#### **Vercel Analytics**
Automatically enabled for Vercel deployments:
- Page views and user sessions
- Performance metrics
- Error tracking

#### **Custom Analytics**
Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### **Error Tracking**

#### **Sentry Integration**
```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

---

## 🔧 **Performance Optimization**

### **Build Optimization**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Image optimization
  images: {
    domains: ['www.google.com', 'favicon.yandex.net'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),
}

module.exports = nextConfig
```

### **CDN Configuration**
For static assets:
```javascript
// next.config.js
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
}
```

---

## 🚨 **Health Checks**

### **Application Health Check**
Create `pages/api/health.ts`:
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connectivity
    const supabase = createServerSupabaseClient({ req, res })
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    })
  }
}
```

### **Uptime Monitoring**
Configure external monitoring services:
- **UptimeRobot** - Free tier available
- **Pingdom** - Advanced monitoring
- **StatusPage** - Status page creation

---

## 🔒 **Security Considerations**

### **Environment Variables**
- Never commit secrets to repository
- Use different keys for development/production
- Rotate keys regularly
- Use secret management services in production

### **Content Security Policy**
Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: http:;
      font-src 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  }
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 📋 **Deployment Checklist**

### **Pre-deployment**
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Default folders created
- [ ] Authentication providers configured
- [ ] Domain DNS configured
- [ ] SSL certificate ready

### **Post-deployment**
- [ ] Health check endpoint working
- [ ] Authentication flow tested
- [ ] Database operations functional
- [ ] API endpoints responding
- [ ] Error tracking configured
- [ ] Monitoring setup complete
- [ ] Performance metrics baseline established

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### **Database Connection Issues**
- Verify Supabase project status
- Check environment variables
- Confirm RLS policies
- Test connection in Supabase dashboard

#### **Authentication Problems**
- Verify Clerk configuration
- Check domain allowlist
- Confirm API keys
- Test authentication flow

#### **Performance Issues**
- Enable compression
- Optimize images
- Check bundle size
- Monitor database queries

---

## 📞 **Support & Resources**

### **Platform Documentation**
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Railway Docs](https://docs.railway.app)
- [AWS Amplify Docs](https://docs.amplify.aws)

### **Service Documentation**
- [Supabase Docs](https://supabase.com/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Last Updated**: January 2025  
**Guide Version**: 2.0.0  
**Status**: ✅ Production Ready