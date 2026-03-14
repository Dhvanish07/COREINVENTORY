import { query } from "../config/mysql.js";
import { logActivity } from "../utils/logActivity.js";

const mapProductsWithStock = (products, stockRows) => {
  const stockMap = stockRows.reduce((acc, row) => {
    const pid = String(row.product_id);
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push({
      warehouse: {
        _id: String(row.warehouse_id),
        id: String(row.warehouse_id),
        name: row.warehouse_name,
        code: row.warehouse_code,
        location: row.warehouse_location,
        capacity: Number(row.warehouse_capacity)
      },
      quantity: Number(row.quantity),
      locationNote: row.location_note || ""
    });
    return acc;
  }, {});

  return products.map((p) => ({
    _id: String(p.id),
    id: String(p.id),
    name: p.name,
    sku: p.sku,
    category: p.category,
    unit: p.unit,
    totalStock: Number(p.total_stock),
    lowStockThreshold: Number(p.low_stock_threshold),
    stockByWarehouse: stockMap[String(p.id)] || []
  }));
};

export const getProducts = async (req, res) => {
  const { search = "", category = "", warehouse = "", lowStock = "" } = req.query;

  const where = ["1=1"];
  const params = [];

  if (category) {
    where.push("p.category = ?");
    params.push(category);
  }

  if (search) {
    where.push("(p.name LIKE ? OR p.sku LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (warehouse) {
    where.push("EXISTS (SELECT 1 FROM product_stock ps WHERE ps.product_id = p.id AND ps.warehouse_id = ?)");
    params.push(Number(warehouse));
  }

  if (lowStock === "true") {
    where.push("p.total_stock <= p.low_stock_threshold");
  }

  const products = await query(
    `SELECT p.id, p.name, p.sku, p.category, p.unit, p.total_stock, p.low_stock_threshold
     FROM products p
     WHERE ${where.join(" AND ")}
     ORDER BY p.created_at DESC`,
    params
  );

  if (!products.length) return res.json([]);

  const unassignedRows = await query(
    `
    SELECT p.id, p.total_stock
    FROM products p
    LEFT JOIN product_stock ps ON ps.product_id = p.id
    WHERE ps.id IS NULL
    `
  );

  if (unassignedRows.length) {
    const warehouses = await query("SELECT id, location FROM warehouses ORDER BY id ASC LIMIT 1");
    const fallbackWarehouse = warehouses[0];

    if (fallbackWarehouse) {
      for (const row of unassignedRows) {
        await query(
          `
          INSERT INTO product_stock (product_id, warehouse_id, quantity, location_note)
          VALUES (?, ?, ?, ?)
          `,
          [row.id, fallbackWarehouse.id, Number(row.total_stock || 0), fallbackWarehouse.location]
        );
      }
    }
  }

  const productIds = products.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");
  const stockRows = await query(
    `
    SELECT
      ps.product_id,
      ps.warehouse_id,
      ps.quantity,
      ps.location_note,
      w.name AS warehouse_name,
      w.code AS warehouse_code,
      w.location AS warehouse_location,
      w.capacity AS warehouse_capacity
    FROM product_stock ps
    JOIN warehouses w ON w.id = ps.warehouse_id
    WHERE ps.product_id IN (${placeholders})
    ORDER BY ps.product_id, w.name
    `,
    productIds
  );

  res.json(mapProductsWithStock(products, stockRows));
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unit,
      initialStock = 0,
      warehouseLocation,
      lowStockThreshold = 10
    } = req.body;

    const whRows = await query(
      `
      SELECT
        w.id,
        w.location,
        w.capacity,
        COALESCE(SUM(ps.quantity), 0) AS used_capacity
      FROM warehouses w
      LEFT JOIN product_stock ps ON ps.warehouse_id = w.id
      WHERE w.id = ?
      GROUP BY w.id, w.location, w.capacity
      LIMIT 1
      `,
      [warehouseLocation]
    );
    const warehouse = whRows[0];
    if (!warehouse) {
      return res.status(400).json({ message: "Invalid warehouse" });
    }

    const initial = Number(initialStock || 0);
    const capacity = Number(warehouse.capacity || 0);
    const used = Number(warehouse.used_capacity || 0);
    const spaceLeft = Math.max(capacity - used, 0);

    if (initial > spaceLeft) {
      return res.status(400).json({
        message: `Not enough warehouse space. Space left: ${spaceLeft}`
      });
    }

    const productResult = await query(
      `
      INSERT INTO products (name, sku, category, unit, low_stock_threshold, total_stock)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, sku, category, unit, Number(lowStockThreshold), initial]
    );

    await query(
      `
      INSERT INTO product_stock (product_id, warehouse_id, quantity, location_note)
      VALUES (?, ?, ?, ?)
      `,
      [productResult.insertId, warehouse.id, initial, warehouse.location]
    );

    await logActivity({
      action: "Product created",
      entityType: "product",
      entityId: String(productResult.insertId),
      meta: { name, sku },
      user: req.user.id
    });

    const rows = await query(
      "SELECT id, name, sku, category, unit, total_stock, low_stock_threshold FROM products WHERE id = ?",
      [productResult.insertId]
    );

    const stockRows = await query(
      `
      SELECT
        ps.product_id,
        ps.warehouse_id,
        ps.quantity,
        ps.location_note,
        w.name AS warehouse_name,
        w.code AS warehouse_code,
        w.location AS warehouse_location,
        w.capacity AS warehouse_capacity
      FROM product_stock ps
      JOIN warehouses w ON w.id = ps.warehouse_id
      WHERE ps.product_id = ?
      `,
      [productResult.insertId]
    );

    res.status(201).json(mapProductsWithStock(rows, stockRows)[0]);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, sku, category, unit, lowStockThreshold } = req.body;

    await query(
      `
      UPDATE products
      SET name = COALESCE(?, name),
          sku = COALESCE(?, sku),
          category = COALESCE(?, category),
          unit = COALESCE(?, unit),
          low_stock_threshold = COALESCE(?, low_stock_threshold)
      WHERE id = ?
      `,
      [
        name ?? null,
        sku ?? null,
        category ?? null,
        unit ?? null,
        lowStockThreshold !== undefined ? Number(lowStockThreshold) : null,
        req.params.id
      ]
    );

    const rows = await query(
      "SELECT id, name, sku, category, unit, total_stock, low_stock_threshold FROM products WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: "Product not found" });

    const stockRows = await query(
      `
      SELECT
        ps.product_id,
        ps.warehouse_id,
        ps.quantity,
        ps.location_note,
        w.name AS warehouse_name,
        w.code AS warehouse_code,
        w.location AS warehouse_location,
        w.capacity AS warehouse_capacity
      FROM product_stock ps
      JOIN warehouses w ON w.id = ps.warehouse_id
      WHERE ps.product_id = ?
      `,
      [req.params.id]
    );

    res.json(mapProductsWithStock(rows, stockRows)[0]);
  } catch (error) {
    res.status(400).json({ message: "Failed to update product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const result = await query("DELETE FROM products WHERE id = ?", [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product removed" });
};