const mongoose = require("mongoose");

const listItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, { _id: true }); // keep _id for easy updates

const customListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  items: [listItemSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("CustomList", customListSchema);
