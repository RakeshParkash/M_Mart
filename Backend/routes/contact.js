const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/message', async (req, res) => {
  const { name, phone, message } = req.body;

  try {
    const contact = new Contact({ name, phone, message });
    await contact.save();

    res.status(200).json({ success: true, message: 'Message received' });
  } catch (err) {
    console.error(" Error while saving contact message:", err);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
});


module.exports = router;
