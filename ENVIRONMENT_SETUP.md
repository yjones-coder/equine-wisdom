# Environment Setup Guide

This project uses environment variables for sensitive configuration. **Never commit `.env` files to version control.**

## Required Environment Variables

### Database Configuration
- `DATABASE_URL` - MySQL/TiDB connection string (format: `mysql://user:password@host:port/database`)

### Authentication (Manus OAuth)
- `VITE_APP_ID` - Your Manus application ID
- `VITE_OAUTH_PORTAL_URL` - Manus OAuth portal URL
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `JWT_SECRET` - Secure random string for session signing (generate with: `openssl rand -base64 32`)

### Owner Information
- `OWNER_OPEN_ID` - Your Manus account OpenID
- `OWNER_NAME` - Your name

### Manus Built-in APIs
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint for LLM and storage
- `BUILT_IN_FORGE_API_KEY` - Bearer token for server-side API access
- `VITE_FRONTEND_FORGE_API_URL` - Manus API endpoint for frontend
- `VITE_FRONTEND_FORGE_API_KEY` - Bearer token for frontend API access

### Analytics (Optional)
- `VITE_ANALYTICS_ENDPOINT` - Analytics service endpoint
- `VITE_ANALYTICS_WEBSITE_ID` - Your website ID for analytics

### Application Metadata
- `VITE_APP_TITLE` - Application title (default: "Equine Wisdom")
- `VITE_APP_LOGO` - Path to logo file (default: "/logo.svg")

## Setup Instructions

1. **Copy the example file** (if deploying to a new environment):
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values** in the `.env.local` file with your actual credentials

3. **Never commit** `.env`, `.env.local`, or any file containing secrets

4. **For team collaboration**, share environment variables through a secure channel (1Password, LastPass, etc.)

## Security Checklist

- ✅ `.env*` files are in `.gitignore`
- ✅ Sensitive files (`.pem`, `.key`, `.crt`) are ignored
- ✅ Database credentials are never hardcoded
- ✅ API keys are only in environment variables
- ✅ Personal information is excluded from version control

## Local Development

When developing locally:
1. Create a `.env.local` file in the project root
2. Add your development environment variables
3. The application will use these values automatically
4. Never commit this file to git

## Deployment

When deploying to production:
1. Set environment variables through your hosting platform's dashboard (Manus, Vercel, etc.)
2. Do not upload `.env` files to your server
3. Ensure all sensitive values are stored securely in your platform's secrets manager
