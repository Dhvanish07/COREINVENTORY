import { Router } from "express";
import { seedData } from "../controllers/seedController.js";
import { protect } from "../middleware/auth.js";
import { requireSeedAccess } from "../middleware/rbac.js";

const router = Router();
router.use(protect);
router.post("/", requireSeedAccess, seedData);

export default router;