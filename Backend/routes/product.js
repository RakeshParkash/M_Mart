const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products/get - Public grouped products
router.get("/get", async (req, res) => {
  try {
    const products = await Product.find();
    const knownCategories = ["Perishables", "Snacks", "Beverages", "Grains", "Bakery", "Dairy", "Offers"];
    const grouped = {
      Perishables: [],
      Snacks: [],
      Beverages: [],
      Grains: [],
      Bakery: [],
      Dairy: [],
      Offers: [],
      Others: []
    };
    products.forEach((p) => {
      const cat = p.category || "Others";
      const formattedProduct = {
        _id: p._id,
        name: p.name,
        desc: p.description,
        description: p.description,
        img: p.image,
        image: p.image,
        price: p.selling_Price?.price || 0,
        selling_Price: {
          price: p.selling_Price?.price || 0,
          unit: p.selling_Price?.unit || "pcs"
        },
        quantity_Unit: p.quantity_Unit,
        stock: p.stock.value,
        totalSold: p.totalSold || 0
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

// GET /api/products/categories - Public: products grouped by category
router.get("/categories", async (req, res) => {
  try {
    const products = await Product.find();
    const grouped = {};
    products.forEach((p) => {
      const cat = p.category || "Others";
      const formattedProduct = {
        _id: p._id,
        name: p.name,
        desc: p.description || p.desc,
        description: p.description,
        img: p.image,
        image: p.image,
        price: p.selling_Price?.price || 0,
        selling_Price: {
          price: p.selling_Price?.price || 0,
          unit: p.selling_Price?.unit || "pcs"
        },
        quantity_Unit: p.quantity_Unit,
        stock: p.stock?.value || 0,
        totalSold: p.totalSold || 0
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

// GET /api/products/:id - Get single product (with stock info)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;