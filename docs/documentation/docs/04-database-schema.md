# Database Schema - Apptivity

## Overview
Apptivity uses Supabase (PostgreSQL) as the primary database with Row Level Security (RLS) enabled for user data protection. The schema is designed to support bookmark management, user activity tracking, and extensible categorization.

## Core Tables

### users
Stores user profile information and preferences.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Key Fields:**
- `clerk_user_id`: Links to Clerk authentication system
- `preferences`: JSON field for user settings and customizations
- `avatar_url`: Profile picture URL from Clerk or custom upload

### bookmarks
Central table for bookmark data and metadata.

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon_url TEXT,
  screenshot_url TEXT,
  category_id UUID REFERENCES categories(id),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  is_favorite BOOLEAN DEFAULT false,
  visit_count INTEGER DEFAULT 0,
  last_visited_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Key Fields:**
- `metadata`: JSON field for additional website information (Open Graph data, etc.)
- `priority`: Visual priority indicator with color coding
- `visit_count`: Tracks bookmark usage for analytics
- `is_favorite`: Quick access flag for important bookmarks

### categories
Hierarchical categorization system for bookmarks.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Key Fields:**
- `parent_id`: Enables nested categories/subcategories
- `color`: Hex color for visual identification
- `icon`: Icon identifier for UI display
- `sort_order`: Custom ordering within category level

### tags
Flexible tagging system for cross-category organization.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#64748b',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### bookmark_tags
Many-to-many relationship between bookmarks and tags.

```sql
CREATE TABLE bookmark_tags (
  bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  PRIMARY KEY (bookmark_id, tag_id)
);
```

### activities
Tracks user interactions for analytics and insights.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('visit', 'create', 'update', 'delete', 'favorite', 'search')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Activity Types:**
- `visit`: User clicked on a bookmark
- `create`: New bookmark added
- `update`: Bookmark modified
- `delete`: Bookmark removed
- `favorite`: Bookmark favorited/unfavorited
- `search`: Search performed

## Indexes

### Performance Indexes
```sql
-- User bookmarks lookup
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_category_id ON bookmarks(category_id);

-- Search functionality
CREATE INDEX idx_bookmarks_title_search ON bookmarks USING gin(to_tsvector('english', title));
CREATE INDEX idx_bookmarks_description_search ON bookmarks USING gin(to_tsvector('english', description));

-- Activity tracking
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_bookmark_id ON activities(bookmark_id);
CREATE INDEX idx_activities_type_created ON activities(activity_type, created_at);

-- Category hierarchy
CREATE INDEX idx_categories_user_parent ON categories(user_id, parent_id);
CREATE INDEX idx_categories_sort ON categories(user_id, sort_order);

-- Tag relationships
CREATE INDEX idx_bookmark_tags_bookmark ON bookmark_tags(bookmark_id);
CREATE INDEX idx_bookmark_tags_tag ON bookmark_tags(tag_id);
```

## Row Level Security (RLS)

### Security Policies
All tables implement RLS to ensure users can only access their own data.

```sql
-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Bookmarks table
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own bookmarks" ON bookmarks
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own categories" ON categories
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tags" ON tags
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));

-- Activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own activities" ON activities
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
  ));
```

## Triggers and Functions

### Updated At Trigger
Automatically updates the `updated_at` field when records are modified.

```sql
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_bookmarks
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_categories
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
```

### Activity Logging Trigger
Automatically logs bookmark interactions.

```sql
CREATE OR REPLACE FUNCTION log_bookmark_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activities (user_id, bookmark_id, activity_type, metadata)
    VALUES (NEW.user_id, NEW.id, 'create', '{}');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activities (user_id, bookmark_id, activity_type, metadata)
    VALUES (NEW.user_id, NEW.id, 'update', '{}');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activities (user_id, bookmark_id, activity_type, metadata)
    VALUES (OLD.user_id, OLD.id, 'delete', '{}');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookmark_activity_logger
  AFTER INSERT OR UPDATE OR DELETE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION log_bookmark_activity();
```

## Data Types and Constraints

### JSONB Usage
The schema leverages PostgreSQL's JSONB type for flexible data storage:

- **User Preferences**: Theme settings, dashboard layout, notification preferences
- **Bookmark Metadata**: Open Graph data, extracted keywords, custom fields
- **Activity Metadata**: Context-specific data for analytics

### Validation Constraints
- **URLs**: Basic format validation at application level
- **Priority Levels**: Enforced via CHECK constraints
- **Activity Types**: Enumerated values with CHECK constraints
- **Color Values**: Hex color format validation at application level

## Migration Strategy

### Version Control
Database changes are managed through numbered migration files:

```
supabase/migrations/
├── 001_create_basic_tables.sql
├── 002_add_indexes.sql
├── 003_enable_rls.sql
├── 004_add_triggers.sql
└── 005_add_search_indexes.sql
```

### Rollback Strategy
Each migration includes corresponding rollback SQL for safe deployments:

```sql
-- Migration: Add new column
ALTER TABLE bookmarks ADD COLUMN new_field TEXT;

-- Rollback: Remove column
-- ALTER TABLE bookmarks DROP COLUMN new_field;
``` 