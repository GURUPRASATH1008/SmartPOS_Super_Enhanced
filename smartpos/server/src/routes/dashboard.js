import express from "express";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const expiryCutoff = new Date(); expiryCutoff.setDate(expiryCutoff.getDate() + 30);
    const now = new Date(); now.setHours(0,0,0,0);
    const [products, lowStock, expiringSoon, expired, todaySales, recentSales, todayAgg] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockLimit"] } }),
      Product.countDocuments({ expiryDate: { $gte: now, $lte: expiryCutoff }, stock: { $gt: 0 } }),
      Product.countDocuments({ expiryDate: { $lt: now }, stock: { $gt: 0 } }),
      Sale.countDocuments({ createdAt: { $gte: start } }),
      Sale.find().sort({ createdAt: -1 }).limit(5).populate("cashier", "name"),
      Sale.aggregate([{ $match: { createdAt: { $gte: start } } }, { $group: { _id: null, total: { $sum: "$total" } } }])
    ]);
    res.json({ products, lowStock, expiringSoon, expired, sales: todaySales, revenue: todayAgg[0]?.total || 0, recentSales });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
