const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products - Public grouped products
router.get("/get", async (req, res) => {
  try {
    const products = await Product.find();

    const grouped = {};

    products.forEach((p) => {
      const cat = p.category || "Misc";

      if (!grouped[cat]) grouped[cat] = [];

      grouped[cat].push({
        name: p.name,
        desc: p.description,
        img: p.image,
        price: `₹${p.selling_Price?.price || 0}/${p.quantity_Unit}`,
        cta: "Add to Cart"
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
