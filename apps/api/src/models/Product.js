import mongoose from "mongoose";

const stockByWarehouseSchema = new mongoose.Schema(
  {
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true
    },
    quantity: { type: Number, default: 0 },
    locationNote: { type: String, default: "" }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    category: { type: String, required: true },
    unit: { type: String, required: true, default: "pcs" },
    lowStockThreshold: { type: Number, default: 10 },
    totalStock: { type: Number, default: 0 },
    stockByWarehouse: [stockByWarehouseSchema]
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;