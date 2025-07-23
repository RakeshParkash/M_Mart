const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products/get - Public grouped products
router.get("/get", async (req, res) => {
  try {
    const products = await Product.find();

    const knownCategories = ["Perishables", "Snacks", "Beverages", "Grains", "Bakery", "Dairy", "Offers"];

    // Initialize all groups
    const grouped = {
      Perishables: [],
      Snacks: [],
      Beverages: [],
      Grains: [],
      Bakery: [],
      Dairy: [],
      Offers: [],
      Others: [] // For uncategorized or unknown categories
    };

    // Group products
    products.forEach((p) => {
      const cat = p.category || "Others";
      const formattedProduct = {
        name: p.name,
        desc: p.description,
        img: p.image,
        price: `₹${p.selling_Price?.price || 0}/${p.quantity_Unit}`,
        cta: "Add to Cart"
      };

      if (knownCategories.includes(cat)) {
        grouped[cat].push(formattedProduct);
      } else {
        grouped.Others.push(formattedProduct);
      }
    });

    res.json(grouped);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const products = await Product.find();

    // Group by category
    const grouped = {};

    products.forEach((p) => {
      const cat = p.category || "Others";
      const formattedProduct = {
        name: p.name,
        desc: p.description,
        img: p.image,
        price: `₹${p.selling_Price?.price || 0}/${p.quantity_Unit}`,
        cta: "Add to Cart"
      };
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(formattedProduct);
    });

    res.json(grouped);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
