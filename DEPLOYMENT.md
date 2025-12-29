# Railway Deployment Guide

This guide will help you deploy the Invoice Management System to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. GitHub repository with your code
3. Railway CLI (optional, for easier management)

## Deployment Steps

### Option 1: Deploy Backend and Frontend Separately (Recommended)

#### Step 1: Deploy Backend

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory
6. Railway will automatically detect Node.js and start building

#### Step 2: Configure Backend Environment Variables

In Railway, go to your backend service → Variables tab and add:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=file:./prod.db
BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
WATI_API_ENDPOINT=your_wati_endpoint
WATI_API_TOKEN=your_wati_token
WATI_WHATSAPP_NUMBER=your_whatsapp_number
WATI_CHANNEL_PHONE_NUMBER=your_channel_number
WATI_INVOICE_TEMPLATE_NAME=invoice_notification
```

**Important:** 
- Replace `${{RAILWAY_PUBLIC_DOMAIN}}` with your actual Railway domain after deployment
- Railway provides `RAILWAY_PUBLIC_DOMAIN` automatically, but you can also use a custom domain

#### Step 3: Add PostgreSQL Database (Recommended)

SQLite doesn't work well on Railway. Use PostgreSQL instead:

1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. This will automatically create a `DATABASE_URL` environment variable
3. Update your Prisma schema to use PostgreSQL (see below)

#### Step 4: Update Prisma for PostgreSQL

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run migrations:
```bash
cd backend
npx prisma migrate deploy
```

#### Step 5: Deploy Frontend

1. In Railway, create a new service
2. Select "Deploy from GitHub repo" → your repository
3. Select the `frontend` folder as root
4. Set build command: `npm run build`
5. Set start command: `npm run preview` (or use a static file server)

**Better Option:** Use Vercel/Netlify for frontend (they're optimized for React apps)

### Option 2: Deploy as Monorepo

1. Create a new Railway project
2. Deploy from GitHub
3. Set root directory to project root
4. Configure build and start commands in `railway.json`

## Environment Variables Setup

### Backend Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Database (Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# URLs (Update after getting Railway domain)
BASE_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-frontend.railway.app

# WATI API (Your credentials)
WATI_API_ENDPOINT=https://live-mt-server.wati.io/472997/api/v1
WATI_API_TOKEN=your_token
WATI_WHATSAPP_NUMBER=your_number
WATI_CHANNEL_PHONE_NUMBER=your_channel
WATI_INVOICE_TEMPLATE_NAME=invoice_notification
```

### Frontend Variables (if using separate service)

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

Update `frontend/src/services/api.ts` to use `import.meta.env.VITE_API_URL`

## Post-Deployment Steps

1. **Get your Railway domain:**
   - Backend: `https://your-backend.railway.app`
   - Frontend: `https://your-frontend.railway.app`

2. **Update environment variables:**
   - Set `BASE_URL` to your backend URL
   - Set `FRONTEND_URL` to your frontend URL

3. **Run database migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```

4. **Test the deployment:**
   - Visit your frontend URL
   - Create a test invoice
   - Check if public URL works

## Custom Domain Setup

1. In Railway, go to your service → Settings → Domains
2. Add a custom domain
3. Update `FRONTEND_URL` and `BASE_URL` environment variables

## Troubleshooting

### Database Issues
- Use PostgreSQL instead of SQLite on Railway
- Ensure `DATABASE_URL` is set correctly
- Run migrations: `railway run npx prisma migrate deploy`

### Build Failures
- Check Railway logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18+)

### Public URLs Not Working
- Verify `FRONTEND_URL` is set correctly
- Check CORS settings in backend
- Ensure frontend proxy is configured correctly

## Railway CLI Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Run migrations
railway run npx prisma migrate deploy

# Open shell
railway shell
```

## Production Checklist

- [ ] Database migrated to PostgreSQL
- [ ] Environment variables configured
- [ ] Frontend URL updated in backend
- [ ] CORS configured for production domain
- [ ] Database migrations run
- [ ] Public URLs tested
- [ ] PDF generation working
- [ ] Custom domain configured (optional)

