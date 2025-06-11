# AppitivityV1 - Deployment & Setup Documentation

## 🚀 Project Overview

**AppitivityV1** is a comprehensive Next.js 15 application featuring advanced MCP (Model Context Protocol) integration, AI-assisted development tools, and a modern bookmark management dashboard.

### 🎯 Key Features

- **Next.js 15** with App Router and TypeScript
- **7 MCP Servers** for enhanced AI development workflow
- **Clerk Authentication** for secure user management
- **Supabase Database** for data persistence
- **Comprehensive Testing** with Playwright E2E
- **Professional UI/UX** with Tailwind CSS

## 📋 Prerequisites

### Required Software
- **Node.js**: v23.11.0 or higher
- **npm**: v11.4.1 or higher
- **Git**: Latest version
- **Docker**: For containerized services (optional)

### Required Accounts & API Keys
- **GitHub Account**: For repository access and Cursor integration
- **Clerk Account**: For authentication services
- **Supabase Account**: For database services
- **OpenAI Account**: For AI services (optional)
- **Cloudinary Account**: For media management (optional)

## 🛠️ Installation Guide

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/baller70/appitivityv1.git
cd appitivityv1

# Install dependencies
npm install

# Copy environment template
cp .env.local.backup .env.local
```

### 2. Environment Configuration

Create `.env.local` with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Additional Services
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. MCP Server Setup

The project includes 7 pre-configured MCP servers:

1. **Firecrawl MCP** - Web scraping and content extraction
2. **Firebase MCP** - Firebase services integration
3. **Desktop Commander** - Desktop automation
4. **ACI MCP Unified** - Unified API access
5. **Cloudinary MCP** - Media upload and management
6. **Docker MCP** - Docker container management
7. **Postman MCP** - API testing and collection management

#### MCP Configuration Location
```
.cursor/mcp.json
```

#### Test MCP Installation
```bash
# Run MCP server test
python3 test_mcp_installation.sh

# Verify all servers are responding
./verify_cursor_installation.sh
```

## 🔧 Development Workflow

### 1. Start Development Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm run start
```

### 2. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed
```

### 3. Testing

```bash
# Run all tests
npm test

# E2E testing with Playwright
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🌐 Deployment Options

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import `baller70/appitivityv1` repository

2. **Environment Variables**:
   - Add all `.env.local` variables to Vercel
   - Ensure all API keys are properly configured

3. **Deploy**:
   - Vercel will automatically deploy on push to main branch

### Alternative Deployment: Netlify

1. **Build Configuration**:
   ```toml
   # netlify.toml (already included)
   [build]
     command = "npm run build"
     publish = ".next"
   ```

2. **Environment Setup**:
   - Configure environment variables in Netlify dashboard
   - Enable automatic deployments

## 🔐 Security Configuration

### GitHub Integration

1. **Install Cursor GitHub App**:
   ```bash
   # Run automated installation script
   ./install_cursor_github_app.sh
   ```

2. **Repository Access**:
   - Ensure Cursor app has access to `appitivityv1` repository
   - Configure proper permissions for background agents

### API Key Management

- **Never commit API keys** to repository
- Use environment variables for all sensitive data
- Regularly rotate API keys for security
- Monitor for exposed secrets using GitHub's secret scanning

## 📊 Monitoring & Analytics

### Available Monitoring Tools

1. **Vercel Analytics** (if deployed on Vercel)
2. **Supabase Dashboard** for database monitoring
3. **Clerk Dashboard** for authentication analytics
4. **Custom logging** in application code

### Performance Monitoring

```bash
# Build analysis
npm run analyze

# Performance testing
npm run test:performance
```

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks

1. **Dependency Updates**:
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance**:
   - Regular backups via Supabase
   - Monitor query performance
   - Clean up unused data

3. **Security Updates**:
   - Monitor for security advisories
   - Update dependencies regularly
   - Review access permissions

### Backup Strategy

1. **Code**: Automatically backed up via Git
2. **Database**: Supabase automatic backups
3. **Environment**: Document all configurations
4. **Media**: Cloudinary automatic storage

## 🆘 Troubleshooting

### Common Issues

1. **MCP Servers Not Loading**:
   ```bash
   # Restart Cursor completely
   # Check MCP configuration
   cat .cursor/mcp.json
   
   # Test individual servers
   ./test_mcp_installation.sh
   ```

2. **Build Failures**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check for TypeScript errors
   npm run type-check
   ```

3. **Authentication Issues**:
   - Verify Clerk configuration
   - Check environment variables
   - Review Clerk dashboard for errors

### Support Resources

- **Documentation**: Check `/docs` folder
- **GitHub Issues**: Report bugs and feature requests
- **MCP Guides**: Comprehensive setup documentation included
- **Community**: Cursor AI community forums

## 📈 Performance Optimization

### Recommended Optimizations

1. **Image Optimization**: Use Cloudinary for automatic optimization
2. **Caching**: Implement proper caching strategies
3. **Bundle Analysis**: Regular bundle size monitoring
4. **Database**: Optimize queries and indexing

### Monitoring Performance

```bash
# Lighthouse CI
npm run lighthouse

# Bundle analyzer
npm run analyze

# Performance profiling
npm run profile
```

## 🎯 Next Steps

1. **Complete Cursor GitHub App Installation**
2. **Configure all environment variables**
3. **Test MCP server functionality**
4. **Deploy to production environment**
5. **Set up monitoring and analytics**
6. **Configure automated backups**

---

## 📞 Support

For technical support or questions:
- **Repository**: [https://github.com/baller70/appitivityv1](https://github.com/baller70/appitivityv1)
- **Issues**: Create GitHub issues for bugs or feature requests
- **Documentation**: Comprehensive guides in `/docs` folder

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✅ 