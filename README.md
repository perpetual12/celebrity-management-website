# 🌟 Celebrity Connect

> **A comprehensive platform connecting fans with celebrities through appointments, messaging, and real-time interactions.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://your-app.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Railway-blue)](https://your-backend.railway.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Live Application

- **Frontend**: [https://celebrity-connect.vercel.app](https://your-app.vercel.app)
- **Backend API**: [https://celebrity-connect-api.railway.app](https://your-backend.railway.app)
- **Admin Panel**: [https://celebrity-connect.vercel.app/admin-login](https://your-app.vercel.app/admin-login)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## Features

- User authentication (register, login, logout)
- Celebrity profiles
- Appointment booking system
- Messaging system
- Dashboard for users and celebrities

## Tech Stack

- **Frontend**: React, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express, Passport.js
- **Database**: PostgreSQL, Sequelize ORM

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

### Database Setup

1. Create a PostgreSQL database named `celebrity_connect`
2. Update the database credentials in `backend/.env` if needed

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database with sample data:
   ```
   node setup-db.js
   ```

4. Start the server:
   ```
   npm run dev
   ```

The backend server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend will run on http://localhost:3000

## Sample Users

### Admin
- Username: admin
- Password: admin123

### Regular Users
- Username: john
- Password: user123

- Username: jane
- Password: user1