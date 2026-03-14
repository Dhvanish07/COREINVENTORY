import { query } from "../config/mysql.js";
import { logActivity } from "../utils/logActivity.js";

export const getWarehouses = async (_req, res) => {
  const rows = await query(
    "SELECT id, name, code, location, capacity, is_active, created_at, updated_at FROM warehouses ORDER BY created_at DESC"
  );
  const warehouses = rows.map((w) => ({
    _id: String(w.id),
    id: String(w.id),
    name: w.name,
    code: w.code,
    location: w.location,
    capacity: Number(w.capacity),
    isActive: Boolean(w.is_active),
    createdAt: w.created_at,
    updatedAt: w.updated_at
  }));
  res.json(warehouses);
};

export const createWarehouse = async (req, res) => {
  try {
    const { name, code, location, capacity = 0, isActive = true } = req.body;
    const result = await query(
      "INSERT INTO warehouses (name, code, location, capacity, is_active) VALUES (?, ?, ?, ?, ?)",
      [name, code, location, Number(capacity), isActive ? 1 : 0]
    );
    const rows = await query("SELECT * FROM warehouses WHERE id = ? LIMIT 1", [result.insertId]);
    const warehouse = rows[0];

    await logActivity({
      action: "Warehouse created",
      entityType: "warehouse",
      entityId: String(warehouse.id),
      meta: { name: warehouse.name },
      user: req.user.id
    });

    res.status(201).json({
      _id: String(warehouse.id),
      id: String(warehouse.id),
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      capacity: Number(warehouse.capacity),
      isActive: Boolean(warehouse.is_active),
      createdAt: warehouse.created_at,
      updatedAt: warehouse.updated_at
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create warehouse", error: error.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { name, code, location, capacity, isActive } = req.body;
    await query(
      `
      UPDATE warehouses
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          location = COALESCE(?, location),
          capacity = COALESCE(?, capacity),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
      `,
      [
        name ?? null,
        code ?? null,
        location ?? null,
        capacity !== undefined ? Number(capacity) : null,
        isActive !== undefined ? (isActive ? 1 : 0) : null,
        req.params.id
      ]
    );

    const rows = await query("SELECT * FROM warehouses WHERE id = ? LIMIT 1", [req.params.id]);
    const warehouse = rows[0];
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    res.json({
      _id: String(warehouse.id),
      id: String(warehouse.id),
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      capacity: Number(warehouse.capacity),
      isActive: Boolean(warehouse.is_active),
      createdAt: warehouse.created_at,
      updatedAt: warehouse.updated_at
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to update warehouse", error: error.message });
  }
};

export const deleteWarehouse = async (req, res) => {
  const result = await query("DELETE FROM warehouses WHERE id = ?", [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: "Warehouse not found" });
  res.json({ message: "Warehouse removed" });
};