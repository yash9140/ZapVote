require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/poll');
const sessionRoutes = require('./routes/session');
const Session = require('./models/Session');

const app = express();

// Configure CORS with specific origin
const allowedOrigins = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/session', sessionRoutes);

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Input validation helper
const validateSocketInput = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!data.code || typeof data.code !== 'string') return false;
  if (!data.user || typeof data.user !== 'string') return false;
  return true;
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinSession', async ({ code, user }) => {
    try {
      if (!validateSocketInput({ code, user })) {
        return socket.emit('error', 'Invalid input data');
      }

    const session = await Session.findOne({ code }).populate('poll');
      if (!session) {
        return socket.emit('error', 'Session not found');
      }

    socket.join(code);
    socket.emit('sessionJoined', { poll: session.poll, code });

    // Send current results
    const results = {};
    session.poll.options.forEach(opt => results[opt] = 0);
    session.responses.forEach(r => { results[r.option] = (results[r.option] || 0) + 1; });
    io.to(code).emit('updateResults', results);
    } catch (error) {
      console.error('Error in joinSession:', error);
      socket.emit('error', 'Internal server error');
    }
  });

  socket.on('submitVote', async ({ code, user, option }) => {
    try {
      if (!validateSocketInput({ code, user }) || !option) {
        return socket.emit('error', 'Invalid input data');
      }

    const session = await Session.findOne({ code }).populate('poll');
      if (!session) {
        return socket.emit('error', 'Session not found');
      }

      // Validate if the option exists in the poll
      if (!session.poll.options.includes(option)) {
        return socket.emit('error', 'Invalid option');
      }

    // Prevent double voting by same user
    session.responses = session.responses.filter(r => r.user !== user);
    session.responses.push({ user, option });
    await session.save();

    // Broadcast updated results
    const results = {};
    session.poll.options.forEach(opt => results[opt] = 0);
    session.responses.forEach(r => { results[r.option] = (results[r.option] || 0) + 1; });
    io.to(code).emit('updateResults', results);
    } catch (error) {
      console.error('Error in submitVote:', error);
      socket.emit('error', 'Internal server error');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));