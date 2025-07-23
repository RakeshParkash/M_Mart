const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require("../models/User");
const Product = require("../models/Product");
const Contact = require('../models/Contact');
const { createAccessToken, createRefreshToken , verifyToken , isAdmin , validateBody } = require('../utils/helpers');
const passport = require('passport');



const router = express.Router();




/*

Auth of admin

*/






// Middleware: check masterKey OR logged-in admin
const adminOrMasterKey = async (req, res, next) => {
    const { masterKey } = req.body;
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
        // Bootstrapping first admin
        if (!masterKey || masterKey !== process.env.ADMIN_MASTER_KEY) {
            return res.status(403).json({ err: 'Invalid master key' });
        }
        return next();
    } else {
        // For subsequent admins, require authentication
        passport.authenticate('admin-jwt', { session: false } , (err, user) => {
            if (err || !user || user.role !== 'admin') {
                return res.status(403).json({ err: 'Admin privileges required' });
            }
            req.user = user;
            return next();
        })(req, res, next);
    }
};

/* ---------- REGISTER ---------- */
router.post(
    '/register',
    body('phone').isMobilePhone('any').withMessage('Invalid phone number'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage('Weak password'),
    adminOrMasterKey,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phone, password , email, firstName, lastName} = req.body;

          if (!phone || !password || !email || !firstName || !lastName)
                return res.status(400).json({ error: "Phone, email,  password, firstName and lastName are required" });

        try {
            // Check if phone already exists
            const exists = await Admin.findOne({ phone });
            if (exists) {
                return res.status(409).json({ err: 'Phone already exists' });
            }

                    const admin = await Admin.create({
                        firstName,
                        lastName,
                        ...(email && { email }),
                        phone,
                        password
                    });
            return res.status(201).json({ msg: 'Admin created successfully' });
        } catch (err) {
            console.error('Admin registration error:', err);
            return res.status(500).json({ err: 'Server error' });
        }
    }
);

/* ---------- LOGIN ---------- */
router.post(
    '/login',
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

        const accessToken  = createAccessToken({ id: admin._id, role: admin.role });
        const refreshToken = createRefreshToken({ id: admin._id });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const safeAdmin = admin.toObject();
        delete safeAdmin.password;
        return res.status(200).json({
            admin: safeAdmin,
            accessToken
        });
    }
);

/* ---------- LOGOUT ---------- */
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logged out' });
});

/* ---------- ACCESS TOKEN REFRESH ---------- */
router.post('/token', (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ err: 'No refresh token' });

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err)
            return res.status(403).json({ err: 'Invalid refresh token' });

        // Provide role info if needed
        const newAccess = createAccessToken({ id: payload.id, role: payload.role });
        res.json({ accessToken: newAccess });
    });
});




/*

  get admin

*/  


  router.get('/me', passport.authenticate('admin-jwt', { session: false }),

  async (req, res) => {
    try {
      const admin = await Admin.findById(req.user._id).select('-password');
      if (!admin) return res.status(404).json({ err: 'Admin not found' });
      res.json({ admin });
    } catch (err) {
      res.status(500).json({ err: 'Server error' });
    }
  }
);





/*    The complete user model         */




//Add

router.post(
  '/add-user',
  passport.authenticate('admin-jwt', { session: false }),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phone } = req.body;

    try {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ error: 'Phone number already exists' });
      }

      const user = await User.create(req.body);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);


// Delete user


router.delete('/delete-user/:id', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Save deletion in history
    await History.create({
      type: 'user-deletion',
      performedBy: req.user._id,
      data: user,
      timestamp: new Date()
    });

    res.json({ message: 'User deleted and logged in history' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});



// Get recent users
router.get('/users', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 100);
  const total = await User.countDocuments({});
  const users = await User.find({}).select('name email phone').sort('-createdAt').limit(limit);
  res.json({ total, users });
});

router.post('/user/:userId/purchase', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
  try {
    const { date, items } = req.body;

    if (!date || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Date and items are required" });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingEntry = user.purchased_history.find(ph => ph.date === date);

    if (existingEntry) {
      items.forEach(newItem => {
        const existingItem = existingEntry.items.find(i => i.name === newItem.name);
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
          existingItem.advancePaid += newItem.advancePaid;
          existingItem.totalPrice += newItem.totalPrice;
        } else {
          existingEntry.items.push(newItem);
        }
      });
    } else {
      user.purchased_history.push({ date, items });
    }

    await user.save();
    res.json({ message: "Purchase history updated", user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/user/:userId/due', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
  try {
    const { date, items } = req.body;

    if (!date || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Date and items are required" });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingEntry = user.dues.find(d => d.date === date);

    if (existingEntry) {
      items.forEach(newItem => {
        const existingItem = existingEntry.items.find(i => i.name === newItem.name);
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
          existingItem.dueAmount += newItem.dueAmount;
          existingItem.fullyPaid = existingItem.fullyPaid && newItem.fullyPaid; // keep false if any is false
        } else {
          existingEntry.items.push(newItem);
        }
      });
    } else {
      user.dues.push({ date, items });
    }

    await user.save();
    res.json({ message: "Due history updated", user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete('/user/:userId/history/:type/:date', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
  const { type, date } = req.params;
  if (!["purchased_history", "dues"].includes(type)) {
    return res.status(400).json({ message: "Invalid history type" });
  }

  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user[type] = user[type].filter(entry => entry.date !== date);
  await user.save();

  res.json({ message: `${type} entry removed`, user });
});







////** product crud operations */






router.post("/product", verifyToken, isAdmin, validateBody,  async (req, res) => {
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
router.get("/products", verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});
// Get all products (with count support)
router.get("/products/count", verifyToken, isAdmin, async (req, res) => {
  try {
    const countOnly = req.query.count === 'true';

    if (countOnly) {
      const totalCount = await Product.countDocuments();
      return res.json({ totalCount });
    }

    res.json({ 
      totalCount: countOnly ? await Product.countDocuments() : undefined 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
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
router.put("/product/:id", verifyToken, isAdmin, validateBody , async (req, res) => {
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







/**
 * message
 */




// Get contact messages
router.get('/contact/messages', 
  passport.authenticate('admin-jwt', { session: false }),
  async (req, res) => {
    try {
      const messages = await Contact.find()
        .sort({ createdAt: -1 }) // -1 for descending (newest first)
        .exec();
      
      res.json({ 
        success: true,
        messages 
      });
    } catch (err) {
      console.error('Error fetching messages:', err);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch messages' 
      });
    }
  }
);

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
