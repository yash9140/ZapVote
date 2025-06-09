const express = require('express');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const poll = await Poll.create({ ...req.body, createdBy: req.user.id });
  res.json(poll);
});

router.get('/history', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const polls = await Poll.find({ createdBy: req.user.id });
  res.json(polls);
});

module.exports = router;