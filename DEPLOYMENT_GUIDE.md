# 🚀 Celebrity Connect - Deployment Guide

## 📋 Overview
This guide will help you deploy the Celebrity Connect platform to make it live on the internet.

## 🏗️ Project Structure
```
Celebrity-Connect/
├── backend/                 # Node.js/Express API server
├── frontend/               # React.js web application
├── deployment/            # Deployment configurations
├── docs/                  # Documentation
└── scripts/              # Deployment scripts
```

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended)
- **Frontend**: Vercel (Free tier available)
- **Backend**: Railway (Free tier available)
- **Database**: Railway PostgreSQL

### Option 2: Netlify + Heroku
- **Frontend**: Netlify (Free tier available)
- **Backend**: Heroku (Free tier limited)
- **Database**: Heroku PostgreSQL

### Option 3: DigitalOcean Droplet
- **Full Stack**: Single VPS server
- **Database**: PostgreSQL on same server
- **Cost**: ~$5/month

## 🚀 Quick Deploy (Vercel + Railway)

### Step 1: Prepare Repository
1. Create GitHub repository
2. Push your code
3. Ensure all sensitive data is in environment variables

### Step 2: Deploy Backend (Railway)
1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend folder
4. Add environment variables
5. Deploy PostgreSQL database

### Step 3: Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Select frontend folder
4. Configure build settings
5. Add environment variables

## 📁 File Organization

### Required Files for Deployment:
- `package.json` (both frontend/backend)
- Environment configuration files
- Build scripts
- Database migration files
- Static assets

### Files to Exclude:
- `node_modules/`
- `.env` files (use platform env vars)
- Test files
- Development logs
- Temporary files

## 🔧 Environment Variables

### Backend Environment Variables:
```
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
ADMIN_SECRET_KEY=CELEBRITY_ADMIN_2024_SECURE
```

### Frontend Environment Variables:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENVIRONMENT=production
```

## 📦 Build Configuration

### Backend (package.json):
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### Frontend (package.json):
```json
{
  "scripts": {
    "build": "react-scripts build",
    "start": "serve -s build",
    "dev": "react-scripts start"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## 🗄️ Database Setup

### Production Database Schema:
1. Users table
2. Celebrities table
3. Appointments table
4. Messages table
5. Notifications table

### Migration Commands:
```sql
-- Run these in production database
-- (Will be provided in separate migration file)
```

## 🔒 Security Checklist

- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Session secrets updated
- [ ] Admin credentials changed
- [ ] File upload limits set
- [ ] Rate limiting enabled

## 📊 Monitoring & Maintenance

### Health Checks:
- Backend: `/health` endpoint
- Frontend: Build status
- Database: Connection status

### Logs:
- Application logs
- Error tracking
- Performance monitoring

## 🆘 Troubleshooting

### Common Issues:
1. **Build Failures**: Check Node.js version
2. **Database Connection**: Verify connection string
3. **CORS Errors**: Update allowed origins
4. **Environment Variables**: Check all required vars

### Support:
- Check deployment platform docs
- Review application logs
- Test locally first

## 📞 Next Steps

1. Choose deployment platform
2. Set up GitHub repository
3. Configure environment variables
4. Deploy backend first
5. Deploy frontend
6. Test live application
7. Set up monitoring

---

**Ready to deploy? Let's make Celebrity Connect live! 🌟**
