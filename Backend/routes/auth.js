const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ username, password: hash, role });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'User exists' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, role: user.role });
});

module.exports = router;