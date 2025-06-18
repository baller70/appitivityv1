# 📁 Codebase Overview

*Auto-generated navigation guide for the Apptivity bookmark management application*

---

## 🏗️ **Core Application Structure**

### [`src/`](./src/) - Main Application Source
The heart of the Next.js application containing all React components, pages, and business logic.

### [`src/app/`](./src/app/) - Next.js App Router Pages
Contains all route pages including dashboard, analytics, bookmarks, AI features, and authentication flows.

### [`src/components/`](./src/components/) - React Component Library
Comprehensive collection of reusable UI components organized by feature domains (bookmarks, analytics, AI, etc.).

### [`src/lib/`](./src/lib/) - Core Business Logic & Utilities
Houses services, API clients, database utilities, AI integrations, and shared business logic.

---

## 🎯 **Feature-Specific Directories**

### [`docs/`](./docs/) - Project Documentation
Complete project documentation including architecture, API references, deployment guides, and development notes.

### [`supabase/`](./supabase/) - Database Schema & Migrations
Contains SQL migration files and database schema definitions for the Supabase backend.

### [`tests/`](./tests/) - Test Suite
End-to-end testing setup with Playwright for comprehensive application testing.

### [`scripts/`](./scripts/) - Build & Migration Scripts
Utility scripts for database migrations, schema fixes, and development automation.

---

## 🔧 **Configuration & Setup**

### [`public/`](./public/) - Static Assets
Static files including favicons and public assets served directly by Next.js.

### [`.storybook/`](./.storybook/) - Storybook Configuration
Component development environment setup for isolated UI component testing and documentation.

### [`memory-bank/`](./memory-bank/) - AI Assistant Memory
Documentation files for AI assistant context including project briefs, progress tracking, and system patterns.

---

## 🤖 **AI & Integration Tools**

### [`web-eval-agent/`](./web-eval-agent/) - Web Evaluation Agent
Python-based MCP server for web evaluation and browser automation capabilities.

### [`mcp-server-browserbase/`](./mcp-server-browserbase/) - Browser Automation
Browserbase MCP server integration for advanced web automation and testing.

### [`mcp-data/`](./mcp-data/) - MCP Data Storage
Data storage directory for Model Context Protocol (MCP) server operations and caching.

---

## 📊 **Development & Monitoring**

### [`playwright-report/`](./playwright-report/) - Test Reports
Generated test reports and artifacts from Playwright end-to-end test runs.

### [`test-results/`](./test-results/) - Test Artifacts
Additional test result files and debugging artifacts from test executions.

---

## 🚨 **Potential Cleanup Candidates**

> *Folders with minimal files that might be leftovers or need consolidation:*

- **[`src/contexts/`](./src/contexts/)** - Only contains `SelectionContext.tsx` (1 file) - Consider moving to components or consolidating
- **[`src/hooks/`](./src/hooks/)** - Contains 4 custom hooks - Small but actively used
- **[`__pycache__/`](./__pycache__)** - Python cache directory - Should be in `.gitignore`
- **[`.swc/`](./.swc/)** - SWC compiler cache - Should be in `.gitignore`
- **[`~`](./~)** - Temporary directory - Likely leftover, should be removed

---

## 🎨 **Styling & Assets**

### [`src/styles/`](./src/styles/) - Global Styles
Global CSS files and styling configurations for the application.

### [`src/types/`](./src/types/) - TypeScript Definitions
Custom TypeScript type definitions and interfaces used throughout the application.

---

## 📦 **Package Management**

- **`package.json`** - Main dependency manifest
- **`package-lock.json`** - Dependency lock file
- **`node_modules/`** - Installed dependencies (ignored in git)

---

## ⚙️ **Configuration Files**

- **`next.config.js`** - Next.js configuration
- **`tailwind.config.js`** - Tailwind CSS configuration  
- **`tsconfig.json`** - TypeScript configuration
- **`playwright.config.ts`** - Playwright testing configuration
- **`.cursorrules`** - Cursor AI assistant rules and preferences

---

*This overview is automatically generated. Click any folder link to navigate directly to that directory.*