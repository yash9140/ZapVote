const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // hashed
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
module.exports = mongoose.model('User', UserSchema);