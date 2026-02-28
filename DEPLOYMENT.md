# ReciMap - Deployment Guide

## Vercel Deployment Instructions

### 1. Project Configuration
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### 2. Environment Variables

Add these environment variables in Vercel Dashboard:

#### Database (Required)
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```
Get from: [Neon PostgreSQL](https://neon.tech)

#### Authentication (Required)
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app
```
Generate secret with: `openssl rand -base64 32`

#### Real-Time Features (Required)
```
ABLY_API_KEY=your-ably-api-key
NEXT_PUBLIC_ABLY_KEY=your-ably-public-key
```
Get from: [Ably](https://ably.com)

#### Google Maps (Required)
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-api-key
```
Get from: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

#### AI Features (Required)
```
OPENAI_API_KEY=your-openai-api-key
```
Get from: [OpenAI Platform](https://platform.openai.com/api-keys)

#### File Upload (Optional)
```
UPLOADTHING_TOKEN=your-uploadthing-token
```
Get from: [UploadThing](https://uploadthing.com)

### 3. Database Setup

After deploying, run the database migration:

```bash
npm run db:push
```

Then seed the database with demo data:

```bash
npm run db:seed
```

### 4. Post-Deployment

1. Update `NEXTAUTH_URL` to your Vercel domain
2. Configure Google Maps API restrictions to your domain
3. Test all features with demo accounts (password: `demo123`)

## Demo Accounts

- **Business**: restaurant@demo.com
- **Household**: maria@demo.com
- **Recycler**: recycler@demo.com
- **Center**: center@demo.com

All passwords: `demo123`

## Troubleshooting

### CSS Not Loading
- Clear Vercel build cache
- Redeploy the application

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon PostgreSQL connection pooling settings
- Ensure SSL mode is enabled

### Authentication Errors
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again
