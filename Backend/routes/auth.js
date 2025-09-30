const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken, verifyToken } = require("../utils/helpers");
const passport = require("passport");
const mongoose = require("mongoose");

router.post("/signup", async (req, res) => {
  let { firstName, lastName, email, phone, password } = req.body;

  // explicitly set undefined so Mongoose skips the field
  if (!email || email.trim() === "") email = undefined;

  if (!phone || !password || !firstName || !lastName)
    return res.status(400).json({ error: "Phone, password, firstName and lastName are required" });

  const existing = await User.findOne({ phone });
  if (existing) return res.status(409).json({ error: "Phone already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    firstName,
    lastName,
    ...(email && { email }),
    phone,
    password: hashed
  });

  const token = await getToken(phone, newUser);
  const userToReturn = { ...newUser.toJSON(), token };
  delete userToReturn.password;
  return res.status(201).json(userToReturn);
});

// Enhanced login route with better error handling
router.post("/login", async (req, res) => {
    try {
        
        
        const { phone, password } = req.body;
        
        // Validate input
        if (!phone?.trim() || !password?.trim()) {
            return res.status(400).json({ 
                success: false,
                message: 'Phone and password are required' 
            });
        }

        // Find user with phone validation
        const user = await User.findOne({ 
            phone: phone.trim() 
        }).select('+password'); // Ensure password is fetched
        
        if (!user) {
            console.log("No user found for phone:", phone.trim());
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' // Generic message for security
            });
        }

        // Password verification
        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            console.log("Password mismatch for user:", user._id);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Token generation
        const token = jwt.sign(
            { id: user._id, phone: user.phone },
            process.env.TOKEN_VALUE,
            { expiresIn: '30d' }
        );

        // Response
        const userToReturn = user.toObject();
        delete userToReturn.password;
        
        res.status(200).json({
            success: true,
            token,
            user: userToReturn
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

router.get("/me", verifyToken, passport.authenticate("user-jwt", { session: false }), async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/get/user/:userId", passport.authenticate("user-jwt", { session: false }), async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const authenticate = async (req, res, next) => {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token.' });
        const token = auth.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.TOKEN_VALUE);
            req.user = { id: payload.id };
            next();
        } catch {
            return res.status(401).json({ message: 'Invalid/expired token.' });
        }
    };

router.post('/change-password', authenticate, async (req, res) => {
    
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
        }
        if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized.' });
        }
        // Find user by id from JWT
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        // Optionally check if new password is strong, not same as old, etc.
        if (newPassword.length <= 6)
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        // Hash and set new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password successfully changed.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
    });






    function isValidObjectId(id) {
        return mongoose.Types.ObjectId.isValid(id);
    }
// --- CART ROUTES ---

// View cart
router.get('/cart', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});

// Add/update item in cart
router.post('/cart', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  const { productId, quantity } = req.body;
  if ( !isValidObjectId(productId) || !quantity || quantity < 1)
    return res.status(400).json({ message: `Valid productId and quantity > 0 required. `  });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Defensive: ensure cart is always array
    if (!Array.isArray(user.cart)) user.cart = [];

    let cartItem = user.cart.find(ci => ci.product && ci.product.equals(productId));
    if (cartItem) {
      cartItem.quantity += quantity;
      if (cartItem.quantity < 1) cartItem.quantity = 1;
    } else {
      user.cart.push({ product: productId, quantity: Math.max(1, quantity) });
    }

    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err.message });
  }
});

// Set quantity for an item in cart
router.patch('/cart/:productId', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;
  if (!isValidObjectId(productId) || !quantity || quantity < 1)
    return res.status(400).json({ message: "Valid productId and quantity > 0 required." });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Defensive comparison
    let cartItem = user.cart.find(ci => ci.product && ci.product.toString() === productId.toString());
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    cartItem.quantity = quantity;
    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    console.error('PATCH /cart/:productId error:', err);
    res.status(500).json({ message: "Error updating cart item", error: err.message });
  }
});

// Remove item from cart
router.delete('/cart/:productId', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId))
    return res.status(400).json({ message: "Valid productId required." });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(ci => ci.product && !ci.product.equals(productId));
    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ message: "Error removing cart item", error: err.message });
  }
});

// --- WISHLIST ROUTES ---

// View wishlist
router.get('/wishlist', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist.product');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Error fetching wishlist", error: err.message });
  }
});

// Add to wishlist
router.post('/wishlist', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  const { productId } = req.body;
  if (!isValidObjectId(productId))
    return res.status(400).json({ message: "Valid productId required." });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Defensive: ensure wishlist is always array
    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    if (!user.wishlist.some(wi => wi.product && wi.product.equals(productId))) {
      user.wishlist.push({ product: productId });
      await user.save();
    }
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Error updating wishlist", error: err.message });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId))
    return res.status(400).json({ message: "Valid productId required." });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(wi => wi.product && !wi.product.equals(productId));
    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Error removing wishlist item", error: err.message });
  }
});


// order 
// Place an order using cart contents
// Place an order using cart contents and optional payment method/address
router.post('/order', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  try {
    const { method, address, paymentDetails } = req.body; // add other info as needed
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Build order items from cart
    const items = user.cart.map(ci => ({
      product: ci.product._id,
      name: ci.product.name,
      quantity: ci.quantity,
      price: ci.product.selling_Price?.price || ci.product.price,
      total: ci.quantity * (ci.product.selling_Price?.price || ci.product.price),
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

    const order = {
      date: new Date(),
      items,
      status: "Placed",
      payment: {
        method: method || "COD",
        status: "Pending",
        totalAmount,
        paidAmount: 0,
        // You can add paymentDetails, address, etc
      },
      address: address || user.address, // if you store address
    };

    user.orders.push(order);
    user.cart = []; // Clear cart after placing order
    await user.save();

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error placing order", error: err.message });
  }
});

router.get('/orders', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ orders: user.orders });
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});


router.get('/order/:orderId', passport.authenticate("user-jwt", { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = user.orders.id(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
});




module.exports = router;