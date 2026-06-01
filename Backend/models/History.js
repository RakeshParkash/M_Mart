const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'user-deletion', 'product-update', etc.
  entityType: { type: String, required: false }, // 'User', 'Product', 'Receipt', 'CustomList', 'Purchase', 'Due'
  action: { type: String, required: false }, // 'Create', 'Update', 'Delete'
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false, // In case admin gets deleted
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // if the action is tied to a specific user
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true, // Store the data that was changed
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('History', historySchema);
