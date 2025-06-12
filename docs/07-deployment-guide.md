# Deployment Guide - Appitivity v1

## Overview
This guide provides step-by-step instructions for deploying Appitivity v1 to production, including environment setup, MCP server configuration, and best practices for security and performance.

## Prerequisites
- Node.js v23.11.0 or higher
- npm v11.4.1 or higher
- Git (latest)
- Docker (optional, for MCP servers)
- All required API keys and environment variables

## 1. Clone the Repository
```bash
git clone https://github.com/baller70/appitivityv1.git
cd appitivityv1
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Configure Environment Variables
Copy the template and fill in your secrets:
```bash
cp .env.local.backup .env.local
```
Edit `.env.local` with your Clerk, Supabase, OpenAI, and Cloudinary keys.

## 4. MCP Server Setup
- See `docs/mcp-integrations.md` for details on MCP server configuration.
- Start required MCP servers (Firecrawl, Firebase, Desktop Commander, etc.)

## 5. Database Setup
- Supabase migrations are in `/supabase/`
- Run migrations as needed for your environment

## 6. Run the App Locally
```bash
npm run dev
```
- The app will start on the next available port (default: 3000)

## 7. Production Deployment
- Recommended: Deploy to Vercel or your preferred cloud provider
- Set all environment variables in your deployment dashboard
- Ensure MCP servers are accessible from your production environment

## 8. Post-Deployment Checklist
- Test all MCP integrations
- Verify authentication and database connectivity
- Run E2E tests (Playwright)
- Monitor logs and performance

## 9. Support
- For issues, see [GitHub Issues](https://github.com/baller70/appitivityv1/issues)
- For documentation, see the `/docs` folder

---

**Last Updated**: January 2025
**Version**: 1.0.0 