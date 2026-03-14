import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";
import { requireMasterAccess } from "../middleware/rbac.js";

const router = Router();
router.use(protect);

router.get("/", getProducts);
router.post("/", requireMasterAccess, createProduct);
router.put("/:id", requireMasterAccess, updateProduct);
router.delete("/:id", requireMasterAccess, deleteProduct);

export default router;