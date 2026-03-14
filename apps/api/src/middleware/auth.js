import jwt from "jsonwebtoken";
import { query } from "../config/mysql.js";
import { normalizeRole, roleLabel } from "../utils/roles.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await query(
      "SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );
    const user = users[0];

    if (!user || Number(user.is_active) !== 1) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const normalizedRole = normalizeRole(user.role);

    req.user = {
      _id: String(user.id),
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      normalizedRole,
      roleLabel: roleLabel(normalizedRole),
      isActive: Boolean(user.is_active)
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};