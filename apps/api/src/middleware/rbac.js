import {
  canExportReports,
  canManageMasters,
  canSeedData
} from "../utils/roles.js";

export const requireMasterAccess = (req, res, next) => {
  if (!canManageMasters(req.user?.normalizedRole)) {
    return res.status(403).json({ message: "Access denied for this role" });
  }
  next();
};

export const requireReportAccess = (req, res, next) => {
  if (!canExportReports(req.user?.normalizedRole)) {
    return res.status(403).json({ message: "Access denied for this role" });
  }
  next();
};

export const requireSeedAccess = (req, res, next) => {
  if (!canSeedData(req.user?.normalizedRole)) {
    return res.status(403).json({ message: "Access denied for this role" });
  }
  next();
};