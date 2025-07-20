const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  unit: { type: String, required: true }
}, { _id: false });

const stockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["packet", "weight"],  // for fixed items or variable-weight items
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  quantity_Unit: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: stockSchema, required: true },  // uses sub-schema here
  selling_Price: { type: priceSchema, required: true },
  buying_Price: { type: priceSchema, required: true },
  category: { type: String, required: true }
}, {
  timestamps: true
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
