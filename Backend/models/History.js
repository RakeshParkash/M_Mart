const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'user-deletion'
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false, // In case admin gets deleted
  },
  data: {
    type: Object,
    required: true, // Store deleted user data
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('History', historySchema);
