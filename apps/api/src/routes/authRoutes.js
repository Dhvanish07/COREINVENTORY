import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  resetPasswordWithOtp,
  signup,
  updateMe
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithOtp);
router.get("/me", protect, me);
router.put("/me", protect, updateMe);

export default router;