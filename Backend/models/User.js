const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g., "2025-07-19"
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      advancePaid: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    }
  ]
}, { _id: false });

const dueSchema = new mongoose.Schema({
  date: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      dueAmount: { type: Number, required: true },
      fullyPaid: { type: Boolean, required: true }
    }
  ]
}, { _id: false });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  purchased_history: {
    type: [purchaseSchema],
    default: [],
  },
  dues: {
    type: [dueSchema],
    default: [],
  },
}, {
  timestamps: true,
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
