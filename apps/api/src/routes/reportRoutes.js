import { Router } from "express";
import { exportCsv, exportPdf } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";
import { requireReportAccess } from "../middleware/rbac.js";

const router = Router();
router.use(protect);

router.get("/csv", requireReportAccess, exportCsv);
router.get("/pdf", requireReportAccess, exportPdf);

export default router;