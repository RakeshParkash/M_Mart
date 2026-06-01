const express = require('express');
const passport = require('passport');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const Receipt = require('../models/Receipt');
const CustomList = require('../models/CustomList');
const History = require('../models/History');

const router = express.Router();

// Multer config (memory storage for cloudinary direct upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to ensure admin
const requireAdmin = passport.authenticate('admin-jwt', { session: false });

/**
 * RECEIPTS
 */

// Get all receipts (optionally filtered by user)
router.get('/receipts', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { user: userId } : {};
        const receipts = await Receipt.find(filter).populate('user', 'firstName lastName phone email').sort({ date: -1 });
        res.json({ receipts });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch receipts' });
    }
});

// Create a receipt
router.post('/receipts', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { userId, manualText, amount, date } = req.body;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        let imageUrl = '';
        if (req.file) {
            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'receipts' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }

        const receipt = await Receipt.create({
            user: userId,
            image: imageUrl,
            manualText: manualText || '',
            amount: Number(amount) || 0,
            date: date || new Date()
        });

        // Log history
        await History.create({
            type: 'receipt-creation',
            entityType: 'Receipt',
            action: 'Create',
            performedBy: req.user._id,
            targetUser: userId,
            data: receipt
        });

        res.status(201).json({ message: 'Receipt created', receipt });
    } catch (err) {
        console.error('Receipt create error:', err);
        res.status(500).json({ error: 'Failed to create receipt' });
    }
});

// Delete a receipt
router.delete('/receipts/:id', requireAdmin, async (req, res) => {
    try {
        const receipt = await Receipt.findByIdAndDelete(req.params.id);
        if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

        await History.create({
            type: 'receipt-deletion',
            entityType: 'Receipt',
            action: 'Delete',
            performedBy: req.user._id,
            targetUser: receipt.user,
            data: receipt
        });

        res.json({ message: 'Receipt deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete receipt' });
    }
});

// Edit a receipt
router.put('/receipts/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { manualText, amount, date } = req.body;
        const receipt = await Receipt.findById(req.params.id);
        if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

        if (manualText !== undefined) receipt.manualText = manualText;
        if (amount !== undefined) receipt.amount = Number(amount);
        if (date !== undefined) receipt.date = date;

        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'receipts' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            receipt.image = result.secure_url;
        }

        await receipt.save();

        await History.create({
            type: 'receipt-update',
            entityType: 'Receipt',
            action: 'Update',
            performedBy: req.user._id,
            targetUser: receipt.user,
            data: receipt
        });

        res.json({ message: 'Receipt updated', receipt });
    } catch (err) {
        console.error('Receipt update error:', err);
        res.status(500).json({ error: 'Failed to update receipt' });
    }
});

/**
 * CUSTOM LISTS
 */

router.get('/lists', requireAdmin, async (req, res) => {
    try {
        const lists = await CustomList.find().sort({ createdAt: -1 });
        res.json({ lists });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch lists' });
    }
});

router.post('/lists', requireAdmin, async (req, res) => {
    try {
        const { title, items } = req.body;
        const list = await CustomList.create({
            title,
            items: items || [],
            createdBy: req.user._id
        });

        await History.create({
            type: 'list-creation',
            entityType: 'CustomList',
            action: 'Create',
            performedBy: req.user._id,
            data: list
        });

        res.status(201).json({ message: 'List created', list });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create list' });
    }
});

router.put('/lists/:id', requireAdmin, async (req, res) => {
    try {
        const list = await CustomList.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!list) return res.status(404).json({ error: 'List not found' });

        await History.create({
            type: 'list-update',
            entityType: 'CustomList',
            action: 'Update',
            performedBy: req.user._id,
            data: list
        });

        res.json({ message: 'List updated', list });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update list' });
    }
});

router.delete('/lists/:id', requireAdmin, async (req, res) => {
    try {
        const list = await CustomList.findByIdAndDelete(req.params.id);
        if (!list) return res.status(404).json({ error: 'List not found' });

        await History.create({
            type: 'list-deletion',
            entityType: 'CustomList',
            action: 'Delete',
            performedBy: req.user._id,
            data: list
        });

        res.json({ message: 'List deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete list' });
    }
});

/**
 * ENHANCED HISTORY / LOGS
 */
router.get('/history', requireAdmin, async (req, res) => {
    try {
        const { entityType, targetUser, action } = req.query;
        let filter = {};
        if (entityType) filter.entityType = entityType;
        if (targetUser) filter.targetUser = targetUser;
        if (action) filter.action = action;

        const logs = await History.find(filter)
            .populate('performedBy', 'firstName lastName')
            .populate('targetUser', 'firstName lastName phone')
            .sort({ timestamp: -1 })
            .limit(200); // Prevent massive payloads initially
            
        res.json({ logs });
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch history logs' });
    }
});

// Secretly delete a history log
router.delete('/history/:id', requireAdmin, async (req, res) => {
    try {
        const log = await History.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ error: 'Log not found' });
        res.json({ message: 'Log permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

module.exports = router;
