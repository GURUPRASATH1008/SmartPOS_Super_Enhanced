import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  sku: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  items: { type: [saleItemSchema], required: true },
  subtotal: Number,
  tax: Number,
  discount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  total: Number,
  paymentMethod: { type: String, enum: ["Cash", "Card", "UPI"], required: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Sale", saleSchema);
