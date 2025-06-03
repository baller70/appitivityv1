# API Documentation - Apptivity

## Overview
Apptivity provides a RESTful API built with Next.js API routes for managing bookmarks, categories, tags, and user activities. All endpoints require authentication via Clerk and implement proper error handling.

## Authentication
All API endpoints require a valid Clerk session. The authentication is handled by Next.js middleware.

**Headers Required:**
```
Authorization: Bearer <clerk_session_token>
```

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Endpoints

### Bookmarks

#### GET /api/bookmarks
Retrieve user's bookmarks with optional filtering and pagination.

**Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `category` (string, optional): Filter by category ID
- `tag` (string, optional): Filter by tag name
- `search` (string, optional): Search in title and description
- `priority` (string, optional): Filter by priority (high, medium, low)
- `favorite` (boolean, optional): Filter favorites only

**Response:**
```typescript
{
  bookmarks: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    favicon_url: string | null;
    screenshot_url: string | null;
    category_id: string | null;
    priority: 'high' | 'medium' | 'low';
    is_favorite: boolean;
    visit_count: number;
    last_visited_at: string | null;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
    category: {
      id: string;
      name: string;
      color: string;
    } | null;
    tags: {
      id: string;
      name: string;
      color: string;
    }[];
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**Example:**
```bash
GET /api/bookmarks?page=1&limit=10&category=dev&search=react
```

#### POST /api/bookmarks
Create a new bookmark.

**Request Body:**
```typescript
{
  title: string;
  url: string;
  description?: string;
  category_id?: string;
  priority?: 'high' | 'medium' | 'low';
  tag_ids?: string[];
}
```

**Response:**
```typescript
{
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon_url: string | null;
  category_id: string | null;
  priority: 'high' | 'medium' | 'low';
  is_favorite: boolean;
  visit_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

**Example:**
```bash
POST /api/bookmarks
Content-Type: application/json

{
  "title": "React Documentation",
  "url": "https://react.dev",
  "description": "Official React documentation",
  "category_id": "cat-123",
  "priority": "high",
  "tag_ids": ["tag-1", "tag-2"]
}
```

#### GET /api/bookmarks/[id]
Retrieve a specific bookmark by ID.

**Response:**
```typescript
{
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon_url: string | null;
  screenshot_url: string | null;
  category_id: string | null;
  priority: 'high' | 'medium' | 'low';
  is_favorite: boolean;
  visit_count: number;
  last_visited_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}
```

#### PUT /api/bookmarks/[id]
Update an existing bookmark.

**Request Body:**
```typescript
{
  title?: string;
  url?: string;
  description?: string;
  category_id?: string;
  priority?: 'high' | 'medium' | 'low';
  is_favorite?: boolean;
  tag_ids?: string[];
}
```

**Response:** Same as GET /api/bookmarks/[id]

#### DELETE /api/bookmarks/[id]
Delete a bookmark.

**Response:**
```typescript
{
  message: "Bookmark deleted successfully";
}
```

#### POST /api/bookmarks/[id]/visit
Record a visit to a bookmark (increments visit count).

**Response:**
```typescript
{
  visit_count: number;
  last_visited_at: string;
}
```

### Categories

#### GET /api/categories
Retrieve user's categories with bookmark counts.

**Response:**
```typescript
{
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  bookmark_count: number;
  children: Category[];
}[]
```

#### POST /api/categories
Create a new category.

**Request Body:**
```typescript
{
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

#### PUT /api/categories/[id]
Update a category.

**Request Body:**
```typescript
{
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string;
  sort_order?: number;
}
```

#### DELETE /api/categories/[id]
Delete a category. Bookmarks in this category will be uncategorized.

**Response:**
```typescript
{
  message: "Category deleted successfully";
}
```

### Tags

#### GET /api/tags
Retrieve user's tags with usage counts.

**Response:**
```typescript
{
  id: string;
  name: string;
  color: string;
  created_at: string;
  usage_count: number;
}[]
```

#### POST /api/tags
Create a new tag.

**Request Body:**
```typescript
{
  name: string;
  color?: string;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  color: string;
  created_at: string;
}
```

#### DELETE /api/tags/[id]
Delete a tag. Removes all associations with bookmarks.

**Response:**
```typescript
{
  message: "Tag deleted successfully";
}
```

### Search

#### GET /api/search
Perform advanced search across bookmarks.

**Parameters:**
- `q` (string, required): Search query
- `type` (string, optional): Search type ('all', 'title', 'description', 'url')
- `category` (string, optional): Filter by category ID
- `tags` (string[], optional): Filter by tag IDs
- `priority` (string, optional): Filter by priority
- `date_from` (string, optional): Filter bookmarks created after date
- `date_to` (string, optional): Filter bookmarks created before date

**Response:**
```typescript
{
  results: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    category: {
      id: string;
      name: string;
    } | null;
    tags: {
      id: string;
      name: string;
    }[];
    relevance_score: number;
    created_at: string;
  }[];
  total: number;
  query: string;
  filters: Record<string, any>;
}
```

### Analytics

#### GET /api/analytics/dashboard
Get dashboard statistics and metrics.

**Response:**
```typescript
{
  stats: {
    total_bookmarks: number;
    bookmarks_this_month: number;
    total_visits: number;
    favorite_count: number;
  };
  category_breakdown: {
    category_id: string;
    category_name: string;
    bookmark_count: number;
    percentage: number;
  }[];
  recent_activity: {
    activity_type: string;
    bookmark_title: string;
    created_at: string;
  }[];
  top_bookmarks: {
    id: string;
    title: string;
    url: string;
    visit_count: number;
  }[];
}
```

#### GET /api/analytics/activity
Get user activity timeline.

**Parameters:**
- `period` (string, optional): Time period ('week', 'month', 'year')
- `type` (string, optional): Activity type filter

**Response:**
```typescript
{
  activities: {
    id: string;
    activity_type: string;
    bookmark_id: string | null;
    bookmark_title: string | null;
    metadata: Record<string, any>;
    created_at: string;
  }[];
  summary: {
    total_activities: number;
    period: string;
    breakdown: {
      [key: string]: number;
    };
  };
}
```

### Import/Export

#### POST /api/import/bookmarks
Import bookmarks from various formats.

**Request Body:**
```typescript
{
  format: 'html' | 'json' | 'csv';
  data: string; // Base64 encoded file content
  options?: {
    overwrite_duplicates: boolean;
    default_category_id?: string;
    preserve_structure: boolean;
  };
}
```

**Response:**
```typescript
{
  imported_count: number;
  skipped_count: number;
  errors: string[];
  summary: {
    total_processed: number;
    successful: number;
    failed: number;
  };
}
```

#### GET /api/export/bookmarks
Export user's bookmarks.

**Parameters:**
- `format` (string): Export format ('html', 'json', 'csv')
- `category` (string, optional): Export specific category only
- `include_metadata` (boolean, optional): Include metadata in export

**Response:**
```typescript
{
  filename: string;
  content: string; // Base64 encoded export content
  format: string;
  exported_count: number;
}
```

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `BOOKMARK_NOT_FOUND` - Bookmark doesn't exist
- `CATEGORY_NOT_FOUND` - Category doesn't exist
- `DUPLICATE_BOOKMARK` - Bookmark URL already exists
- `INVALID_URL` - URL format is invalid
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute per user
- **Search endpoints**: 20 requests per minute per user
- **Import endpoints**: 5 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhook Events

Apptivity can send webhook notifications for certain events:

### Available Events
- `bookmark.created`
- `bookmark.updated`
- `bookmark.deleted`
- `bookmark.visited`
- `category.created`
- `category.updated`
- `category.deleted`

### Webhook Payload
```typescript
{
  event: string;
  timestamp: string;
  user_id: string;
  data: {
    // Event-specific data
  };
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { ApptivityClient } from '@apptivity/sdk';

const client = new ApptivityClient({
  apiKey: 'your-api-key',
  baseURL: 'https://your-domain.com/api'
});

// Get bookmarks
const bookmarks = await client.bookmarks.list({
  category: 'development',
  limit: 10
});

// Create bookmark
const bookmark = await client.bookmarks.create({
  title: 'React Docs',
  url: 'https://react.dev',
  priority: 'high'
});
```

### cURL Examples
```bash
# List bookmarks
curl -H "Authorization: Bearer $TOKEN" \
  "https://your-domain.com/api/bookmarks?limit=10"

# Create bookmark
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"React Docs","url":"https://react.dev"}' \
  "https://your-domain.com/api/bookmarks"
``` 