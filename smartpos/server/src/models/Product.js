import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, trim: true },
  category: { type: String, default: "General" },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  lowStockLimit: { type: Number, default: 5 },
  barcode: { type: String, default: "" },
  expiryDate: { type: Date }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
