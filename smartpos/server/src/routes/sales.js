import express from "express";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const sales = await Sale.find().populate("cashier", "name").sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post("/", auth, async (req, res) => {
  try {
    const { items, paymentMethod, taxRate = 0, discountPercent = 0 } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Cart is empty" });
    if (!["Cash", "Card", "UPI"].includes(paymentMethod)) return res.status(400).json({ message: "Invalid payment method" });

    const cleanDiscountPercent = Number(discountPercent);
    const cleanTaxRate = Number(taxRate);
    if (!Number.isFinite(cleanDiscountPercent) || cleanDiscountPercent < 0 || cleanDiscountPercent > 100) return res.status(400).json({ message: "Discount must be between 0 and 100%" });
    if (!Number.isFinite(cleanTaxRate) || cleanTaxRate < 0 || cleanTaxRate > 100) return res.status(400).json({ message: "Tax rate must be between 0 and 100%" });
    const saleItems = [];
    let subtotal = 0;
    const validated = [];

    // Validate the full basket before mutating any inventory. For production-grade
    // multi-register concurrency, move checkout to a MongoDB transaction or atomic
    // conditional stock updates.
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.name || item.product}` });
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: "Invalid quantity" });
      if (product.stock < quantity) return res.status(400).json({ message: `Only ${product.stock} ${product.name} available` });
      validated.push({ product, quantity });
    }
    for (const { product, quantity } of validated) {
      const lineTotal = Number((product.price * quantity).toFixed(2));
      subtotal += lineTotal;
      product.stock -= quantity;
      await product.save();
      saleItems.push({ product: product._id, name: product.name, sku: product.sku, quantity, price: product.price, total: lineTotal });
    }

    subtotal = Number(subtotal.toFixed(2));
    const discount = Number((subtotal * cleanDiscountPercent / 100).toFixed(2));
    const cleanTax = Number(((subtotal - discount) * cleanTaxRate / 100).toFixed(2));
    const total = Number(Math.max(0, subtotal - discount + cleanTax).toFixed(2));
    const sale = await Sale.create({ items: saleItems, subtotal, discount, discountPercent: cleanDiscountPercent, tax: cleanTax, total, paymentMethod, cashier: req.user.id });
    res.status(201).json(await Sale.findById(sale._id).populate("cashier", "name"));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("cashier", "name");
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) { res.status(400).json({ message: "Invalid sale ID" }); }
});

export default router;
