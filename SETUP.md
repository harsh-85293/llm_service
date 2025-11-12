# IT Support Portal - MongoDB Setup

This application now uses MongoDB for data storage with a Node.js/Express backend API.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (connection string provided in .env)

## Architecture

- **Frontend**: React + Vite (runs on http://localhost:5173)
- **Backend**: Express + MongoDB (runs on http://localhost:3001)
- **Database**: MongoDB Atlas

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Variables

The `.env` files are already configured:

**Frontend (.env)**:
- `VITE_OPENAI_API_KEY` - Your OpenAI API key for AI features
- `VITE_API_URL` - Backend API URL (http://localhost:3001/api)

**Backend (server/.env)**:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Backend server port (3001)

### 3. Running the Application

You need to run both the backend and frontend:

**Option 1: Two Terminal Windows**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**Option 2: Background Backend**

```bash
# Start backend in background
npm run server &

# Start frontend
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Sign out

### Tickets
- `GET /api/tickets` - Get all tickets (user's own or all if admin)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `PATCH /api/tickets/:id` - Update ticket
- `GET /api/tickets/:id/logs` - Get ticket audit logs
- `POST /api/tickets/:id/llm` - Log LLM interaction

### Users (Admin only)
- `GET /api/users` - Get all users
- `PATCH /api/users/:id/role` - Update user role

## Database Collections

- **users** - User accounts with authentication
- **tickets** - Support tickets
- **auditlogs** - Audit trail for ticket actions
- **llminteractions** - AI/LLM interaction logs

## User Roles

- **user** - Default role, can create and view own tickets
- **admin** - Can view and manage all tickets
- **super_admin** - Full system access

To promote a user to admin:
1. Sign up as a user
2. Use MongoDB Compass or Atlas to update the user's `role` field to `admin`

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `server/.env`
- Verify port 3001 is not already in use

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings if accessing from different domain
- Verify `VITE_API_URL` in `.env`

### Authentication fails
- Clear browser localStorage
- Check JWT_SECRET is set in `server/.env`
- Verify MongoDB connection is working

## Development

- Frontend hot-reload: Automatic via Vite
- Backend hot-reload: Uses nodemon (restart on file changes)

## Building for Production

```bash
# Build frontend
npm run build

# Start backend in production mode
cd server
npm start
```

The frontend build will be in `dist/` directory and can be served by any static file server or deployed to platforms like Vercel, Netlify, etc.

The backend should be deployed to a Node.js hosting platform like Railway, Render, or AWS.
