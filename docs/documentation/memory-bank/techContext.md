# Technical Context: BookmarkHub Development Environment

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Next.js** | 15.x | React framework with App Router | [Next.js Docs](https://nextjs.org/docs) |
| **React** | 19.x | UI library with Concurrent Features | [React Docs](https://react.dev) |
| **TypeScript** | 5.x | Type-safe JavaScript development | [TS Docs](https://www.typescriptlang.org/docs) |
| **Tailwind CSS** | 3.x | Utility-first CSS framework | [Tailwind Docs](https://tailwindcss.com/docs) |
| **Radix UI** | Latest | Unstyled, accessible UI primitives | [Radix Docs](https://www.radix-ui.com) |
| **Lucide React** | Latest | Icon library for React | [Lucide Icons](https://lucide.dev) |
| **React Hook Form** | 7.x | Forms with minimal re-renders | [RHF Docs](https://react-hook-form.com) |
| **Zod** | Latest | TypeScript-first schema validation | [Zod Docs](https://zod.dev) |

### Backend & Infrastructure
| Technology | Purpose | Configuration |
|------------|---------|---------------|
| **Supabase** | BaaS for database, auth, storage | PostgreSQL + Auth + Storage |
| **Clerk** | Authentication provider | Social logins, user management |
| **Vercel** | Frontend hosting and deployment | Automatic deployments from Git |
| **PostgreSQL** | Primary database (via Supabase) | Full-text search, JSONB support |

### Development Tools
| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Code linting and quality | Next.js config + custom rules |
| **Prettier** | Code formatting | Integrated with ESLint |
| **Husky** | Git hooks for code quality | Pre-commit linting and formatting |
| **TypeScript** | Static type checking | Strict mode enabled |
| **Jest** | Unit testing framework | React Testing Library integration |
| **Playwright** | E2E testing framework | Cross-browser testing |

## Development Setup

### Prerequisites
```bash
# Required versions
Node.js >= 18.17.0
npm >= 9.6.7
Git >= 2.40.0
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database (Supabase provides these)
DATABASE_URL=your_supabase_db_url
DIRECT_URL=your_supabase_direct_url

# Optional: Analytics and monitoring
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### Installation & Setup
```bash
# Clone repository
git clone [repository-url]
cd apptivity-final-v1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Server runs at http://localhost:3000
```

### Database Setup (Supabase)
```sql
-- Core tables are already set up through migrations
-- Run these commands in Supabase SQL Editor if needed

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies for user data isolation
CREATE POLICY "Users can only access own bookmarks" 
  ON bookmarks FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Users can only access own folders"
  ON folders FOR ALL
  USING (user_id = auth.uid());
```

## Project Structure

```
apptivity-final-v1/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Main dashboard pages
│   │   ├── bookmarks/         # Bookmark management pages
│   │   ├── analytics/         # Analytics and insights
│   │   ├── settings/          # User settings
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components (Radix-based)
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── bookmarks/        # Bookmark management components
│   │   ├── folders/          # Folder management components
│   │   ├── layout/           # Layout components (header, sidebar)
│   │   └── forms/            # Form components
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries and configurations
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions and utilities
├── public/                   # Static assets
├── docs/                     # Project documentation
├── memory-bank/              # Project memory and documentation
└── tests/                    # Test files (Jest + Playwright)
```

## Build & Deployment Configuration

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "prepare": "husky install"
  }
}
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Technical Constraints & Considerations

### Performance Constraints
- **Bundle Size**: Keep client-side JavaScript < 250KB gzipped
- **First Contentful Paint**: Target < 1.5 seconds
- **Time to Interactive**: Target < 3 seconds
- **Core Web Vitals**: All metrics in "Good" range
- **Database Queries**: Optimize for < 100ms response time

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ES2022 Features**: Native support required
- **JavaScript**: ES Modules support required
- **CSS**: CSS Grid and Flexbox support required

### Scalability Considerations
- **Database**: PostgreSQL can handle 100k+ bookmarks per user
- **Real-time**: Supabase real-time limited to 100 concurrent connections
- **Storage**: File uploads limited by Supabase storage quotas
- **API**: Rate limiting at 100 requests/minute per user

### Security Requirements
- **Authentication**: Clerk handles secure authentication flows
- **Authorization**: Row Level Security (RLS) enforced in database
- **Data Validation**: All inputs validated with Zod schemas
- **XSS Protection**: React's built-in XSS prevention + CSP headers
- **CSRF Protection**: Next.js built-in CSRF protection

### Development Constraints
- **Code Quality**: ESLint errors must be resolved before deployment
- **Type Safety**: No TypeScript `any` types in production code
- **Testing**: All components must have unit tests
- **Accessibility**: WCAG 2.1 AA compliance required
- **Git Workflow**: Feature branches with PR reviews required

## API Integration Patterns

### Supabase Client Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### API Route Structure
```typescript
// app/api/bookmarks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Database operations with proper error handling
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' }, 
      { status: 500 }
    );
  }
}
```

## Monitoring & Debugging

### Development Debugging
- **React DevTools**: Component inspection and profiling
- **Next.js DevTools**: Build analysis and performance insights
- **Browser DevTools**: Network, performance, and console debugging
- **TypeScript**: Compile-time error detection
- **ESLint**: Runtime error prevention

### Production Monitoring
- **Vercel Analytics**: Core Web Vitals and performance metrics
- **Supabase Dashboard**: Database performance and query analytics
- **Clerk Dashboard**: Authentication metrics and user management
- **Error Tracking**: Console errors and unhandled exceptions

### Database Monitoring
```sql
-- Useful queries for monitoring database performance
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename IN ('bookmarks', 'folders', 'tags');

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Deployment Pipeline

### Automatic Deployment (Vercel)
1. **Push to main**: Triggers production deployment
2. **Push to feature branch**: Creates preview deployment
3. **Build Process**: Next.js build with TypeScript compilation
4. **Quality Checks**: ESLint, Prettier, and type checking
5. **E2E Testing**: Playwright tests run on deployment preview
6. **Performance Audit**: Lighthouse checks on preview deployments

### Environment-Specific Configurations
- **Development**: Hot reloading, detailed error messages, debug logging
- **Preview**: Production build with staging environment variables
- **Production**: Optimized build, error reporting, analytics enabled

This technical foundation provides a robust, scalable platform for the BookmarkHub application with modern development practices and comprehensive tooling. 