# System Patterns: BookmarkHub Architecture

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • React 19      │    │ • REST APIs     │    │ • Supabase      │
│ • TypeScript    │    │ • Auth (Clerk)  │    │ • Real-time     │
│ • Tailwind CSS  │    │ • Edge Functions│    │ • Full-text     │
│ • Radix UI      │    │ • File Storage  │    │   Search        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Technical Decisions

#### 1. **Next.js 15 with App Router**
**Decision**: Use Next.js App Router over Pages Router
**Rationale**: 
- Server Components reduce client-side JavaScript bundle
- Improved developer experience with file-based routing
- Better performance with automatic code splitting
- Simplified data fetching patterns

**Implementation Pattern**:
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Server-side data fetching
  const initialData = await getBookmarks();
  return <BookmarkDashboard initialData={initialData} />;
}
```

#### 2. **TypeScript-First Development**
**Decision**: Strict TypeScript with comprehensive type coverage
**Rationale**:
- Catch errors at compile time
- Improved developer experience with IntelliSense
- Self-documenting code with interfaces
- Easier refactoring and maintenance

**Implementation Pattern**:
```typescript
// types/bookmark.ts
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: Tag[];
  folder: Folder;
  created_at: Date;
  updated_at: Date;
  metadata: BookmarkMetadata;
}

// Comprehensive type safety throughout
type BookmarkWithRelations = Bookmark & {
  folder: Folder;
  tags: Tag[];
  visit_count: number;
};
```

#### 3. **Supabase as Backend-as-a-Service**
**Decision**: Use Supabase over custom backend
**Rationale**:
- Rapid development with pre-built authentication
- Real-time subscriptions out of the box
- PostgreSQL with full SQL capabilities
- Built-in file storage and CDN

**Implementation Pattern**:
```typescript
// lib/supabase.ts
const supabase = createClient(url, key);

// Type-safe database operations
const { data, error } = await supabase
  .from('bookmarks')
  .select(`
    *,
    folder:folders(*),
    bookmark_tags(tag:tags(*))
  `)
  .eq('user_id', userId);
```

#### 4. **Clerk for Authentication**
**Decision**: Use Clerk over NextAuth or custom auth
**Rationale**:
- Modern developer experience
- Social login providers pre-configured
- User management UI components
- Webhook support for user lifecycle events

**Implementation Pattern**:
```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Component Architecture Patterns

#### 1. **Compound Component Pattern**
Used for complex UI components with multiple related parts:

```typescript
// components/bookmark-form/index.tsx
export const BookmarkForm = {
  Root: BookmarkFormRoot,
  Input: BookmarkFormInput,
  TagSelector: TagSelector,
  FolderSelector: FolderSelector,
  Actions: FormActions
};

// Usage
<BookmarkForm.Root onSubmit={handleSubmit}>
  <BookmarkForm.Input name="url" />
  <BookmarkForm.TagSelector />
  <BookmarkForm.Actions />
</BookmarkForm.Root>
```

#### 2. **Custom Hooks for Business Logic**
Separate business logic from UI components:

```typescript
// hooks/useBookmarks.ts
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  
  const addBookmark = useCallback(async (bookmark: CreateBookmark) => {
    // Business logic for adding bookmark
  }, []);
  
  return { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark };
}
```

#### 3. **Context for Global State**
Use React Context for app-wide state management:

```typescript
// contexts/BookmarkContext.tsx
interface BookmarkContextType {
  bookmarks: Bookmark[];
  folders: Folder[];
  selectedFolder: Folder | null;
  searchTerm: string;
  viewMode: ViewMode;
}

export const BookmarkContext = createContext<BookmarkContextType>(null);

// Usage with custom hook
export function useBookmarkContext() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarkContext must be used within BookmarkProvider');
  }
  return context;
}
```

### Data Flow Patterns

#### 1. **Server-Client Data Flow**
```
Server Component → Database Query → Initial Data
       ↓
Client Component → Hydration → Interactive State
       ↓
User Action → Client State Update → API Call → Database Update
       ↓
Real-time Update → State Sync → UI Update
```

#### 2. **Search and Filtering Pattern**
```typescript
// Debounced search with URL state
export function useSearchBookmarks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BookmarkFilters>({});
  
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      // Update URL params
      // Trigger search API
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);
}
```

### Database Schema Patterns

#### 1. **Normalized Data Structure**
```sql
-- Core entities with proper relationships
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  folder_id UUID REFERENCES folders(id),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **Full-Text Search Setup**
```sql
-- Add search vector for efficient full-text search
ALTER TABLE bookmarks ADD COLUMN search_vector tsvector;

-- Create index for fast searching
CREATE INDEX idx_bookmarks_search ON bookmarks USING gin(search_vector);

-- Update search vector on bookmark changes
CREATE OR REPLACE FUNCTION update_bookmark_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.url, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Error Handling Patterns

#### 1. **Layered Error Handling**
```typescript
// API Layer Error Handling
export async function createBookmark(data: CreateBookmark): Promise<Result<Bookmark>> {
  try {
    const response = await supabase.from('bookmarks').insert(data);
    
    if (response.error) {
      return { success: false, error: response.error };
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: new Error('Network error') };
  }
}

// Component Error Boundary
export class BookmarkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Bookmark error:', error, errorInfo);
  }
}
```

#### 2. **User-Friendly Error Messages**
```typescript
// Error message mapping
const ERROR_MESSAGES = {
  'NETWORK_ERROR': 'Unable to connect. Please check your internet connection.',
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'PERMISSION_ERROR': 'You do not have permission to perform this action.',
  'QUOTA_EXCEEDED': 'Storage limit reached. Please upgrade your plan.'
} as const;

export function getErrorMessage(error: AppError): string {
  return ERROR_MESSAGES[error.code] || 'An unexpected error occurred.';
}
```

### Performance Optimization Patterns

#### 1. **Virtual Scrolling for Large Lists**
```typescript
// For handling large bookmark collections
export function VirtualizedBookmarkList({ bookmarks }: Props) {
  const { height, itemHeight } = useVirtualScrolling();
  
  return (
    <FixedSizeList
      height={height}
      itemCount={bookmarks.length}
      itemSize={itemHeight}
      itemData={bookmarks}
    >
      {BookmarkRow}
    </FixedSizeList>
  );
}
```

#### 2. **Optimistic Updates**
```typescript
// Update UI immediately, rollback on error
export function useOptimisticBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  const addBookmark = async (bookmark: CreateBookmark) => {
    const tempId = generateTempId();
    const optimisticBookmark = { ...bookmark, id: tempId };
    
    // Immediately update UI
    setBookmarks(prev => [...prev, optimisticBookmark]);
    
    try {
      const result = await api.createBookmark(bookmark);
      // Replace optimistic update with real data
      setBookmarks(prev => 
        prev.map(b => b.id === tempId ? result.data : b)
      );
    } catch (error) {
      // Rollback optimistic update
      setBookmarks(prev => prev.filter(b => b.id !== tempId));
      throw error;
    }
  };
}
```

### Security Patterns

#### 1. **Row Level Security (RLS)**
```sql
-- Ensure users can only access their own data
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own bookmarks" 
  ON bookmarks FOR ALL 
  USING (user_id = auth.uid());
  
CREATE POLICY "Users can only access own folders"
  ON folders FOR ALL
  USING (user_id = auth.uid());
```

#### 2. **Input Validation and Sanitization**
```typescript
// Zod schemas for runtime validation
const BookmarkSchema = z.object({
  title: z.string().min(1).max(255),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(20)
});

export function validateBookmark(data: unknown): CreateBookmark {
  return BookmarkSchema.parse(data);
}
```

### Testing Patterns

#### 1. **Component Testing Strategy**
```typescript
// Test components in isolation with mock data
test('BookmarkCard displays bookmark information', () => {
  const mockBookmark = createMockBookmark();
  
  render(<BookmarkCard bookmark={mockBookmark} />);
  
  expect(screen.getByText(mockBookmark.title)).toBeInTheDocument();
  expect(screen.getByText(mockBookmark.url)).toBeInTheDocument();
});
```

#### 2. **E2E Testing with Playwright**
```typescript
// Test critical user flows
test('user can create and organize bookmarks', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Create bookmark
  await page.click('[data-testid="add-bookmark"]');
  await page.fill('[name="url"]', 'https://example.com');
  await page.click('[data-testid="save-bookmark"]');
  
  // Verify bookmark appears
  await expect(page.locator('[data-testid="bookmark-card"]')).toBeVisible();
});
``` 