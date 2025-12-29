# Railway Deployment - IMPORTANT SETUP

## ⚠️ Critical: Set Root Directory in Railway

Railway is reading from the **root** of your repository, but your backend code is in the `backend/` folder.

### Step 1: Configure Railway Service

1. Go to your Railway project dashboard
2. Click on your **backend service**
3. Go to **Settings** tab
4. Scroll to **"Root Directory"**
5. Set it to: `backend`
6. Save

### Step 2: Verify Builder

1. In the same Settings page
2. Under **"Build & Deploy"**
3. Make sure **"Builder"** is set to **"Dockerfile"**
4. If it says "Nixpacks", change it to "Dockerfile"

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create `DATABASE_URL` environment variable
4. Link it to your backend service

### Step 4: Environment Variables

In your backend service → **Variables** tab, add:

```env
PORT=3000
NODE_ENV=production
# DATABASE_URL is auto-added by Railway PostgreSQL

# Update these AFTER deployment with your actual URLs:
BASE_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-frontend.vercel.app

# Your WATI credentials:
WATI_API_ENDPOINT=https://live-mt-server.wati.io/472997/api/v1
WATI_API_TOKEN=your_token
WATI_WHATSAPP_NUMBER=your_number
WATI_CHANNEL_PHONE_NUMBER=your_channel
WATI_INVOICE_TEMPLATE_NAME=invoice_notification
```

### Step 5: Update Prisma Schema

**IMPORTANT:** Before deploying, update `backend/prisma/schema.prisma`:

Change:
```prisma
datasource db {
  provider = "sqlite"  // ❌ Remove this
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "postgresql"  // ✅ Use this
  url      = env("DATABASE_URL")
}
```

### Step 6: Deploy

1. Push your code to GitHub
2. Railway will auto-deploy
3. Check logs to ensure it builds successfully

## Troubleshooting

**If it still uses Nixpacks:**
- Make sure Root Directory is set to `backend`
- Make sure Builder is set to "Dockerfile" in Settings
- The `backend/railway.json` should have `"builder": "DOCKERFILE"`

**If build fails:**
- Check that `backend/Dockerfile` exists
- Verify PostgreSQL database is added
- Check that `DATABASE_URL` is set
- Review build logs in Railway dashboard

**If migrations fail:**
- Make sure Prisma schema uses `postgresql`
- Check `DATABASE_URL` is correct
- Run manually: `railway run npx prisma migrate deploy`

