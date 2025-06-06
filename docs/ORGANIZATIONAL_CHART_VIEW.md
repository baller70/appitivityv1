# Organizational Chart View - Technical Documentation

## Overview

The Organizational Chart View is an advanced bookmark management interface that presents folders and bookmarks in a hierarchical structure with a professional vertical lane system. This component provides drag-and-drop functionality, customizable hierarchy levels, and comprehensive filtering capabilities.

## Features

### 🎯 Core Functionality
- **Hierarchical Organization**: Director → Teams → Collaborators → Unassigned structure
- **Drag-and-Drop Management**: Repositionable hierarchy titles with visual feedback
- **Dynamic Title Management**: Add, edit, and customize hierarchy section titles
- **Professional Lane Styling**: Clean rectangular outlines with subtle colors and icons

### 🔍 Filtering & Search
- **Real-time Search**: Filter folders and bookmarks by name
- **Hierarchy Filtering**: Show/hide specific organizational levels
- **Sorting Options**: Name, bookmark count, recent activity, alphabetical
- **Statistics Overview**: Color-coded counts for each hierarchy level

### 📄 Pagination System
- **5-Bookmark Limit**: Optimized viewing with pagination controls
- **Navigation Controls**: ChevronLeft/Right buttons for easy browsing
- **Page Indicators**: Clear "1/3" style page numbering
- **Per-Folder State**: Independent pagination state for each folder

## Technical Implementation

### Component Structure

```typescript
// Main component file
src/components/folders/folder-org-chart-view.tsx

// Related components
src/components/folders/folder-hierarchy-manager.tsx  // Drag-and-drop logic
src/components/folders/folder-card.tsx              // Individual folder cards
src/components/bookmarks/bookmark-card.tsx          // Bookmark display cards
```

### State Management

```typescript
// Hierarchy configuration
const [hierarchySections, setHierarchySections] = useState<HierarchySection[]>([
  { id: 'director', title: 'DIRECTOR', icon: 'Crown', color: 'blue', order: 0 },
  { id: 'teams', title: 'TEAMS', icon: 'Users', color: 'green', order: 1 },
  { id: 'collaborators', title: 'COLLABORATORS', icon: 'User', color: 'purple', order: 2 },
  { id: 'unassigned', title: 'UNASSIGNED', icon: 'Settings', color: 'gray', order: 3 }
]);

// Pagination state per folder
const [bookmarkPages, setBookmarkPages] = useState<Record<string, number>>({});

// Filtering state
const [searchTerm, setSearchTerm] = useState('');
const [hierarchyFilter, setHierarchyFilter] = useState<string>('all');
const [sortBy, setSortBy] = useState<string>('name');
```

### Drag and Drop Implementation

The drag-and-drop functionality uses HTML5 drag-and-drop API with the following key handlers:

```typescript
// Drag start - capture section data
const handleDragStart = (e: React.DragEvent, sectionId: string) => {
  e.dataTransfer.setData('text/plain', sectionId);
  setDraggedSection(sectionId);
};

// Drop handler - reorder sections
const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
  e.preventDefault();
  const draggedSectionId = e.dataTransfer.getData('text/plain');
  
  if (draggedSectionId && draggedSectionId !== targetSectionId) {
    reorderSections(draggedSectionId, targetSectionId);
  }
  setDraggedSection(null);
};
```

### Color System

Subtle color palette for hierarchy sections:

```typescript
const availableColors = [
  { name: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { name: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  { name: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  { name: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  { name: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { name: 'gray', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
];
```

### Icon Integration

Uses Lucide React icons with dynamic loading:

```typescript
const availableIcons = [
  { name: 'Crown', icon: Crown },
  { name: 'Users', icon: Users },
  { name: 'User', icon: User },
  { name: 'Building', icon: Building },
  { name: 'Target', icon: Target },
  { name: 'Star', icon: Star },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Zap', icon: Zap }
];
```

## Usage

### Basic Implementation

```tsx
import { FolderOrgChartView } from '@/components/folders/folder-org-chart-view';

<FolderOrgChartView
  folders={folders}
  bookmarks={bookmarks}
  onBookmarkUpdated={handleBookmarkUpdate}
  onBookmarkDeleted={handleBookmarkDelete}
  onFolderUpdated={handleFolderUpdate}
  onFolderDeleted={handleFolderDelete}
  onHierarchyAssignmentsChange={handleHierarchyChange}
/>
```

### Props Interface

```typescript
interface FolderOrgChartViewProps {
  folders: Folder[];
  bookmarks: BookmarkWithRelations[];
  onBookmarkUpdated: (bookmark: BookmarkWithRelations) => void;
  onBookmarkDeleted: (bookmarkId: string) => void;
  onFolderUpdated: (folder: Folder) => void;
  onFolderDeleted: (folderId: string) => void;
  onHierarchyAssignmentsChange: (assignments: FolderHierarchyAssignment[]) => void;
}
```

## Advanced Features

### Adding New Hierarchy Sections

Users can add custom hierarchy sections with:

1. **Custom Title**: Editable section names
2. **Icon Selection**: Choose from available Lucide icons
3. **Color Themes**: Subtle color variations for visual organization
4. **Position Control**: Drag-and-drop ordering

### Filtering Options

- **Search Input**: Real-time filtering by folder/bookmark names
- **Hierarchy Dropdown**: Filter by specific organizational levels
- **Sort Dropdown**: Multiple sorting criteria
- **Stats Display**: Visual overview of distribution

### Pagination Controls

Each folder container includes:
- **Previous/Next Buttons**: ChevronLeft/ChevronRight navigation
- **Page Indicators**: Current page / total pages display
- **Bookmark Limit**: Configurable items per page (default: 5)

## Performance Considerations

### Optimization Strategies

1. **Virtual Scrolling**: For large bookmark collections
2. **Memoization**: React.memo for expensive card renders
3. **Debounced Search**: Prevent excessive filtering operations
4. **Lazy Loading**: Progressive bookmark loading for folders

### Memory Management

- **State Cleanup**: Proper cleanup of drag-and-drop listeners
- **Event Optimization**: Efficient event handler patterns
- **Component Unmounting**: Memory leak prevention

## Accessibility

### ARIA Implementation

- **Role Attributes**: Proper semantic roles for drag-and-drop elements
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Descriptive aria-labels and live regions
- **Focus Management**: Logical focus flow and visual indicators

### Keyboard Shortcuts

- **Arrow Keys**: Navigate between hierarchy sections
- **Space/Enter**: Activate drag-and-drop or selection
- **Tab**: Navigate through interactive elements
- **Escape**: Cancel drag operations or close modals

## Error Handling

### Graceful Degradation

- **Drag-and-Drop Fallback**: Alternative interaction methods
- **Network Errors**: Offline mode indicators
- **Data Validation**: Input sanitization and validation
- **Loading States**: Progressive loading indicators

## Testing Strategy

### Unit Tests

- Component rendering with various prop combinations
- Drag-and-drop functionality simulation
- Filtering and search operations
- Pagination state management

### Integration Tests

- End-to-end user workflows
- API integration scenarios
- Error boundary testing
- Performance benchmarking

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**: Multi-user editing capabilities
2. **Custom Themes**: User-defined color schemes
3. **Advanced Analytics**: Usage pattern insights
4. **Export Options**: PDF/Excel export functionality
5. **Mobile Optimization**: Touch-friendly interactions

### Technical Roadmap

- **TypeScript Strict Mode**: Enhanced type safety
- **React 19 Features**: Latest React optimizations
- **Performance Monitoring**: Real-time performance metrics
- **Accessibility Audit**: WCAG 2.1 AA compliance

---

## Support

For technical questions or feature requests, please refer to:
- [GitHub Issues](https://github.com/baller70/appitivityv1/issues)
- [Project Documentation](../README.md)
- [Changelog](../CHANGELOG.md)

*Last updated: December 19, 2024* 