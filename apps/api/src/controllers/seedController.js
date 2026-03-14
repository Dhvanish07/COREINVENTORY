import bcrypt from "bcryptjs";
import { query } from "../config/mysql.js";

export const seedData = async (_req, res) => {
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await query(
    `
    INSERT INTO users (name, email, password_hash, role, is_active)
    VALUES ('Core Admin', 'admin@coreinventory.app', ?, 'admin', 1)
    ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role), is_active = VALUES(is_active)
    `,
    [passwordHash]
  );

  await query(
    `
    INSERT INTO warehouses (name, code, location, capacity, is_active)
    VALUES
      ('Warehouse 1', 'WH1', 'Ahmedabad', 5000, 1),
      ('Warehouse 2', 'WH2', 'Mumbai', 8000, 1)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      location = VALUES(location),
      capacity = VALUES(capacity),
      is_active = VALUES(is_active)
    `
  );

  await query(
    `
    INSERT INTO products (name, sku, category, unit, low_stock_threshold, total_stock)
    VALUES
      ('Industrial Gloves', 'SKU-GLV-001', 'Safety', 'pairs', 30, 220),
      ('Packaging Boxes 44cm', 'SKU-BX-440', 'Packaging', 'pcs', 50, 420)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      category = VALUES(category),
      unit = VALUES(unit),
      low_stock_threshold = VALUES(low_stock_threshold),
      total_stock = VALUES(total_stock)
    `
  );

  await query(
    `
    INSERT INTO product_stock (product_id, warehouse_id, quantity, location_note)
    SELECT p.id, w.id,
      CASE
        WHEN p.sku = 'SKU-GLV-001' AND w.code = 'WH1' THEN 120
        WHEN p.sku = 'SKU-GLV-001' AND w.code = 'WH2' THEN 100
        WHEN p.sku = 'SKU-BX-440' AND w.code = 'WH1' THEN 200
        WHEN p.sku = 'SKU-BX-440' AND w.code = 'WH2' THEN 220
      END AS quantity,
      CASE
        WHEN w.code = 'WH1' THEN 'Rack A'
        ELSE 'Rack D'
      END AS location_note
    FROM products p
    JOIN warehouses w
    WHERE (p.sku, w.code) IN (('SKU-GLV-001','WH1'), ('SKU-GLV-001','WH2'), ('SKU-BX-440','WH1'), ('SKU-BX-440','WH2'))
    ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), location_note = VALUES(location_note)
    `
  );

  res.json({
    message: "Seed completed",
    credentials: {
      email: "admin@coreinventory.app",
      password: "Admin@123"
    }
  });
};