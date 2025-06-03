# Celebrity Connect - Complete Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)

## Step 1: Install PostgreSQL

### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. **Important**: Remember the password you set for the `postgres` user
4. Default port is 5432 (keep this)
5. After installation, PostgreSQL should start automatically

### Verify PostgreSQL Installation:
Open Command Prompt or PowerShell and run:
```bash
psql --version
```

If you get "command not found", add PostgreSQL to your PATH:
1. Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\15\bin`)
2. Add this path to your system's PATH environment variable

## Step 2: Create Database

1. Open Command Prompt as Administrator
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres -h localhost
   ```
3. Enter the password you set during installation
4. Create the database:
   ```sql
   CREATE DATABASE celebrity_connect;
   \q
   ```

## Step 3: Update Environment Variables

The `.env` file in the backend directory should have:
```
PORT=5000
DB_NAME=celebrity_connect
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_HOST=localhost
DB_PORT=5432
SESSION_SECRET=celebrity-connect-secret-key
```

**Replace `YOUR_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.**

## Step 4: Install Dependencies

### Backend:
```bash
cd backend
npm install
```

### Frontend:
```bash
cd frontend
npm install
```

## Step 5: Setup Database Schema and Sample Data

```bash
cd backend
npm run setup-db
```

This will:
- Create all necessary tables (users, celebrities, appointments, messages)
- Insert sample data including admin and test users

## Step 6: Start the Application

### Start Backend (Terminal 1):
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

### Start Frontend (Terminal 2):
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

## Step 7: Test with Sample Data

### Sample Users:
- **Admin**: username: `admin`, password: `admin123`
- **Regular User**: username: `john`, password: `user123`
- **Regular User**: username: `jane`, password: `user123`
- **Celebrity**: username: `tomcruise`, password: `celeb123`
- **Celebrity**: username: `taylorswift`, password: `celeb123`

## Step 8: API Testing with Postman

1. Import the `Celebrity_Connect_API.postman_collection.json` file into Postman
2. The collection includes all API endpoints for testing
3. Base URL is set to `http://localhost:5000`

### Key API Endpoints:
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/celebrities` - Get all celebrities
- `POST /api/messages` - Send message to celebrity
- `GET /api/appointments/my-appointments` - Get user's appointments

## Troubleshooting

### Database Connection Issues:
1. Ensure PostgreSQL service is running
2. Check if the database `celebrity_connect` exists
3. Verify credentials in `.env` file
4. Check if port 5432 is available

### Frontend Issues:
1. Ensure backend is running on port 5000
2. Check browser console for errors
3. Verify axios is making requests to correct base URL

### Common Commands:
```bash
# Check PostgreSQL status (Windows)
sc query postgresql-x64-15

# Start PostgreSQL service (Windows)
net start postgresql-x64-15

# Connect to database
psql -U postgres -d celebrity_connect
```

## Project Structure

```
celebrity-connect/
├── backend/
│   ├── config/
│   │   ├── database.js      # PostgreSQL client configuration
│   │   └── passport.js      # Authentication strategy
│   ├── routes/
│   │   ├── users.js         # User authentication routes
│   │   ├── celebrities.js   # Celebrity management routes
│   │   ├── appointments.js  # Appointment booking routes
│   │   └── messages.js      # Messaging routes
│   ├── .env                 # Environment variables
│   ├── server.js           # Express server
│   └── setup-db.js         # Database setup script
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # React pages
│   │   └── App.js         # Main React app
│   └── package.json
└── Celebrity_Connect_API.postman_collection.json
```

## Next Steps

1. Test all functionality using the web interface
2. Use Postman to test API endpoints
3. Customize the application as needed
4. Add additional features or modify existing ones

For any issues, check the console logs in both frontend and backend terminals.
