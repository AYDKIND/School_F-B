# Deployment Guide - School BBD

## 🚀 Quick Start for Production

This guide helps you deploy your School BBD application to production. Perfect for developers getting started with deployment!

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (free tier works great!)
- Basic understanding of environment variables

## 📋 Step-by-Step Deployment

### 1. Prepare Your Environment

**Backend Setup:**
1. Copy `.env.example` to `.env` in the backend folder
2. Update your MongoDB connection:
   ```bash
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/school_bbd
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your_super_secret_key_here
   ```

**Frontend Setup:**
1. Update any API URLs in your frontend code to point to your production backend

### 2. Test Everything Locally

```bash
# Test frontend
npm run lint
npm run build
npm run preview

# Test backend
cd backend
npm run lint
npm run test:db
npm start:prod
```

### 3. Simple Deployment Options

#### Option A: Heroku (Beginner Friendly)
1. Install Heroku CLI
2. Create new app: `heroku create your-app-name`
3. Set environment variables in Heroku dashboard
4. Deploy: `git push heroku main`

#### Option B: Netlify + Railway
- **Frontend (Netlify):** Connect your GitHub repo, auto-deploys on push
- **Backend (Railway):** Connect GitHub, set environment variables, deploy

#### Option C: Traditional VPS
1. Upload files to your server
2. Install dependencies: `npm install --production`
3. Use PM2 for process management: `pm2 start src/server.js`

### 4. Environment Variables Checklist

**Required for Backend:**
- ✅ MONGODB_URI
- ✅ NODE_ENV=production
- ✅ JWT_SECRET
- ✅ PORT

**Optional but Recommended:**
- CORS_ORIGIN (your frontend URL)
- EMAIL_* (if using contact forms)

### 5. Post-Deployment Testing

1. **Health Check:** Visit `your-backend-url/health`
2. **Frontend:** Check all pages load correctly
3. **Database:** Test a simple operation (like contact form)
4. **Mobile:** Test on mobile devices

## 🔧 Common Issues & Solutions

**Problem:** "Cannot connect to MongoDB"
- **Solution:** Double-check your MONGODB_URI and whitelist your server IP

**Problem:** "CORS errors"
- **Solution:** Update CORS_ORIGIN to your frontend URL

**Problem:** "App crashes on startup"
- **Solution:** Check your environment variables and logs

## 📱 Production Checklist

Before going live:
- [ ] All environment variables set
- [ ] Database connection working
- [ ] Frontend builds without errors
- [ ] Mobile responsive design tested
- [ ] Contact forms working
- [ ] All pages accessible
- [ ] SSL certificate installed (HTTPS)

## 🎯 Performance Tips

1. **Enable gzip compression** on your server
2. **Use a CDN** for static assets
3. **Monitor your app** with simple tools like UptimeRobot
4. **Regular backups** of your database

## 📞 Need Help?

- Check the logs first: `heroku logs --tail` or server logs
- Test locally with production settings
- MongoDB Atlas has great documentation
- Most hosting platforms have excellent support docs

---

**Remember:** Start simple, deploy early, and improve gradually! 🚀

*This deployment guide is designed for developers new to production deployments. As you grow, you can explore more advanced deployment strategies.*