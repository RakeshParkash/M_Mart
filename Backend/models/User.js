const mongoose = require("mongoose");

// Purchase history (legacy, can be kept for reference)
const purchaseSchema = new mongoose.Schema({
  date: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      advancePaid: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      status: { type: String, default: "Delivered" }
    }
  ]
}, { _id: false });

// Due history (legacy)
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

// Cart item schema
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

// Wishlist item schema
const wishlistItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

// Order item schema
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
}, { _id: false });

// Payment schema for future integration
const paymentSchema = new mongoose.Schema({
  method: { type: String },                    // e.g. "COD", "Stripe", "UPI", "PayPal"
  transactionId: { type: String },             // For gateway reference
  status: { type: String, default: "Pending" },// Pending, Completed, Failed
  paidAmount: { type: Number, default: 0 },    // Amount paid so far
  totalAmount: { type: Number },               // Total order amount
  paidAt: { type: Date },                      // When payment was made
}, { _id: false });

// Order schema
const orderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  items: [orderItemSchema],
  status: { type: String, default: "Placed" }, // Placed, Processing, Delivered, Cancelled, etc.
  payment: paymentSchema,
}, { _id: false });

// User schema
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
  cart: { type: [cartItemSchema], default: [] },
  wishlist: { type: [wishlistItemSchema], default: [] },
  orders: { type: [orderSchema], default: [] },         
  totalAmountSpent: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;