const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  image: {
    type: String, // Cloudinary URL
    default: "",
  },
  manualText: {
    type: String,
    default: "",
  },
  amount: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model("Receipt", receiptSchema);
