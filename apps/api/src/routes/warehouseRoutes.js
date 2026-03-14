import { Router } from "express";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse
} from "../controllers/warehouseController.js";
import { protect } from "../middleware/auth.js";
import { requireMasterAccess } from "../middleware/rbac.js";

const router = Router();
router.use(protect);

router.get("/", getWarehouses);
router.post("/", requireMasterAccess, createWarehouse);
router.put("/:id", requireMasterAccess, updateWarehouse);
router.delete("/:id", requireMasterAccess, deleteWarehouse);

export default router;