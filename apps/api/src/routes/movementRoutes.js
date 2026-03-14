import { Router } from "express";
import {
  createMovement,
  getLedger,
  getMovements,
  updateMovementStatus
} from "../controllers/movementController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", getMovements);
router.get("/ledger", getLedger);
router.post("/", createMovement);
router.patch("/:id/status", updateMovementStatus);

export default router;