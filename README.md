# Live Polling App

A full-stack web application for creating, managing, and participating in live polls. Features an admin dashboard, user (voter) interface, real-time results, and secure session management.

## Features
- Admin dashboard for poll creation and management
- User interface for joining and participating in polls
- Real-time voting and results (Socket.io)
- Secure authentication (JWT)
- Responsive, modern UI

## Project Structure
```
/Backend    # Node.js/Express backend (API, DB, authentication, sockets)
/Frontend   # React frontend (UI, charts, routing)
```

## Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)
- MongoDB (local or cloud, e.g. MongoDB Atlas)

---

## Backend Setup
1. **Install dependencies:**
   ```bash
   cd Backend
   npm install
   ```
2. **Configure environment:**
   - Create a `.env` file in `/Backend` with:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```
3. **Start the backend server:**
   ```bash
   npm start
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000)

---

## Frontend Setup
1. **Install dependencies:**
   ```bash
   cd Frontend
   npm install
   ```
2. **Start the frontend app:**
   ```bash
   npm start
   ```
   The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## Usage
- **Admin:** Register or log in to create and manage polls, start/end sessions, and view results.
- **User/Voter:** Join a poll session using the session code, enter your name, and vote in real time.

## Scripts
### Backend
- `npm start` — Start the backend server

### Frontend
- `npm start` — Start the React development server
- `npm run build` — Build the frontend for production
- `npm test` — Run frontend tests

---

## Customization
- **Background Images:** Update background images in the CSS files in `Frontend/src/components/` as needed.
- **API URLs:** If deploying the backend separately, update API URLs in the frontend configuration.

## License
This project is intended for company submission and internal use.