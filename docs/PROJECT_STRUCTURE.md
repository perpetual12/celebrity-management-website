# 📁 Celebrity Connect - Project Structure

## 🏗️ Overview

This document outlines the complete file and folder structure of the Celebrity Connect platform.

```
Celebrity-Connect/
├── 📁 backend/                    # Node.js/Express API Server
│   ├── 📁 config/                 # Configuration files
│   ├── 📁 models/                 # Database models
│   ├── 📁 routes/                 # API route handlers
│   │   ├── admin.js               # Admin-only routes
│   │   ├── appointments.js        # Appointment management
│   │   ├── celebrities.js         # Celebrity profiles
│   │   ├── messages.js            # Messaging system
│   │   ├── notifications.js       # Notification system
│   │   └── users.js               # User authentication
│   ├── 📁 services/               # Business logic services
│   ├── 📁 uploads/                # File upload storage
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Main server file
│
├── 📁 frontend/                   # React.js Web Application
│   ├── 📁 public/                 # Static assets
│   │   ├── index.html             # Main HTML template
│   │   ├── favicon.ico            # Website icon
│   │   └── manifest.json          # PWA manifest
│   ├── 📁 src/                    # Source code
│   │   ├── 📁 components/         # Reusable React components
│   │   │   ├── AdminLayout.js     # Admin dashboard layout
│   │   │   ├── Footer.js          # Website footer
│   │   │   ├── Navbar.js          # Navigation bar
│   │   │   └── ProtectedRoute.js  # Route protection
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── AdminDashboard.js  # Admin control panel
│   │   │   ├── AdminLogin.js      # Admin authentication
│   │   │   ├── Appointments.js    # User appointments
│   │   │   ├── CelebrityList.js   # Celebrity browsing
│   │   │   ├── CelebrityProfile.js # Celebrity details
│   │   │   ├── Dashboard.js       # User dashboard
│   │   │   ├── Home.js            # Homepage
│   │   │   ├── Login.js           # User login
│   │   │   ├── Messages.js        # User messaging
│   │   │   ├── Notifications.js   # User notifications
│   │   │   ├── Register.js        # User registration
│   │   │   └── UserProfile.js     # User profile management
│   │   ├── App.js                 # Main React component
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json               # Frontend dependencies
│   └── tailwind.config.js         # Tailwind CSS configuration
│
├── 📁 deployment/                 # Deployment configurations
│   ├── 📁 railway/                # Railway platform config
│   │   └── railway.json           # Railway deployment settings
│   ├── 📁 vercel/                 # Vercel platform config
│   │   └── vercel.json            # Vercel deployment settings
│   ├── .env.production.template   # Production environment template
│   └── database-migration.sql     # Database setup script
│
├── 📁 docs/                       # Documentation
│   ├── PROJECT_STRUCTURE.md       # This file
│   ├── API_DOCUMENTATION.md       # API endpoints guide
│   └── USER_GUIDE.md              # User manual
│
├── 📁 scripts/                    # Automation scripts
│   └── deploy.sh                  # Deployment automation
│
├── .gitignore                     # Git ignore rules
├── DEPLOYMENT_GUIDE.md            # Comprehensive deployment guide
├── QUICK_DEPLOY.md                # Quick deployment steps
├── README.md                      # Project overview
└── SETUP_GUIDE.md                 # Local development setup
```

## 📂 Key Directories Explained

### 🔧 Backend (`/backend/`)
**Purpose**: Server-side API and business logic
- **Entry Point**: `server.js`
- **Database**: PostgreSQL with pg client
- **Authentication**: Session-based with bcrypt
- **File Uploads**: Multer for profile images
- **API Structure**: RESTful endpoints

### 🎨 Frontend (`/frontend/`)
**Purpose**: User interface and client-side logic
- **Framework**: React.js 18
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React hooks
- **HTTP Client**: Axios

### 🚀 Deployment (`/deployment/`)
**Purpose**: Production deployment configurations
- **Railway**: Backend API hosting
- **Vercel**: Frontend static hosting
- **Database**: PostgreSQL migration scripts
- **Environment**: Production variables template

### 📚 Documentation (`/docs/`)
**Purpose**: Project documentation and guides
- **Structure**: This file
- **API**: Endpoint documentation
- **User Guide**: How to use the platform

### 🔨 Scripts (`/scripts/`)
**Purpose**: Automation and utility scripts
- **Deployment**: Automated deployment preparation
- **Database**: Migration and setup scripts

## 🗂️ File Types & Purposes

### 📄 Configuration Files
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - CSS framework configuration
- `vercel.json` - Frontend deployment settings
- `railway.json` - Backend deployment settings
- `.gitignore` - Version control exclusions

### 🔐 Security Files
- `.env.production.template` - Environment variables template
- Authentication middleware in routes
- Password hashing utilities
- Session management configuration

### 📊 Database Files
- `database-migration.sql` - Production database setup
- Model definitions in `/backend/models/`
- Database connection configuration

### 🎯 Core Application Files
- `server.js` - Backend entry point
- `App.js` - Frontend main component
- Route handlers in `/backend/routes/`
- Page components in `/frontend/src/pages/`

## 🔄 Data Flow

```
User Request → Frontend (React) → Backend API (Express) → Database (PostgreSQL) → Response
```

### 📱 Frontend Flow
1. User interacts with React components
2. Components make API calls via Axios
3. Responses update component state
4. UI re-renders with new data

### 🔧 Backend Flow
1. Express receives HTTP requests
2. Middleware handles authentication/validation
3. Route handlers process business logic
4. Database queries execute
5. JSON responses sent back

## 🌐 Deployment Architecture

```
Internet → Vercel (Frontend) → Railway (Backend) → Railway (PostgreSQL)
```

### 🎨 Frontend Deployment (Vercel)
- **Build**: `npm run build` creates static files
- **Serve**: Static files served via CDN
- **Routing**: Client-side routing with fallback

### 🔧 Backend Deployment (Railway)
- **Container**: Node.js application in container
- **Database**: Managed PostgreSQL instance
- **Environment**: Production environment variables

## 📋 File Naming Conventions

### 📁 Directories
- `kebab-case` for folder names
- Descriptive, purpose-driven names
- Logical grouping by functionality

### 📄 Files
- `PascalCase` for React components
- `camelCase` for JavaScript utilities
- `kebab-case` for configuration files
- `UPPER_CASE` for documentation

### 🔗 API Routes
- RESTful naming conventions
- Plural nouns for resources
- Descriptive endpoint names

## 🔧 Development vs Production

### 🛠️ Development Files (Excluded from Production)
- `node_modules/` - Dependencies (installed on deployment)
- `.env` files - Environment variables (set on platform)
- Test files - Development testing utilities
- Log files - Development debugging logs

### 🚀 Production Files (Included in Deployment)
- Source code - All application logic
- Configuration - Deployment settings
- Documentation - User and developer guides
- Migration scripts - Database setup

## 📊 File Size Considerations

### 🎯 Optimized for Deployment
- **Frontend Build**: Minified and compressed
- **Backend**: Production dependencies only
- **Images**: Optimized for web delivery
- **Database**: Efficient schema design

This structure ensures maintainability, scalability, and easy deployment of the Celebrity Connect platform! 🌟
