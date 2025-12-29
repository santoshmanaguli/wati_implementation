# Railway Deployment Setup - COMPLETE GUIDE

## ✅ Step 1: Add PostgreSQL Database

1. In Railway dashboard, click **"+ New"** button (top right)
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. **IMPORTANT:** Railway automatically creates `DATABASE_URL` variable for you - you don't need to add it manually!

## ✅ Step 2: Link Database to Your Service

1. Click on your **"wati_implementation"** service
2. Go to **"Variables"** tab
3. You should see `DATABASE_URL` automatically added (from the PostgreSQL service)
4. If you don't see it:
   - Click **"+ New Variable"**
   - Click **"Reference Variable"**
   - Select your PostgreSQL service
   - Select `DATABASE_URL`
   - Click **"Add"**

## ✅ Step 3: Verify Environment Variables

In the **Variables** tab, make sure you have:

- ✅ `DATABASE_URL` - Should be automatically set from PostgreSQL service
- ✅ `NODE_ENV=production` (optional but recommended)
- ✅ `PORT=3000` (Railway sets this automatically, but you can add it)
- ✅ `BASE_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app`)
- ✅ `FRONTEND_URL` - Your frontend URL (if deployed separately)

## ✅ Step 4: Set Root Directory (CRITICAL!)

1. Go to your **"wati_implementation"** service
2. Click **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Set it to: `backend`
5. Verify **"Builder"** is: `Dockerfile`
6. **Save changes**

## ✅ Step 5: Deploy

After setting up the database and variables:

```bash
git add .
git commit -m "Configure Railway deployment"
git push
```

Railway will automatically redeploy.

## 🔍 Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Solution:**
1. Make sure you added PostgreSQL database (Step 1)
2. Make sure `DATABASE_URL` is linked to your service (Step 2)
3. Check Variables tab - `DATABASE_URL` should be visible
4. If not visible, use "Reference Variable" to link it

### Error: "Dockerfile does not exist"

**Solution:**
- Set Root Directory to `backend` in Settings (Step 4)

### Error: "Prisma failed to detect OpenSSL"

**Solution:**
- This is just a warning, not an error. The app should still work.
- If it causes issues, we can update the Dockerfile to install OpenSSL explicitly.

### Service keeps crashing

**Check:**
1. Go to **"Deploy Logs"** tab (not Build Logs)
2. Look for runtime errors
3. Verify `DATABASE_URL` is set correctly
4. Check that PostgreSQL service is "Online"

## 📝 Quick Checklist

- [ ] PostgreSQL database added
- [ ] `DATABASE_URL` variable visible in Variables tab
- [ ] Root Directory set to `backend`
- [ ] Builder set to `Dockerfile`
- [ ] `BASE_URL` and `FRONTEND_URL` set (if needed)
- [ ] Code pushed to GitHub
- [ ] Service shows "Active" status

## 🎯 Next Steps After Deployment

1. Test the health endpoint: `https://your-app.railway.app/health`
2. Test API endpoints
3. Deploy frontend separately (Vercel recommended)
4. Update `FRONTEND_URL` in backend variables to match frontend URL
