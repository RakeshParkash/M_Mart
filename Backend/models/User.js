const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true, 
    sparse: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  purchased_history: {
    type: Object,
    required: false,
    default: {},
  },
  dues: {
    type: Object,
    required: false,
    default: {},
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
