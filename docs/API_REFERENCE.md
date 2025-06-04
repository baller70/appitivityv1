# BookmarkHub API Reference

## 🔗 **Base URL**
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 🔐 **Authentication**

All API endpoints support both authenticated and demo users:
- **Authenticated Users**: Automatic via Clerk session cookies
- **Demo Users**: Fallback to `demo-user` when no session present
- **Headers**: No additional headers required for browser requests

---

## 📚 **Bookmarks API**

### **Get All Bookmarks**
```http
GET /api/bookmarks
```

**Response**
```json
{
  "bookmarks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Example Bookmark",
      "url": "https://example.com",
      "description": "A sample bookmark",
      "favicon": "https://example.com/favicon.ico",
      "category": "development",
      "tags": ["web", "development"],
      "priority": "high",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "user_id": "user_123",
      "visits": 5
    }
  ]
}
```

### **Create Bookmark**
```http
POST /api/bookmarks
Content-Type: application/json
```

**Request Body**
```json
{
  "title": "New Bookmark",
  "url": "https://example.com",
  "description": "Optional description",
  "category": "development",
  "tags": ["web", "tool"],
  "priority": "medium"
}
```

**Response**
```json
{
  "bookmark": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "New Bookmark",
    "url": "https://example.com",
    "description": "Optional description",
    "favicon": "https://example.com/favicon.ico",
    "category": "development",
    "tags": ["web", "tool"],
    "priority": "medium",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "user_id": "user_123",
    "visits": 0
  }
}
```

### **Update Bookmark**
```http
PUT /api/bookmarks
Content-Type: application/json
```

**Request Body**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Bookmark",
  "description": "Updated description",
  "category": "productivity",
  "tags": ["updated", "tool"],
  "priority": "high"
}
```

**Response**
```json
{
  "bookmark": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Bookmark",
    "url": "https://example.com",
    "description": "Updated description",
    "favicon": "https://example.com/favicon.ico",
    "category": "productivity",
    "tags": ["updated", "tool"],
    "priority": "high",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T13:00:00Z",
    "user_id": "user_123",
    "visits": 0
  }
}
```

### **Delete Bookmark(s)**
```http
DELETE /api/bookmarks?id=bookmark_id
DELETE /api/bookmarks?ids=id1,id2,id3
```

**Query Parameters**
- `id` (string): Single bookmark ID to delete
- `ids` (string): Comma-separated list of bookmark IDs for bulk delete

**Response**
```json
{
  "success": true,
  "deleted": 1,
  "message": "Bookmark(s) deleted successfully"
}
```

---

## 📁 **Folders API**

### **Get All Folders**
```http
GET /api/folders
```

**Response**
```json
{
  "folders": [
    {
      "id": "development",
      "name": "Development",
      "description": "Programming resources and developer tools",
      "color": "#3b82f6",
      "icon": "Code",
      "bookmark_count": 5,
      "created_at": "2024-01-01T12:00:00Z"
    },
    {
      "id": "design",
      "name": "Design",
      "description": "Design tools and inspiration",
      "color": "#8b5cf6",
      "icon": "Palette",
      "bookmark_count": 3,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### **Create Folder**
```http
POST /api/folders
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "Custom Folder",
  "description": "My custom folder",
  "color": "#f59e0b",
  "icon": "Folder"
}
```

**Response**
```json
{
  "folder": {
    "id": "custom-folder",
    "name": "Custom Folder",
    "description": "My custom folder",
    "color": "#f59e0b",
    "icon": "Folder",
    "bookmark_count": 0,
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**Built-in Folders**
The system includes these pre-configured folders:
- `development` - Development tools and resources
- `design` - Design tools and inspiration
- `productivity` - Productivity and task management
- `learning` - Educational resources
- `entertainment` - Media and entertainment
- `uncategorized` - Default for unclassified bookmarks

---

## 🏷️ **Tags API**

### **Get All Tags**
```http
GET /api/tags
```

**Response**
```json
{
  "tags": [
    {
      "id": "1",
      "name": "web",
      "usage_count": 10,
      "created_at": "2024-01-01T12:00:00Z"
    },
    {
      "id": "2",
      "name": "development",
      "usage_count": 8,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### **Create Tag**
```http
POST /api/tags
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "new-tag"
}
```

**Response**
```json
{
  "tag": {
    "id": "3",
    "name": "new-tag",
    "usage_count": 0,
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

---

## 👤 **Profile API**

### **Create/Update Profile**
```http
POST /api/profile
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe"
}
```

**Response**
```json
{
  "success": true,
  "profile": {
    "id": "user_123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

## 🔍 **Search & Filtering**

### **Search Bookmarks**
Use query parameters with the bookmarks endpoint:
```http
GET /api/bookmarks?search=keyword&category=development&tags=web,tool
```

**Query Parameters**
- `search` (string): Search in title, description, and URL
- `category` (string): Filter by folder/category
- `tags` (string): Comma-separated list of tags
- `priority` (string): Filter by priority level (high, medium, low)
- `limit` (number): Limit number of results (default: 50)
- `offset` (number): Pagination offset (default: 0)

---

## ⚠️ **Error Handling**

### **Error Response Format**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation error)
- `500` - Internal Server Error

### **Common Error Codes**
- `VALIDATION_ERROR` - Request validation failed
- `DUPLICATE_BOOKMARK` - Bookmark URL already exists
- `BOOKMARK_NOT_FOUND` - Requested bookmark not found
- `FOLDER_NOT_FOUND` - Requested folder not found
- `INVALID_CATEGORY` - Invalid folder category
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 🔄 **Data Models**

### **Bookmark Model**
```typescript
interface Bookmark {
  id: string;                    // UUID
  title: string;                 // Required, max 200 chars
  url: string;                   // Required, valid URL
  description?: string;          // Optional, max 500 chars
  favicon?: string;              // Auto-fetched from URL
  category: string;              // Folder ID
  tags: string[];               // Array of tag names
  priority: 'high' | 'medium' | 'low';
  created_at: string;           // ISO 8601 timestamp
  updated_at: string;           // ISO 8601 timestamp
  user_id: string;              // User identifier
  visits: number;               // Visit counter
}
```

### **Folder Model**
```typescript
interface Folder {
  id: string;                   // Unique folder identifier
  name: string;                 // Display name
  description: string;          // Folder description
  color: string;                // Hex color code
  icon: string;                 // Icon name (Lucide)
  bookmark_count: number;       // Number of bookmarks
  created_at: string;           // ISO 8601 timestamp
}
```

### **Tag Model**
```typescript
interface Tag {
  id: string;                   // Unique tag identifier
  name: string;                 // Tag name (lowercase)
  usage_count: number;          // How many bookmarks use this tag
  created_at: string;           // ISO 8601 timestamp
}
```

---

## 🚀 **Usage Examples**

### **JavaScript/TypeScript Client**
```typescript
class BookmarkClient {
  private baseURL = '/api';

  async getBookmarks(): Promise<Bookmark[]> {
    const response = await fetch(`${this.baseURL}/bookmarks`);
    const data = await response.json();
    return data.bookmarks;
  }

  async createBookmark(bookmark: Partial<Bookmark>): Promise<Bookmark> {
    const response = await fetch(`${this.baseURL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmark),
    });
    const data = await response.json();
    return data.bookmark;
  }

  async updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    const response = await fetch(`${this.baseURL}/bookmarks`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    const data = await response.json();
    return data.bookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    await fetch(`${this.baseURL}/bookmarks?id=${id}`, {
      method: 'DELETE',
    });
  }
}
```

### **cURL Examples**
```bash
# Get all bookmarks
curl -X GET "http://localhost:3000/api/bookmarks"

# Create a new bookmark
curl -X POST "http://localhost:3000/api/bookmarks" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GitHub",
    "url": "https://github.com",
    "category": "development",
    "tags": ["code", "git"],
    "priority": "high"
  }'

# Update a bookmark
curl -X PUT "http://localhost:3000/api/bookmarks" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "GitHub - Updated",
    "priority": "medium"
  }'

# Delete a bookmark
curl -X DELETE "http://localhost:3000/api/bookmarks?id=550e8400-e29b-41d4-a716-446655440000"
```

---

## 📊 **Rate Limiting** (Planned)

Future implementation will include rate limiting:
- **Authenticated Users**: 100 requests per minute
- **Demo Users**: 20 requests per minute
- **Bulk Operations**: 10 requests per minute

Headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔍 **Testing the API**

### **Using the Built-in Client**
The application includes a built-in API client at `src/lib/api/client.ts`:
```typescript
import { apiClient } from '@/lib/api/client';

// Get all bookmarks
const bookmarks = await apiClient.getBookmarks();

// Create a bookmark
const newBookmark = await apiClient.createBookmark({
  title: 'Test Bookmark',
  url: 'https://example.com',
  category: 'development'
});
```

### **API Testing Tools**
- **Built-in Demo Mode**: Test without authentication
- **Postman Collection**: Available in `/docs/postman/`
- **Insomnia Workspace**: Available in `/docs/insomnia/`
- **Jest Tests**: Run `npm run test:api`

---

## 📝 **Changelog**

### **v2.0.0** (Current)
- ✅ Enhanced authentication handling for demo users
- ✅ Improved error responses and status codes
- ✅ Added bulk delete operations for bookmarks
- ✅ Fixed folder API endpoints
- ✅ Added comprehensive input validation

### **v1.0.0** (Foundation)
- ✅ Initial API implementation
- ✅ Basic CRUD operations for bookmarks
- ✅ Folder and tag management
- ✅ Clerk authentication integration

---

## 📞 **Support**

For API-related questions or issues:
- **GitHub Issues**: Report bugs and request features
- **Documentation**: This reference and project docs
- **Code Examples**: Check `/examples/` directory

---

**Last Updated**: January 2025  
**API Version**: 2.0.0  
**Status**: ✅ Production Ready