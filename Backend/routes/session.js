const express = require('express');
const Session = require('../models/Session');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');
const router = express.Router();

function generateSessionCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

router.post('/start', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { pollId } = req.body;
  
  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    
    const code = generateSessionCode();
    const session = await Session.create({ code, poll: pollId });
    
    res.json({ 
      code, 
      sessionId: session._id,
      question: poll.question 
    });
  } catch (err) {
    console.error('Error starting session:', err);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/end', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { pollId } = req.body;
  
  try {
    const session = await Session.findOne({ poll: pollId, endedAt: null });
    if (!session) return res.status(404).json({ error: 'Active session not found' });
    
    session.endedAt = new Date();
    await session.save();
    
    res.json({ message: 'Session ended successfully' });
  } catch (err) {
    console.error('Error ending session:', err);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const session = await Session.findOne({ code: req.params.code })
      .populate('poll');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;