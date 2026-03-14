import mongoose from "mongoose";

const stockItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true }
  },
  { _id: false }
);

const stockMovementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["receipt", "delivery", "transfer", "adjustment"],
      required: true
    },
    status: {
      type: String,
      enum: ["draft", "waiting", "ready", "done", "cancelled"],
      default: "draft"
    },
    referenceNo: { type: String, required: true, unique: true },
    supplier: { type: String, default: "" },
    notes: { type: String, default: "" },
    sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
    items: [stockItemSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
export default StockMovement;