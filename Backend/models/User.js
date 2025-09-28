const mongoose = require("mongoose");

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

// New: Cart item schema
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1 }
}, { _id: false });

// New: Wishlist item schema
const wishlistItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  addedAt: { type: Date, default: Date.now }
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
  // --- NEW FIELDS ---
  cart: { type: [cartItemSchema], default: [] },          // User's cart
  wishlist: { type: [wishlistItemSchema], default: [] },  // User's wishlist
  totalAmountSpent: { type: Number, default: 0 },         // Total spent by user, can be updated on purchases
}, {
  timestamps: true,
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;