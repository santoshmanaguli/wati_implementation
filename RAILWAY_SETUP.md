# Railway Deployment Setup

## Critical Configuration Steps

### 1. Set Root Directory in Railway Dashboard

**IMPORTANT:** You MUST set the Root Directory in Railway dashboard:

1. Go to your Railway project
2. Click on your service
3. Go to **Settings** tab
4. Scroll to **Root Directory**
5. Set it to: `backend`
6. Save changes

### 2. Verify Builder

1. In the same Settings tab
2. Verify **Builder** is set to: `Dockerfile`
3. It should automatically detect `backend/Dockerfile`

### 3. Environment Variables

Add these in Railway dashboard → Variables:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV=production`
- `PORT=3000` (optional, Railway sets this automatically)
- `BASE_URL` - Your Railway backend URL (e.g., `https://your-app.railway.app`)
- `FRONTEND_URL` - Your frontend URL (if deployed separately)

### 4. Add PostgreSQL Database

1. In Railway dashboard, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway will automatically create `DATABASE_URL` variable
4. Copy the connection string if needed

### 5. Deploy

After setting Root Directory to `backend`, push your code:

```bash
git add .
git commit -m "Configure Railway deployment"
git push
```

Railway will automatically:
- Find `backend/Dockerfile`
- Build from `backend/` directory
- Deploy successfully

## Troubleshooting

**Error: "Dockerfile does not exist"**
- ✅ Set Root Directory to `backend` in Railway dashboard

**Error: "/backend/src: not found"**
- ✅ Root Directory must be `backend` (not root)
- ✅ Dockerfile uses relative paths (no `backend/` prefix)

**Build succeeds but app crashes**
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL database is running
- Check logs in Railway dashboard

