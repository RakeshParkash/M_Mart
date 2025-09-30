const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require("../models/User");
const Product = require("../models/Product");
const Contact = require('../models/Contact');
const History = require('../models/History');
const { createAccessToken, createRefreshToken, verifyToken, isAdmin, validateBody } = require('../utils/helpers');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();

/**
 * Admin Authentication
 */

// Middleware: check masterKey OR logged-in admin
const adminOrMasterKey = async (req, res, next) => {
    const { masterKey } = req.body;
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
        if (!masterKey || masterKey !== process.env.ADMIN_MASTER_KEY)
            return res.status(403).json({ err: 'Invalid master key' });
        return next();
    } else {
        passport.authenticate('admin-jwt', { session: false }, (err, user) => {
            if (err || !user || user.role !== 'admin')
                return res.status(403).json({ err: 'Admin privileges required' });
            req.user = user;
            return next();
        })(req, res, next);
    }
};

// Register admin
router.post('/register',
    body('phone').isMobilePhone('any').withMessage('Invalid phone number'),
    body('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }).withMessage('Weak password'),
    adminOrMasterKey,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { phone, password, email, firstName, lastName } = req.body;
        if (!phone || !password || !email || !firstName || !lastName)
            return res.status(400).json({ error: "Phone, email, password, firstName and lastName are required" });
        try {
            if (await Admin.findOne({ phone }))
                return res.status(409).json({ err: 'Phone already exists' });
            const admin = await Admin.create({ firstName, lastName, ...(email && { email }), phone, password });
            return res.status(201).json({ msg: 'Admin created successfully' });
        } catch (err) {
            console.error('Admin registration error:', err);
            return res.status(500).json({ err: 'Server error' });
        }
    }
);

// Login admin
router.post('/login',
    body('phone').isMobilePhone('any'),
    body('password').exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        const { phone, password } = req.body;
        const admin = await Admin.findOne({ phone });
        if (!admin || !(await admin.comparePassword(password)))
            return res.status(401).json({ err: 'Invalid credentials' });
        const accessToken = createAccessToken({ id: admin._id, role: admin.role });
        const refreshToken = createRefreshToken({ id: admin._id });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.status(200).json({ admin: safeAdmin, accessToken });
    }
);

// Logout admin
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logged out' });
});

// Refresh token
router.post('/token', (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ err: 'No refresh token' });
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err)
            return res.status(403).json({ err: 'Invalid refresh token' });
        const newAccess = createAccessToken({ id: payload.id, role: payload.role });
        res.json({ accessToken: newAccess });
    });
});

// Get admin profile
router.get('/me', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id).select('-password');
        if (!admin) return res.status(404).json({ err: 'Admin not found' });
        res.json({ admin });
    } catch (err) {
        res.status(500).json({ err: 'Server error' });
    }
});

/**
 * User Management (CRUD)
 */

// Add user
router.post('/add-user',
    passport.authenticate('admin-jwt', { session: false }),
    [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('password').notEmpty().withMessage('Password is required'),
        body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email must be valid'),
        body('lastName').optional({ checkFalsy: true }).trim()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        const { firstName, lastName, email, phone, password } = req.body;
        try {
            if (await User.findOne({ phone }))
                return res.status(409).json({ error: 'Phone number already exists' });
            if (email && await User.findOne({ email }))
                return res.status(409).json({ error: 'Email already exists' });
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName, lastName, phone, password: hashedPassword, ...(email && { email })
            });
            res.status(201).json({ message: 'User created successfully', user });
        } catch (err) {
            console.error('Error adding user:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Delete user
router.delete('/delete-user/:id',
    passport.authenticate('admin-jwt', { session: false }),
    async (req, res) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id))
                return res.status(400).json({ error: 'Invalid user ID' });
            const user = await User.findByIdAndDelete(id);
            if (!user) return res.status(404).json({ message: 'User not found' });
            await History.create({
                type: 'user-deletion', performedBy: req.user?._id || null, data: user, timestamp: new Date()
            });
            res.json({ message: 'User deleted and logged in history' });
        } catch (err) {
            console.error('Delete error:', err);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
);

// Get user deletion history
router.get('/deleted-history',
    passport.authenticate('admin-jwt', { session: false }),
    async (req, res) => {
        try {
            const logs = await History.find({ type: 'user-deletion' })
                .populate('performedBy', 'firstName lastName email')
                .sort({ timestamp: -1 });
            res.json({ history: logs });
        } catch (err) {
            console.error('Error fetching history:', err);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    }
);

// Get users (with pagination)
router.get('/users', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    try {
        const countOnly = req.query.count === 'true';
        let totalUsers = 0;
        if (countOnly) totalUsers = await User.countDocuments();
        const skip = parseInt(req.query.skip) || 0;
        const users = await User.find({})
            .select('firstName lastName email phone purchased_history dues cart wishlist')
            .skip(skip);
        res.json({ totalUsers, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user
router.put('/user/:id',
    passport.authenticate('admin-jwt', { session: false }),
    async (req, res) => {
        try {
            const updateFields = { ...req.body };
            if ('password' in updateFields && !updateFields.password) delete updateFields.password;
            const user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
            if (!user) return res.status(404).json({ error: "User not found" });
            res.json({ message: "User updated successfully", user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to update user" });
        }
    }
);

/**
 * Purchase & Due History (with product stock update)
 */

router.post('/user/:userId/purchase', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    try {
        const { date, items } = req.body;
        if (!date || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ message: 'Date and items are required' });
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let existingPurchase = user.purchased_history.find(ph => ph.date === date);
        if (!existingPurchase) {
            existingPurchase = { date, items: [] };
            user.purchased_history.push(existingPurchase);
        }

        for (const newItem of items) {
            const { name, quantity, advancePaid, totalPrice } = newItem;
            // Product stock update
            const purchasedProduct = await Product.findOne({ name });
            if (purchasedProduct) {
                if (purchasedProduct.stock.value < quantity)
                    return res.status(400).json({ message: `Insufficient stock for product: ${name}` });
                purchasedProduct.stock.value -= quantity;
                purchasedProduct.totalSold = (purchasedProduct.totalSold || 0) + quantity;
                await purchasedProduct.save();
            }
            // Update user history
            let purchaseIndex = user.purchased_history.findIndex(ph => ph.date === date);
            if (purchaseIndex === -1) {
                user.purchased_history.push({
                    date,
                    items: [{ name, quantity, advancePaid, totalPrice }]
                });
            } else {
                const purchaseEntry = user.purchased_history[purchaseIndex];
                const existingItem = purchaseEntry.items.find(i => i.name === name);
                if (existingItem) {
                    existingItem.quantity += quantity;
                    existingItem.advancePaid += advancePaid;
                    existingItem.totalPrice += totalPrice;
                } else {
                    purchaseEntry.items.push({ name, quantity, advancePaid, totalPrice });
                }
            }
            // Dues logic
            if (advancePaid < totalPrice) {
                const dueAmount = totalPrice - advancePaid;
                let dueIndex = user.dues.findIndex(d => d.date === date);
                if (dueIndex === -1) {
                    user.dues.push({ date, items: [{ name, quantity, dueAmount, fullyPaid: false }] });
                } else {
                    const dueEntry = user.dues[dueIndex];
                    const dueItem = dueEntry.items.find(i => i.name === name);
                    if (dueItem) {
                        dueItem.quantity += quantity;
                        dueItem.dueAmount += dueAmount;
                        dueItem.fullyPaid = false;
                    } else {
                        dueEntry.items.push({ name, quantity, dueAmount, fullyPaid: false });
                    }
                }
            }
        }
        await user.save();
        res.json({ message: 'Purchase and dues updated', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/user/:userId/due', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    try {
        const { date, items } = req.body;
        if (!date || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ message: "Date and items are required" });
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let existingEntry = user.dues.find(d => d.date === date);
        if (existingEntry) {
            for (const newItem of items) {
                const existingItem = existingEntry.items.find(i => i.name === newItem.name);
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                    existingItem.dueAmount += newItem.dueAmount;
                    existingItem.fullyPaid = existingItem.fullyPaid && newItem.fullyPaid;
                } else {
                    existingEntry.items.push(newItem);
                }
            }
        } else {
            user.dues.push({ date, items });
        }
        await user.save();
        res.json({ message: "Due history updated", user });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete user's history by date
router.delete('/user/:userId/history/:type/:date', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    const { type, date } = req.params;
    if (!["purchased_history", "dues"].includes(type))
        return res.status(400).json({ message: "Invalid history type" });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user[type] = user[type].filter(entry => entry.date !== date);
    await user.save();
    res.json({ message: `${type} entry removed`, user });
});

// Update quantity for a specific purchase/dues item
router.patch('/user/:userId/history/:type/:date/:itemName', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    const { type, date, itemName } = req.params;
    const { quantity } = req.body;
    if (!["purchased_history", "dues"].includes(type))
        return res.status(400).json({ message: "Invalid history type" });
    if (typeof quantity !== 'number' || quantity < 1)
        return res.status(400).json({ message: "Invalid quantity" });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const entry = user[type].find(entry => entry.date === date);
    if (!entry) return res.status(404).json({ message: "Date entry not found" });
    const item = entry.items.find(item => item.name === itemName);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.quantity = quantity;
    await user.save();
    res.json({ message: "Item quantity updated", user });
});

// Delete a specific purchase/dues item
router.delete('/user/:userId/history/:type/:date/:itemName', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    const { type, date, itemName } = req.params;
    if (!["purchased_history", "dues"].includes(type))
        return res.status(400).json({ message: "Invalid history type" });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const entry = user[type].find(entry => entry.date === date);
    if (!entry) return res.status(404).json({ message: "Date entry not found" });
    entry.items = entry.items.filter(item => item.name !== itemName);
    if (entry.items.length === 0)
        user[type] = user[type].filter(entry => entry.date !== date);
    await user.save();
    res.json({ message: "History item deleted", user });
});

/**
 * Product CRUD & Inventory (admin only)
 */

// Create product
router.post("/product", verifyToken, isAdmin, validateBody, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ message: "Product created successfully", product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Product creation failed", error: err.message });
    }
});

// Get all products
// Get all products (admin only)
router.get("/products", verifyToken, isAdmin, async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ products }); 
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

// Get products with count (pagination)
router.get("/products/count", verifyToken, isAdmin, async (req, res) => {
    try {
        const countOnly = req.query.count === 'true';
        let totalCount = 0;
        if (countOnly) totalCount = await Product.countDocuments();
        const limit = Math.min(parseInt(req.query.limit) || 5, 100);
        const skip = parseInt(req.query.skip) || 0;
        const products = await Product.find({})
            .select('name selling_Price')
            .limit(limit)
            .skip(skip);
        res.json({ totalCount, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get product by ID
router.get("/product/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: "Invalid product ID" });
    }
});

// Update product by ID
router.put("/product/:id", verifyToken, isAdmin, validateBody, async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated", product: updated });
    } catch (err) {
        res.status(400).json({ message: "Update failed", error: err.message });
    }
});

// Delete product by ID
router.delete("/product/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(400).json({ message: "Delete failed" });
    }
});

// Admin inventory endpoints
router.get("/inventory", passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    try {
        const products = await Product.find();
        const inventory = products.map(p => ({
            id: p._id,
            name: p.name,
            category: p.category,
            stock: p.stock.value,
            stockUnit: p.stock.unit,
            totalSold: p.totalSold || 0,
            totalDelivered: p.totalDelivered || 0,
            price: p.selling_Price.price,
            quantityUnit: p.quantity_Unit,
            image: p.image
        }));
        res.json({ inventory });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Add stock to product
router.post("/product/:id/add-stock", passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.stock.value += Number(quantity);
    await product.save();
    res.json({ message: "Stock added", product });
});

// Reduce stock on delivery/sale
router.post("/product/:id/deliver", passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock.value < quantity)
        return res.status(400).json({ message: "Insufficient stock" });
    product.stock.value -= Number(quantity);
    product.totalDelivered = (product.totalDelivered || 0) + Number(quantity);
    await product.save();
    res.json({ message: "Stock reduced after delivery", product });
});

/**
 * Cart & Wishlist (admin can manage any user)
 */

// View any user's cart
router.get("/user/:userId/cart", passport.authenticate("admin-jwt", { session: false }), async (req, res) => {
    const user = await User.findById(req.params.userId).populate('cart.product');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ cart: user.cart });
});

// View any user's wishlist
router.get("/user/:userId/wishlist", passport.authenticate("admin-jwt", { session: false }), async (req, res) => {
    const user = await User.findById(req.params.userId).populate('wishlist.product');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ wishlist: user.wishlist });
});

// Add to user's cart
router.post("/user/:userId/cart", passport.authenticate("admin-jwt", { session: false }), async (req, res) => {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.params.userId);
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

// Remove item from user's cart
router.delete("/user/:userId/cart/:productId", passport.authenticate("admin-jwt", { session: false }), async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.cart = user.cart.filter(ci => !ci.product.equals(req.params.productId));
    await user.save();
    res.json({ cart: user.cart });
});

// Add to user's wishlist
router.post("/user/:userId/wishlist", passport.authenticate("admin-jwt", { session: false }), async (req, res) => {
    const { productId } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.wishlist.some(wi => wi.product.equals(productId))) {
        user.wishlist.push({ product: productId });
        await user.save();
    }
    res.json({ wishlist: user.wishlist });
});

// Remove from user's wishlist
router.delete("/user/:userId/wishlist/:productId", passport.authenticate("admin-jwt", { session: false }), async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.wishlist = user.wishlist.filter(wi => !wi.product.equals(req.params.productId));
    await user.save();
    res.json({ wishlist: user.wishlist });
});

/**
 * Contact/Message Management
 */

// Get contact messages
router.get('/contact/messages', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 }).exec();
        res.json({ success: true, messages });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// Delete a message
router.delete('/contact/message/:id', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    await History.create({
        type: 'contact-message-deletion',
        performedBy: req.user._id,
        data: message,
        timestamp: new Date()
    });
    res.json({ message: 'Message deleted and logged in history' });
});

module.exports = router;