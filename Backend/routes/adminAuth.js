const express = require('express');
const mongoose = require('mongoose')
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require("../models/User");
const Product = require("../models/Product");
const Contact = require('../models/Contact');
const History = require('../models/History');
const { createAccessToken, createRefreshToken , verifyToken , isAdmin , validateBody } = require('../utils/helpers');
const passport = require('passport');
const bcrypt = require('bcrypt');
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
    body('firstName').notEmpty().withMessage('First name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Email must be valid'),
    body('lastName')
      .optional({ checkFalsy: true })
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    try {
      // Check if phone number already exists
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({ error: 'Phone number already exists' });
      }

      // Check if email exists only if provided
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }

      // Build user object dynamically
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        firstName,
        lastName,
        phone,
        password: hashedPassword
      };

      if (email) {
        newUser.email = email;
      }

      const user = await User.create(newUser);

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email || null
        }
      });
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

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await History.create({
        type: 'user-deletion',
        performedBy: req.user?._id || null,
        data: user,
        timestamp: new Date(),
      });

      res.json({ message: 'User deleted and logged in history' });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

// history

// Fetch all user deletion history (latest first)
router.get('/deleted-history',
  passport.authenticate('admin-jwt', { session: false }),
  async (req, res) => {
    try {
      const logs = await History.find({ type: 'user-deletion' })
        .populate('performedBy', 'firstName lastName email') // optional
        .sort({ timestamp: -1 });

      res.json({ history: logs });
    } catch (err) {
      console.error('Error fetching history:', err);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  }
);



// Get recent users
router.get('/users', passport.authenticate('admin-jwt', { session: false }), async (req, res) => {
  try {
    const countOnly = req.query.count === 'true';
    let totalUsers = 0;
    if (countOnly) {
      totalUsers = await User.countDocuments() ;
    }
    const limit = Math.min(parseInt(req.query.limit) || 5, 100);
    const skip = parseInt(req.query.skip) || 0;

    const users = await User.find({})
      .select('firstName lastName email phone purchased_history dues ')
      .limit(limit)
      .skip(skip);

    res.json({ totalUsers, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post(
  '/user/:userId/purchase',
  passport.authenticate('admin-jwt', { session: false }),
  async (req, res) => {
    try {
      const { date, items } = req.body;

      if (!date || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Date and items are required' });
      }

      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Handle Purchase History
      let existingPurchase = user.purchased_history.find(ph => ph.date === date);
      if (!existingPurchase) {
        existingPurchase = { date, items: [] };
        user.purchased_history.push(existingPurchase);
      }

      items.forEach(newItem => {
  const { name, quantity, advancePaid, totalPrice } = newItem;

  // ---- PURCHASED HISTORY FIX ----
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

  // ---- DUES FIX ----
  if (advancePaid < totalPrice) {
    const dueAmount = totalPrice - advancePaid;
    let dueIndex = user.dues.findIndex(d => d.date === date);
    if (dueIndex === -1) {
      user.dues.push({
        date,
        items: [{ name, quantity, dueAmount, fullyPaid: false }]
      });
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
});



      await user.save();
      res.json({ message: 'Purchase and dues updated', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);


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

router.put(
  '/user/:id',
  passport.authenticate('admin-jwt', { session: false }),
  async (req, res) => {
    try {
      const updateFields = { ...req.body };
      // Optionally: never update password here directly unless you hash it (depends on your auth logic)
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
    let totalCount = 0;
    if (countOnly) {
      totalCount = await Product.countDocuments() ;
    }
    const limit = Math.min(parseInt(req.query.limit) || 5, 100);
    const skip = parseInt(req.query.skip) || 0;

    const products = await Product.find({})
      .select(' name selling_Price')
      .limit(limit)
      .skip(skip);

    res.json({ totalCount, products });
  } catch (error) {
    console.error('Error fetching users:', error);
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
