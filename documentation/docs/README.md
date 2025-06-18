# Apptivity Documentation

Welcome to the comprehensive documentation for Apptivity - a modern, AI-enhanced personal productivity dashboard for bookmark and app organization.

## 📚 Documentation Index

### Getting Started
- **[Project Overview](../README.md)** - Main project introduction and quick start
- **[Environment Setup](./environment-setup.md)** - Local development environment configuration
- **[Deployment Guide](./07-deployment-guide.md)** - Production deployment instructions

### User Documentation
- **[User Guide](./guides/user-guide.md)** - Comprehensive guide for using the Bookmark App
- **[Troubleshooting](./guides/troubleshooting.md)** - Common issues and solutions

### Developer Documentation
- **[Developer Guide](./guides/developer-guide.md)** - Setup, architecture, and coding standards
- **[API Documentation](./06-api-documentation.md)** - RESTful API endpoints and usage
- **[API Examples](./guides/api-examples.md)** - Detailed API request/response examples

### Planning & Architecture
- **[01. Project Idea](./01-project-idea.md)** - Vision, users, and guiding principles
- **[02. PRD - Core Features](./02-prd-core-features.md)** - Product requirements and acceptance criteria
- **[03. Architecture](./03-architecture.md)** - System architecture and technology choices

### Technical Documentation
- **[04. Database Schema](./04-database-schema.md)** - Complete database design and relationships
- **[05. Testing Strategy](./05-testing-strategy.md)** - Comprehensive testing approach and examples

### Operations & Integrations
- **[07. Deployment Guide](./07-deployment-guide.md)** - Production deployment and maintenance
- **[MCP Integrations](./mcp-integrations.md)** - Model Context Protocol integrations and tools

## 🎯 Quick Navigation

### For Developers
1. Start with **[Environment Setup](./environment-setup.md)** for local development
2. Review **[Architecture](./03-architecture.md)** to understand the system design
3. Check **[Database Schema](./04-database-schema.md)** for data structure
4. Reference **[API Documentation](./06-api-documentation.md)** for backend integration

### For Product Managers
1. Begin with **[Project Idea](./01-project-idea.md)** for vision and goals
2. Review **[PRD - Core Features](./02-prd-core-features.md)** for requirements
3. Check **[Testing Strategy](./05-testing-strategy.md)** for quality assurance

### For DevOps/Operations
1. Focus on **[Deployment Guide](./07-deployment-guide.md)** for production setup
2. Review **[Architecture](./03-architecture.md)** for infrastructure requirements
3. Check **[Environment Setup](./environment-setup.md)** for configuration details

## 🏗️ Project Structure

```
apptivity/
├── docs/                           # Documentation
│   ├── 01-project-idea.md         # Vision and requirements
│   ├── 02-prd-core-features.md    # Product requirements
│   ├── 03-architecture.md         # System architecture
│   ├── 04-database-schema.md      # Database design
│   ├── 05-testing-strategy.md     # Testing approach
│   ├── 06-api-documentation.md    # API reference
│   ├── 07-deployment-guide.md     # Deployment instructions
│   ├── environment-setup.md       # Development setup
│   ├── mcp-integrations.md        # MCP tools and integrations
│   └── README.md                  # This file
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   ├── components/                # React components
│   ├── lib/                       # Utility functions
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript definitions
│   └── styles/                    # Global styles
├── supabase/                      # Database migrations
├── tests/                         # Test files
├── public/                        # Static assets
└── package.json                   # Dependencies and scripts
```

## 🚀 Key Features

### ✅ Implemented
- **Bookmark Management**: Create, edit, delete, and organize bookmarks
- **Category System**: Hierarchical organization with visual indicators
- **Tag Management**: Flexible tagging for cross-category organization
- **Analytics**: Usage tracking and insights
- **MCP Integrations**: Model Context Protocol tools
- **Professional UI/UX**: Clean, modern design

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Heroicons, Lucide React
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **File Storage**: Supabase Storage

### Development Tools
- **Testing**: Jest, React Testing Library, Playwright
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript strict mode
- **Version Control**: Git with conventional commits

### Deployment
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics, Sentry (optional)

## 📋 Development Workflow

### 1. Setup
```bash
git clone https://github.com/baller70/apptivity.git
cd apptivity
npm install
cp .env.local.example .env.local
# Configure environment variables
npm run dev
```

### 2. Development
```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e
```

### 3. Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## 🤝 Contributing

### Code Quality Standards
- **Type Safety**: All code must be TypeScript with strict mode
- **Testing**: 80% test coverage minimum
- **Documentation**: Self-documenting code with inline comments
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimization

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Ensure all CI checks pass
5. Request review from maintainers

### Coding Standards
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add TypeScript types for all interfaces
- Include error handling and edge cases
- Write descriptive commit messages

## 📞 Support & Resources

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/baller70/apptivity/issues)
- **Discussions**: [GitHub Discussions](https://github.com/baller70/apptivity/discussions)
- **Documentation**: This documentation site

### External Resources
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Clerk**: https://clerk.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

### Community
- Follow development progress on GitHub
- Contribute to discussions and feature requests
- Report bugs and suggest improvements

---

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](../LICENSE) file for details.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Rise as One AAU Basketball 