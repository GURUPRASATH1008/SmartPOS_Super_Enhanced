import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Product from "./models/Product.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const password = await bcrypt.hash("admin123", 10);
await User.findOneAndUpdate(
  { email: "admin@smartpos.com" },
  { name: "Admin", email: "admin@smartpos.com", password, role: "admin" },
  { upsert: true, new: true }
);

const count = await Product.countDocuments();
if (!count) {
  await Product.insertMany([
    { name: "Milk 500ml", sku: "MILK001", category: "Dairy", price: 30, stock: 50, lowStockLimit: 10 },
    { name: "Bread", sku: "BREAD001", category: "Bakery", price: 45, stock: 30, lowStockLimit: 8 },
    { name: "Coffee 200g", sku: "COF001", category: "Beverages", price: 120, stock: 20, lowStockLimit: 5 }
  ]);
}

console.log("Seed completed. Login: admin@smartpos.com / admin123");
await mongoose.disconnect();
