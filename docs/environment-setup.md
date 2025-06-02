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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Instructions

1. Sign up for Clerk at https://clerk.com/
2. Create a new application
3. Copy your publishable and secret keys from the Clerk dashboard
4. Create a Supabase project at https://supabase.com/
5. Copy your project URL and anon key from the Supabase dashboard
6. Update the `.env.local` file with your actual values

## Authentication Flow

- **Clerk** handles all authentication (sign-in, sign-up, session management)
- **Supabase** serves as the database layer only
- User IDs from Clerk are used to identify users in the Supabase database 