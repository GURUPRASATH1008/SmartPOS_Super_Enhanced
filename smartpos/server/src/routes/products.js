import express from "express";
import Product from "../models/Product.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    const filter = q ? { $or: [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { barcode: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ] } : {};
    res.json(await Product.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const payload = { ...req.body, price: Number(req.body.price), stock: Number(req.body.stock), lowStockLimit: Number(req.body.lowStockLimit ?? 5) };
    if (!payload.name || !payload.sku || !Number.isFinite(payload.price) || payload.price < 0 || !Number.isInteger(payload.stock) || payload.stock < 0) {
      return res.status(400).json({ message: "Name, unique SKU, valid price and stock are required" });
    }
    res.status(201).json(await Product.create(payload));
  } catch (err) { res.status(400).json({ message: err.code === 11000 ? "SKU already exists" : err.message }); }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);
    if (payload.lowStockLimit !== undefined) payload.lowStockLimit = Number(payload.lowStockLimit);
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.code === 11000 ? "SKU already exists" : err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

export default router;
