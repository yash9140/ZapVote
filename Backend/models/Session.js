const mongoose = require('mongoose');
const SessionSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' },
  responses: [{ user: String, option: String }],
  startedAt: { type: Date, default: Date.now },
  endedAt: Date
});
module.exports = mongoose.model('Session', SessionSchema);