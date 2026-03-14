import bcrypt from "bcryptjs";
import { query } from "../config/mysql.js";

export const ensureDefaultAdmin = async () => {
  const email = "admin@coreinventory.app";
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await query(
    `
    INSERT INTO users (name, email, password_hash, role, is_active)
    VALUES (?, ?, ?, 'admin', 1)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      password_hash = VALUES(password_hash),
      role = VALUES(role),
      is_active = VALUES(is_active)
    `,
    ["Core Admin", email, passwordHash]
  );
};