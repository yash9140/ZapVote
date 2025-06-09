const mongoose = require('mongoose');
const PollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Poll', PollSchema);