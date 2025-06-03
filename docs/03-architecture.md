# ARCHITECT - System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Apptivity Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Frontend      │    │   Backend       │    │   External   │ │
│  │   (Next.js)     │    │   (API Routes)  │    │   Services   │ │
│  │                 │    │                 │    │              │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌──────────┐ │ │
│  │ │   Pages     │ │◄──►│ │  Handlers   │ │◄──►│ │  Clerk   │ │ │
│  │ │             │ │    │ │             │ │    │ │  Auth    │ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └──────────┘ │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌──────────┐ │ │
│  │ │ Components  │ │    │ │ Middleware  │ │    │ │ Supabase │ │ │
│  │ │             │ │    │ │             │ │    │ │ Database │ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └──────────┘ │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌──────────┐ │ │
│  │ │   Hooks     │ │    │ │   Utils     │ │    │ │  Vercel  │ │ │
│  │ │             │ │    │ │             │ │    │ │ Hosting  │ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └──────────┘ │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Major Components

### Frontend Layer (Next.js 15)
- **App Router**: File-based routing with layouts and pages
- **React Components**: Reusable UI components with TypeScript
- **State Management**: React hooks and context for local state
- **Styling**: Tailwind CSS with custom design system
- **Client-Side Logic**: Data fetching, form handling, and interactions

### Backend Layer (API Routes)
- **Authentication Middleware**: Clerk session validation
- **API Handlers**: RESTful endpoints for data operations
- **Database Layer**: Supabase client integration
- **Utility Functions**: Shared business logic and helpers
- **Type Definitions**: Shared TypeScript interfaces

### External Services
- **Clerk Authentication**: User management and session handling
- **Supabase Database**: PostgreSQL database with real-time features
- **Vercel Platform**: Hosting, deployment, and edge functions

### Component Architecture

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Main application routes
│   ├── api/                # API route handlers
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components (Radix UI)
│   ├── layout/             # Layout components
│   ├── bookmarks/          # Bookmark-specific components
│   └── dashboard/          # Dashboard components
├── lib/                    # Utility functions
│   ├── supabase.ts         # Database client
│   ├── utils.ts            # General utilities
│   └── validations.ts      # Form validation schemas
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── contexts/              # React context providers
└── features/              # Feature-based modules
```

## Data Flow Overview

### User Authentication Flow
1. **User accesses protected route** → Clerk middleware intercepts
2. **Authentication check** → Redirect to sign-in if not authenticated
3. **Session validation** → Clerk validates JWT token
4. **User context** → User information available throughout app

### Bookmark Management Flow
1. **User interaction** → Component triggers action
2. **API request** → Frontend calls Next.js API route
3. **Authentication** → Middleware validates user session
4. **Database operation** → Supabase handles data persistence
5. **Response** → Data returned to frontend for UI update

### Real-time Updates
1. **Database change** → Supabase triggers real-time event
2. **Client subscription** → Frontend receives update notification
3. **State update** → React components re-render with new data
4. **UI refresh** → User sees updated information

## Integration Points

### Authentication Integration (Clerk)
- **Session Management**: JWT tokens and session validation
- **User Profile**: Access to user information and preferences
- **Route Protection**: Middleware for protected routes
- **Sign-in/Sign-up**: Hosted authentication flows

### Database Integration (Supabase)
- **Connection Management**: Database client configuration
- **Query Interface**: Type-safe database operations
- **Real-time Subscriptions**: Live data updates
- **Row Level Security**: User-specific data access

### External API Integration
- **Metadata Extraction**: Fetch website information for bookmarks
- **Favicon Services**: Retrieve website icons
- **Screenshot APIs**: Generate website previews
- **Search APIs**: Enhanced search capabilities

## Technology Choices

### Frontend Framework: Next.js 15
**Why chosen:**
- Full-stack React framework with App Router
- Built-in API routes for backend functionality
- Excellent TypeScript support
- Server-side rendering and static generation
- Edge runtime support for global performance

### Styling: Tailwind CSS
**Why chosen:**
- Utility-first CSS framework for rapid development
- Consistent design system with customization
- Excellent integration with React components
- Responsive design capabilities
- Small bundle size with purging

### Database: Supabase
**Why chosen:**
- PostgreSQL with real-time capabilities
- Built-in authentication (though using Clerk instead)
- Type-safe client with generated types
- Row Level Security for data protection
- Excellent developer experience

### Authentication: Clerk
**Why chosen:**
- Full-featured authentication solution
- Social login providers
- User management dashboard
- Session management and JWT handling
- Excellent Next.js integration

### UI Components: Radix UI
**Why chosen:**
- Accessible component primitives
- Headless components for custom styling
- Comprehensive component library
- TypeScript support
- WAI-ARIA compliant

### Deployment: Vercel
**Why chosen:**
- Seamless Next.js integration
- Global CDN and edge functions
- Automatic deployments from Git
- Built-in analytics and monitoring
- Excellent performance optimization 