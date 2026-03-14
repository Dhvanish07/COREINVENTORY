import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { testMySQLConnection } from "./config/mysql.js";
import { ensureDefaultAdmin } from "./utils/bootstrap.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import movementRoutes from "./routes/movementRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ name: "CoreInventory API", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/seed", seedRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;

testMySQLConnection()
  .then(() => ensureDefaultAdmin())
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("DB connection failed", error);
    process.exit(1);
  });