const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken, verifyToken } = require("../utils/helpers");
const passport = require("passport");

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

    // View cart
    router.get('/cart', authenticate, async (req, res) => {
        const user = await User.findById(req.user.id).populate('cart.product');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ cart: user.cart });
    });

    // Add/update item in cart
    router.post('/cart', authenticate, async (req, res) => {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        let cartItem = user.cart.find(ci => ci.product.equals(productId));
        if (cartItem) {
            cartItem.quantity += quantity;
            if (cartItem.quantity < 1) cartItem.quantity = 1;
        } else {
            user.cart.push({ product: productId, quantity: Math.max(1, quantity) });
        }
        await user.save();
        res.json({ cart: user.cart });
    });

    // Set quantity for an item in cart
    router.patch('/cart/:productId', authenticate, async (req, res) => {
        const { quantity } = req.body;
        if (!quantity || quantity < 1) return res.status(400).json({ message: "Invalid quantity" });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        let cartItem = user.cart.find(ci => ci.product.equals(req.params.productId));
        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
        cartItem.quantity = quantity;
        await user.save();
        res.json({ cart: user.cart });
    });

    // Remove item from cart
    router.delete('/cart/:productId', authenticate, async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.cart = user.cart.filter(ci => !ci.product.equals(req.params.productId));
        await user.save();
        res.json({ cart: user.cart });
    });

    // View wishlist
    router.get('/wishlist', authenticate, async (req, res) => {
        const user = await User.findById(req.user.id).populate('wishlist.product');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ wishlist: user.wishlist });
    });

    // Add to wishlist
    router.post('/wishlist', authenticate, async (req, res) => {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.wishlist.some(wi => wi.product.equals(productId))) {
            user.wishlist.push({ product: productId });
            await user.save();
        }
        res.json({ wishlist: user.wishlist });
    });

    // Remove from wishlist
    router.delete('/wishlist/:productId', authenticate, async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.wishlist = user.wishlist.filter(wi => !wi.product.equals(req.params.productId));
        await user.save();
        res.json({ wishlist: user.wishlist });
    });

    // View total amount spent
    router.get('/total-amount', authenticate, async (req, res) => {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ totalAmountSpent: user.totalAmountSpent || 0 });
    });

    // PATCH purchase/dues item quantity
    router.patch('/history/:type/:date/:itemName', authenticate, async (req, res) => {
        const { type, date, itemName } = req.params;
        const { quantity } = req.body;
        if (!["purchased_history", "dues"].includes(type)) {
            return res.status(400).json({ message: "Invalid history type" });
        }
        if (typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ message: "Invalid quantity" });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const entry = user[type].find(entry => entry.date === date);
        if (!entry) return res.status(404).json({ message: "Date entry not found" });
        const item = entry.items.find(item => item.name === itemName);
        if (!item) return res.status(404).json({ message: "Item not found" });
        item.quantity = quantity;
        await user.save();
        res.json({ message: "Item quantity updated", user });
    });

    // DELETE purchase/dues item (per-item)
    router.delete('/history/:type/:date/:itemName', authenticate, async (req, res) => {
        const { type, date, itemName } = req.params;
        if (!["purchased_history", "dues"].includes(type)) {
            return res.status(400).json({ message: "Invalid history type" });
        }
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const entry = user[type].find(entry => entry.date === date);
        if (!entry) return res.status(404).json({ message: "Date entry not found" });
        entry.items = entry.items.filter(item => item.name !== itemName);
        // Remove the entry if no items left for that date
        if (entry.items.length === 0) {
            user[type] = user[type].filter(entry => entry.date !== date);
        }
        await user.save();
        res.json({ message: "History item deleted", user });
    });


module.exports = router;