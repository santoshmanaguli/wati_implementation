# Quick Railway Deployment Guide

## 🚀 Quick Start

### 1. Prepare Your Code

Make sure your code is pushed to GitHub.

### 2. Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect it's a Node.js app
5. Set the **Root Directory** to `backend`

### 3. Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway automatically creates a `DATABASE_URL` environment variable

### 4. Update Prisma Schema for PostgreSQL

Update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Commit and push this change.

### 5. Configure Environment Variables

In Railway → Your Backend Service → Variables, add:

```env
PORT=3000
NODE_ENV=production
# DATABASE_URL is auto-added by Railway PostgreSQL

# Get these after deployment:
BASE_URL=https://your-backend.railway.app
FRONTEND_URL=https://your-frontend.railway.app

# Your WATI credentials:
WATI_API_ENDPOINT=https://live-mt-server.wati.io/472997/api/v1
WATI_API_TOKEN=your_token_here
WATI_WHATSAPP_NUMBER=your_number
WATI_CHANNEL_PHONE_NUMBER=your_channel
WATI_INVOICE_TEMPLATE_NAME=invoice_notification
```

**Important:** After Railway gives you a domain, update `BASE_URL` and `FRONTEND_URL`.

### 6. Deploy Frontend

**Option A: Railway (Simple)**
1. Create another service in Railway
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Start command: `npx serve -s dist -p $PORT`

**Option B: Vercel (Recommended for React)**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Root directory: `frontend`
4. Framework preset: Vite
5. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api`

### 7. Run Database Migrations

In Railway dashboard:
1. Go to your backend service
2. Click "Deployments" → "View Logs"
3. Or use Railway CLI:
   ```bash
   railway run npx prisma migrate deploy
   ```

### 8. Update URLs

After both services are deployed:

1. **Backend:** Update `FRONTEND_URL` to your frontend URL
2. **Frontend:** Update `VITE_API_URL` to your backend URL (if using Vercel)

### 9. Test Public URLs

1. Create an invoice in your deployed app
2. Copy the public URL
3. Share it with a friend - it should work! 🎉

## 📝 Environment Variables Summary

### Backend (Railway)
- `DATABASE_URL` - Auto-added by Railway PostgreSQL
- `BASE_URL` - Your backend Railway URL
- `FRONTEND_URL` - Your frontend URL (Vercel/Railway)
- `WATI_API_*` - Your WATI credentials

### Frontend (Vercel/Railway)
- `VITE_API_URL` - Your backend Railway URL + `/api`

## 🔧 Troubleshooting

**Database errors?**
- Make sure Prisma schema uses `postgresql` not `sqlite`
- Run migrations: `railway run npx prisma migrate deploy`

**CORS errors?**
- Check `FRONTEND_URL` is set correctly in backend
- Verify frontend `VITE_API_URL` points to backend

**Public URLs not working?**
- Check `FRONTEND_URL` in backend environment variables
- Verify frontend is deployed and accessible

## 🎯 Production Checklist

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database added
- [ ] Prisma schema updated to PostgreSQL
- [ ] Migrations run successfully
- [ ] Frontend deployed (Vercel/Railway)
- [ ] Environment variables configured
- [ ] Public URLs tested
- [ ] Custom domain added (optional)

## 💡 Pro Tips

1. **Use Railway's PostgreSQL** - It's free and works great
2. **Deploy frontend to Vercel** - Better for React apps, free tier available
3. **Set up custom domains** - Makes URLs cleaner
4. **Enable Railway's metrics** - Monitor your app performance
5. **Use Railway's GitHub integration** - Auto-deploy on push

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs in Railway dashboard

