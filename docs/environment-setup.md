# Environment Setup for AppOrganizer Dashboard

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs for development
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (Database only - no auth)
NEXT_PUBLIC_SUPABASE_URL=https://bpmixidxyljfvenukcun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Instructions

### 1. Clerk Authentication Setup
1. Sign up for Clerk at https://clerk.com/
2. Create a new application
3. Copy your publishable and secret keys from the Clerk dashboard
4. Update the `.env.local` file with your actual Clerk keys

### 2. Supabase Database Setup
1. Your Supabase project: **https://bpmixidxyljfvenukcun.supabase.co**
2. Go to your Supabase dashboard → Settings → API
3. Copy your `anon` key and `service_role` key
4. Update the `.env.local` file with your actual Supabase keys

### 3. Database Migration
Once your environment is set up, apply the database migrations:
```bash
# You'll need to run the SQL files in your Supabase SQL editor:
# - supabase/migrations/001_create_basic_tables.sql
# - supabase/migrations/002_add_indexes.sql  
# - supabase/migrations/003_enable_rls.sql
# - supabase/migrations/004_add_triggers.sql
```

## Authentication Flow

- **Clerk** handles all authentication (sign-in, sign-up, session management)
- **Supabase** serves as the database layer only
- User IDs from Clerk are used to identify users in the Supabase database

## Next Steps

1. Set up your Clerk application
2. Get your Supabase API keys
3. Apply the database migrations
4. Test the authentication flow 