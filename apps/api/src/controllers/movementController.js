import { getConnection, query } from "../config/mysql.js";
import { makeReference } from "../utils/reference.js";
import { logActivity } from "../utils/logActivity.js";
import { canUseMovementType } from "../utils/roles.js";

const normalizeItems = (items = []) =>
  items.map((item) => ({ product: item.product, quantity: Number(item.quantity || 0) }));

const mapMovementRow = (row, items = []) => ({
  _id: String(row.id),
  id: String(row.id),
  referenceNo: row.reference_no,
  type: row.movement_type,
  status: row.status,
  supplier: row.supplier || "",
  notes: row.notes || "",
  sourceWarehouse: row.source_warehouse_id
    ? {
        _id: String(row.source_warehouse_id),
        id: String(row.source_warehouse_id),
        name: row.source_warehouse_name,
        code: row.source_warehouse_code,
        location: row.source_warehouse_location,
        capacity: Number(row.source_warehouse_capacity || 0)
      }
    : undefined,
  destinationWarehouse: row.destination_warehouse_id
    ? {
        _id: String(row.destination_warehouse_id),
        id: String(row.destination_warehouse_id),
        name: row.destination_warehouse_name,
        code: row.destination_warehouse_code,
        location: row.destination_warehouse_location,
        capacity: Number(row.destination_warehouse_capacity || 0)
      }
    : undefined,
  items,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const loadMovementById = async (movementId) => {
  const rows = await query(
    `
    SELECT
      m.*,
      sw.name AS source_warehouse_name,
      sw.code AS source_warehouse_code,
      sw.location AS source_warehouse_location,
      sw.capacity AS source_warehouse_capacity,
      dw.name AS destination_warehouse_name,
      dw.code AS destination_warehouse_code,
      dw.location AS destination_warehouse_location,
      dw.capacity AS destination_warehouse_capacity
    FROM stock_movements m
    LEFT JOIN warehouses sw ON sw.id = m.source_warehouse_id
    LEFT JOIN warehouses dw ON dw.id = m.destination_warehouse_id
    WHERE m.id = ?
    LIMIT 1
    `,
    [movementId]
  );
  if (!rows.length) return null;

  const itemRows = await query(
    `
    SELECT
      i.product_id,
      i.quantity,
      p.name,
      p.sku,
      p.category,
      p.unit,
      p.total_stock,
      p.low_stock_threshold
    FROM stock_movement_items i
    JOIN products p ON p.id = i.product_id
    WHERE i.movement_id = ?
    ORDER BY i.id ASC
    `,
    [movementId]
  );

  const items = itemRows.map((i) => ({
    product: {
      _id: String(i.product_id),
      id: String(i.product_id),
      name: i.name,
      sku: i.sku,
      category: i.category,
      unit: i.unit,
      totalStock: Number(i.total_stock),
      lowStockThreshold: Number(i.low_stock_threshold)
    },
    quantity: Number(i.quantity)
  }));

  return mapMovementRow(rows[0], items);
};

const ensureStockRow = async (conn, productId, warehouseId) => {
  await conn.execute(
    "INSERT IGNORE INTO product_stock (product_id, warehouse_id, quantity, location_note) VALUES (?, ?, 0, '')",
    [productId, warehouseId]
  );
};

const getWarehouseSpace = async (conn, warehouseId) => {
  const [rows] = await conn.execute(
    `
    SELECT
      w.capacity,
      COALESCE(SUM(ps.quantity), 0) AS used_capacity
    FROM warehouses w
    LEFT JOIN product_stock ps ON ps.warehouse_id = w.id
    WHERE w.id = ?
    GROUP BY w.id, w.capacity
    LIMIT 1
    `,
    [warehouseId]
  );

  const capacity = Number(rows[0]?.capacity || 0);
  const used = Number(rows[0]?.used_capacity || 0);
  const left = Math.max(capacity - used, 0);

  return { capacity, used, left };
};

const applyStockTransaction = async (conn, movement, items) => {
  if (!items.length) return;

  for (const item of items) {
    const qty = Number(item.quantity || 0);
    const productId = Number(item.product);

    if (!productId || qty < 0) {
      throw new Error("Invalid movement items");
    }

    if (movement.type === "receipt") {
      const wh = Number(movement.destinationWarehouse);
      if (!wh) throw new Error("Destination warehouse required");

      const space = await getWarehouseSpace(conn, wh);
      if (qty > space.left) {
        throw new Error(`Not enough destination warehouse space. Space left: ${space.left}`);
      }

      await ensureStockRow(conn, productId, wh);
      await conn.execute(
        "UPDATE product_stock SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?",
        [qty, productId, wh]
      );
      await conn.execute("UPDATE products SET total_stock = total_stock + ? WHERE id = ?", [qty, productId]);
    }

    if (movement.type === "delivery") {
      const wh = Number(movement.sourceWarehouse);
      if (!wh) throw new Error("Source warehouse required");

      await ensureStockRow(conn, productId, wh);
      const [stockRows] = await conn.execute(
        "SELECT quantity FROM product_stock WHERE product_id = ? AND warehouse_id = ? LIMIT 1",
        [productId, wh]
      );
      const currentQty = Number(stockRows[0]?.quantity || 0);
      if (currentQty < qty) throw new Error("Insufficient stock for delivery");

      await conn.execute(
        "UPDATE product_stock SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?",
        [qty, productId, wh]
      );
      await conn.execute("UPDATE products SET total_stock = total_stock - ? WHERE id = ?", [qty, productId]);
    }

    if (movement.type === "transfer") {
      const sourceWh = Number(movement.sourceWarehouse);
      const destinationWh = Number(movement.destinationWarehouse);
      if (!sourceWh || !destinationWh) throw new Error("Source and destination warehouse required");

      const destinationSpace = await getWarehouseSpace(conn, destinationWh);
      if (qty > destinationSpace.left) {
        throw new Error(
          `Not enough destination warehouse space for transfer. Space left: ${destinationSpace.left}`
        );
      }

      await ensureStockRow(conn, productId, sourceWh);
      await ensureStockRow(conn, productId, destinationWh);

      const [stockRows] = await conn.execute(
        "SELECT quantity FROM product_stock WHERE product_id = ? AND warehouse_id = ? LIMIT 1",
        [productId, sourceWh]
      );
      const currentQty = Number(stockRows[0]?.quantity || 0);
      if (currentQty < qty) throw new Error("Insufficient stock for transfer");

      await conn.execute(
        "UPDATE product_stock SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?",
        [qty, productId, sourceWh]
      );
      await conn.execute(
        "UPDATE product_stock SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?",
        [qty, productId, destinationWh]
      );
    }

    if (movement.type === "adjustment") {
      const wh = Number(movement.destinationWarehouse);
      if (!wh) throw new Error("Destination warehouse required for adjustment");

      await ensureStockRow(conn, productId, wh);
      const [stockRows] = await conn.execute(
        "SELECT quantity FROM product_stock WHERE product_id = ? AND warehouse_id = ? LIMIT 1",
        [productId, wh]
      );
      const currentQty = Number(stockRows[0]?.quantity || 0);
      const diff = qty - currentQty;

      await conn.execute(
        "UPDATE product_stock SET quantity = ? WHERE product_id = ? AND warehouse_id = ?",
        [qty, productId, wh]
      );
      await conn.execute("UPDATE products SET total_stock = total_stock + ? WHERE id = ?", [diff, productId]);
    }
  }
};

export const getMovements = async (req, res) => {
  const {
    type = "",
    status = "",
    warehouse = "",
    category = "",
    q = ""
  } = req.query;

  const where = ["1=1"];
  const params = [];

  if (type) {
    where.push("m.movement_type = ?");
    params.push(type);
  }

  if (status) {
    where.push("m.status = ?");
    params.push(status);
  }

  if (warehouse) {
    where.push("(m.source_warehouse_id = ? OR m.destination_warehouse_id = ?)");
    params.push(Number(warehouse), Number(warehouse));
  }

  if (q) {
    where.push(
      "(m.reference_no LIKE ? OR EXISTS (SELECT 1 FROM stock_movement_items i JOIN products p ON p.id = i.product_id WHERE i.movement_id = m.id AND (p.name LIKE ? OR p.sku LIKE ?)))"
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  if (category) {
    where.push(
      "EXISTS (SELECT 1 FROM stock_movement_items i JOIN products p ON p.id = i.product_id WHERE i.movement_id = m.id AND LOWER(p.category) = LOWER(?))"
    );
    params.push(category);
  }

  const movementRows = await query(
    `
    SELECT
      m.*,
      sw.name AS source_warehouse_name,
      sw.code AS source_warehouse_code,
      sw.location AS source_warehouse_location,
      sw.capacity AS source_warehouse_capacity,
      dw.name AS destination_warehouse_name,
      dw.code AS destination_warehouse_code,
      dw.location AS destination_warehouse_location,
      dw.capacity AS destination_warehouse_capacity
    FROM stock_movements m
    LEFT JOIN warehouses sw ON sw.id = m.source_warehouse_id
    LEFT JOIN warehouses dw ON dw.id = m.destination_warehouse_id
    WHERE ${where.join(" AND ")}
    ORDER BY m.created_at DESC
    `,
    params
  );

  if (!movementRows.length) return res.json([]);

  const ids = movementRows.map((m) => m.id);
  const placeholders = ids.map(() => "?").join(",");
  const itemRows = await query(
    `
    SELECT
      i.movement_id,
      i.product_id,
      i.quantity,
      p.name,
      p.sku,
      p.category,
      p.unit,
      p.total_stock,
      p.low_stock_threshold
    FROM stock_movement_items i
    JOIN products p ON p.id = i.product_id
    WHERE i.movement_id IN (${placeholders})
    ORDER BY i.id ASC
    `,
    ids
  );

  const itemMap = itemRows.reduce((acc, r) => {
    const key = String(r.movement_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      product: {
        _id: String(r.product_id),
        id: String(r.product_id),
        name: r.name,
        sku: r.sku,
        category: r.category,
        unit: r.unit,
        totalStock: Number(r.total_stock),
        lowStockThreshold: Number(r.low_stock_threshold)
      },
      quantity: Number(r.quantity)
    });
    return acc;
  }, {});

  res.json(movementRows.map((row) => mapMovementRow(row, itemMap[String(row.id)] || [])));
};

export const createMovement = async (req, res) => {
  try {
    if (!canUseMovementType(req.user?.normalizedRole, req.body?.type)) {
      return res.status(403).json({
        message: "This role is not allowed to create this movement type"
      });
    }

    const payload = {
      type: req.body.type,
      status: req.body.status || "draft",
      supplier: req.body.supplier || "",
      notes: req.body.notes || "",
      sourceWarehouse: req.body.sourceWarehouse || null,
      destinationWarehouse: req.body.destinationWarehouse || null,
      items: normalizeItems(req.body.items),
      referenceNo: makeReference(req.body.type)
    };

    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      const [movementResult] = await conn.execute(
        `
        INSERT INTO stock_movements
          (reference_no, movement_type, status, supplier, notes, source_warehouse_id, destination_warehouse_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          payload.referenceNo,
          payload.type,
          payload.status,
          payload.supplier,
          payload.notes,
          payload.sourceWarehouse,
          payload.destinationWarehouse,
          req.user.id
        ]
      );

      const movementId = movementResult.insertId;

      for (const item of payload.items) {
        await conn.execute(
          "INSERT INTO stock_movement_items (movement_id, product_id, quantity) VALUES (?, ?, ?)",
          [movementId, Number(item.product), Number(item.quantity)]
        );
      }

      if (payload.status === "done") {
        await applyStockTransaction(conn, payload, payload.items);
      }

      await conn.commit();

      await logActivity({
        action: `${payload.type} created`,
        entityType: "movement",
        entityId: String(movementId),
        meta: { referenceNo: payload.referenceNo, status: payload.status },
        user: req.user.id
      });

      const populated = await loadMovementById(movementId);
      res.status(201).json(populated);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(400).json({ message: "Failed to create movement", error: error.message });
  }
};

export const updateMovementStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["draft", "waiting", "ready", "done", "cancelled"];
    if (!allowedStatuses.includes(String(status))) {
      return res.status(400).json({ message: "Invalid movement status" });
    }

    const conn = await getConnection();
    let committed = false;
    let stockWarning = "";

    try {
      await conn.beginTransaction();

      const [movementRows] = await conn.execute(
        `
        SELECT id, movement_type, status, source_warehouse_id, destination_warehouse_id, reference_no
        FROM stock_movements
        WHERE id = ?
        LIMIT 1
        `,
        [req.params.id]
      );

      const movement = movementRows[0];
      if (!movement) {
        await conn.rollback();
        return res.status(404).json({ message: "Movement not found" });
      }

      if (!canUseMovementType(req.user?.normalizedRole, movement.movement_type)) {
        await conn.rollback();
        return res.status(403).json({
          message: "This role is not allowed to update this movement type"
        });
      }

      const previousStatus = movement.status;

      if (previousStatus === status) {
        await conn.rollback();
        const populated = await loadMovementById(req.params.id);
        return res.json(populated);
      }

      await conn.execute("UPDATE stock_movements SET status = ? WHERE id = ?", [status, req.params.id]);

      if (previousStatus !== "done" && status === "done") {
        const [itemRows] = await conn.execute(
          "SELECT product_id AS product, quantity FROM stock_movement_items WHERE movement_id = ?",
          [req.params.id]
        );

        try {
          await applyStockTransaction(
            conn,
            {
              type: movement.movement_type,
              sourceWarehouse: movement.source_warehouse_id,
              destinationWarehouse: movement.destination_warehouse_id
            },
            itemRows
          );
        } catch (txError) {
          stockWarning = txError.message || "Stock transaction failed while marking done";
        }
      }

      await conn.commit();
      committed = true;

      await logActivity({
        action: `${movement.movement_type} updated`,
        entityType: "movement",
        entityId: String(movement.id),
        meta: {
          from: previousStatus,
          to: status,
          referenceNo: movement.reference_no,
          ...(stockWarning ? { stockWarning } : {})
        },
        user: req.user.id
      });

      const populated = await loadMovementById(req.params.id);
      res.json({
        ...populated,
        ...(stockWarning ? { warning: stockWarning } : {})
      });
    } catch (error) {
      if (!committed) {
        try {
          await conn.rollback();
        } catch {
          // ignore rollback failure after connection state changes
        }
      }
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to update movement" });
  }
};

export const getLedger = async (_req, res) => {
  const products = await query(
    `
    SELECT
      p.id,
      p.name,
      p.sku,
      p.category,
      p.total_stock,
      p.low_stock_threshold,
      ps.quantity,
      ps.location_note,
      w.id AS warehouse_id,
      w.name AS warehouse_name,
      w.code AS warehouse_code,
      w.location AS warehouse_location,
      w.capacity AS warehouse_capacity
    FROM products p
    LEFT JOIN product_stock ps ON ps.product_id = p.id
    LEFT JOIN warehouses w ON w.id = ps.warehouse_id
    ORDER BY p.sku, w.name
    `
  );
  res.json(products);
};