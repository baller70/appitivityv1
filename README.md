# BookmarkHub - Personal AppOrganizer Dashboard

A modern, responsive bookmark management dashboard inspired by the design at [v0-homepage-dashboard-design-nine.vercel.app](https://v0-homepage-dashboard-design-nine.vercel.app/).

## 🎯 **Project Overview**

This is a **one-to-one replica** of the BookmarkHub design, built as part of the "Personal/AppOrganizer Dashboard" project. It provides a clean, modern interface for organizing and managing bookmarks with comprehensive features.

## ✨ **Features**

### 🎨 **UI Components**
- **Responsive Sidebar Navigation** with collapsible functionality
- **Dashboard Statistics** showing bookmark counts and metrics
- **Bookmark Card Grid** with comprehensive information display
- **Dark Theme** with modern gray color scheme
- **Interactive Elements** with hover states and transitions
- **Custom 404 Error Page** with user-friendly navigation
- **Professional Favicon System** with dark mode support

### 📊 **Dashboard Stats**
- Total Bookmarks: `6`
- This Month: `+12`
- Total Visits: `210`
- Favorites: `3`

### 🔖 **Bookmark Features**
Each bookmark card includes:
- **Company Logo/Favicon**
- **Title and URL**
- **Screenshot Placeholder**
- **Description**
- **Tags** (category-based)
- **Priority Level** (High/Medium/Low with color coding)
- **Category Classification**
- **Visit Count Tracking**
- **Detailed Descriptions**
- **Favorite Toggle** (via API routes)
- **Selection Mode** with long-press functionality

### 📊 **Advanced Views**
- **Organizational Chart View** with hierarchical folder management
  - **Drag-and-Drop Hierarchy Lane** with customizable titles, colors, and icons
  - **Professional Vertical Lane** with Director/Teams/Collaborators structure
  - **Add More Titles** functionality with repositioning capabilities
  - **Filtering System** (search, hierarchy levels, sorting options)
  - **Pagination System** (5 bookmarks per container with navigation)
  - **Section-based Organization** with "Add Folder" buttons for each hierarchy level
- **List View** with comprehensive filtering and stats overview
- **Grid View** with responsive layouts and professional styling
- **Timeline View** with chronological bookmark organization
- **Compact View** for high-density display

### 📱 **Navigation Categories**
- **Dashboard** (Active)
- **Analytics**
- **Favorites** (3 items)
- **Settings**

### 🏷️ **Category Management**
- **Development** (2 bookmarks)
- **Design** (2 bookmarks)
- **Productivity** (2 bookmarks)
- **Learning** (0 bookmarks)
- **Entertainment** (0 bookmarks)

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neo4j (optional, for database features)

### Installation

```bash
# Clone the repository
git clone https://github.com/baller70/appitivityv1.git
cd appitivityv1

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Development Tools

```bash
# Test MCP servers
python3 test_mcp_servers.py

# Setup Neo4j BookHub database
python3 setup_bookhubdata.py
```

## 🛠️ **Tech Stack**

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4
- **Icons**: Heroicons React
- **Authentication**: Clerk Auth
- **Database**: Neo4j (BookHubData)
- **Deployment**: Vercel-ready
- **Development**: MCP Server Integration

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with favicon metadata
│   ├── page.tsx           # Homepage
│   └── not-found.tsx      # Custom 404 error page
├── components/            # React components
│   ├── layout/
│   │   ├── Sidebar.tsx           # Collapsible sidebar navigation
│   │   └── DashboardLayout.tsx   # Main layout wrapper
│   ├── dashboard/
│   │   ├── DashboardStats.tsx    # Statistics cards
│   │   └── bookmark-stats.tsx    # Enhanced bookmark statistics
│   ├── bookmarks/
│   │   ├── BookmarkGrid.tsx      # Bookmark cards grid
│   │   ├── bookmark-card.tsx     # Individual bookmark card component
│   │   └── bookmark-detail-modal.tsx # Detailed bookmark view modal
│   ├── folders/
│   │   ├── folder-org-chart-view.tsx     # Organizational chart view
│   │   ├── folder-hierarchy-manager.tsx  # Drag-and-drop hierarchy management
│   │   ├── folder-card.tsx              # Folder card component
│   │   └── folder-grid-view.tsx         # Grid view for folders
│   ├── views/
│   │   ├── list-view.tsx         # List view with filtering
│   │   ├── timeline-view.tsx     # Timeline chronological view
│   │   ├── compact-view.tsx      # High-density compact view
│   │   └── kanban-view.tsx       # Kanban board organization
│   ├── contexts/
│   │   └── SelectionContext.tsx  # Selection state management
│   └── notifications/
│       └── notification-context.tsx  # Notification system
├── styles/
│   └── globals.css        # Global styles and Tailwind imports
├── lib/                   # Utility functions
└── public/               # Static assets
    ├── favicon.ico       # Browser favicon
    └── favicon.svg       # SVG favicon with dark mode support
```

## 🔧 **Recent Improvements**

### Organizational Chart View Enhancement (Latest Update)
- ✅ **Drag-and-Drop Hierarchy Lane**: Implemented customizable hierarchy titles with colors and icons
- ✅ **Professional Lane Styling**: Clean, rectangular outlines without backgrounds for modern look
- ✅ **Dynamic Title Management**: Ability to add more titles and reposition them via drag-and-drop
- ✅ **Comprehensive Filtering**: Search, hierarchy filtering, sorting options with stats overview
- ✅ **Pagination System**: 5-bookmark limit per container with ChevronLeft/Right navigation
- ✅ **Section Organization**: Category-specific "Add Folder" buttons for each hierarchy level
- ✅ **Error Resolution**: Fixed bookmark favorite toggle API routing and SelectionProvider context
- ✅ **Interface Consistency**: Unified styling across all view components with professional design

### Console Error Fixes (Previous Update)
- ✅ **404 Favicon Errors**: Completely resolved with proper favicon implementation
- ✅ **Missing Icons**: Added `favicon.ico` and `favicon.svg` with dark mode support
- ✅ **Layout Metadata**: Updated `layout.tsx` with proper icon metadata configuration
- ✅ **Image Security**: Enhanced `next.config.js` with improved security and SVG support
- ✅ **Error Handling**: Custom 404 page for better user experience

### Database Integration
- ✅ **Neo4j Setup**: BookHubData database with project data relationships
- ✅ **Data Management**: Automated database setup script with project information
- ✅ **Knowledge Graph**: Integration with MCP knowledge graph for data persistence

### Development Environment
- ✅ **MCP Server Testing**: Comprehensive testing script for all configured servers
- ✅ **Configuration Fixes**: Updated MCP configuration for optimal performance
- ✅ **Environment Variables**: Proper API key management for all services

## 🎨 **Design Implementation**

### Color Scheme
- **Background**: Gray-900 (`#111827`)
- **Cards**: Gray-800 (`#1f2937`)
- **Borders**: Gray-700 (`#374151`)
- **Text Primary**: White
- **Text Secondary**: Gray-400 (`#9ca3af`)
- **Accent**: Blue-600 (`#2563eb`)
- **Success**: Green-400 (`#4ade80`)

### Typography
- **Headers**: Audiowide (Google Fonts)
- **Body**: Saira (Google Fonts)

### Responsive Design
- **Mobile-first approach**
- **Responsive grid layouts**
- **Collapsible sidebar**
- **Adaptive component sizing**

## 📋 **Reference Implementation**

This project is a faithful recreation of the original design found at:
**https://v0-homepage-dashboard-design-nine.vercel.app/**

### Exact Features Replicated:
1. ✅ Sidebar navigation with categories
2. ✅ Dashboard statistics grid
3. ✅ Bookmark cards with all metadata
4. ✅ Color scheme and typography
5. ✅ Responsive layout and interactions
6. ✅ Toggle sidebar functionality
7. ✅ Priority color coding
8. ✅ Tag system implementation

## 🚧 **Current Status**

- ✅ **Project Setup**: Complete
- ✅ **Basic Layout**: Complete  
- ✅ **Sidebar Component**: Complete
- ✅ **Dashboard Stats**: Complete
- ✅ **Bookmark Grid**: Complete
- ✅ **Responsive Design**: Complete
- ✅ **Console Error Fixes**: Complete
- ✅ **Favicon Implementation**: Complete
- ✅ **Error Handling**: Complete
- ✅ **Database Integration**: Complete
- ✅ **MCP Server Setup**: Complete
- ✅ **Organizational Chart View**: Complete
- ✅ **Drag-and-Drop Hierarchy**: Complete
- ✅ **Advanced Filtering & Pagination**: Complete
- ✅ **API Route Integration**: Complete
- ✅ **Context Management**: Complete
- 🔄 **Testing & Polish**: In Progress
- ⏳ **Real-time Collaboration Features**: Planned
- ⏳ **Advanced Analytics Dashboard**: Planned

## 📝 **Development Notes**

- Built with **TypeScript** for type safety
- Uses **Tailwind CSS** for consistent styling
- Implements **Next.js App Router** for modern routing
- **Mobile-responsive** design principles
- **Accessible** component design
- **Error-free console output** for optimal development
- **Professional favicon system** with dark mode support
- **Integrated Neo4j database** for data persistence
- **MCP server ecosystem** for advanced development tools

## 🧪 **Testing**

### Available Tests
- **MCP Server Status**: `python3 test_mcp_servers.py`
- **ESLint**: `npm run lint`
- **TypeScript**: `npm run type-check`
- **Build Verification**: `npm run build`

## 🤝 **Contributing**

This project follows atomic PR practices and includes:
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component testing setup
- Comprehensive error handling
- Professional development environment

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Attribution**: Design inspired by the original BookmarkHub dashboard at v0-homepage-dashboard-design-nine.vercel.app