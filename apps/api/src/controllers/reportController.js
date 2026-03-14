import PDFDocument from "pdfkit";
import { query } from "../config/mysql.js";

export const exportCsv = async (_req, res) => {
  const movementRows = await query(
    `
    SELECT
      m.id,
      m.reference_no,
      m.movement_type,
      m.status,
      m.created_at,
      sw.name AS source_warehouse_name,
      dw.name AS destination_warehouse_name
    FROM stock_movements m
    LEFT JOIN warehouses sw ON sw.id = m.source_warehouse_id
    LEFT JOIN warehouses dw ON dw.id = m.destination_warehouse_id
    ORDER BY m.created_at DESC
    `
  );

  const ids = movementRows.map((m) => m.id);
  let itemRows = [];
  if (ids.length) {
    const placeholders = ids.map(() => "?").join(",");
    itemRows = await query(
      `
      SELECT i.movement_id, i.quantity, p.sku
      FROM stock_movement_items i
      JOIN products p ON p.id = i.product_id
      WHERE i.movement_id IN (${placeholders})
      ORDER BY i.id ASC
      `,
      ids
    );
  }

  const itemMap = itemRows.reduce((acc, r) => {
    const key = String(r.movement_id);
    if (!acc[key]) acc[key] = [];
    acc[key].push(`${r.sku || "NA"} x ${Number(r.quantity)}`);
    return acc;
  }, {});

  const headers = [
    "Reference",
    "Type",
    "Status",
    "Source Warehouse",
    "Destination Warehouse",
    "Items",
    "Created At"
  ];

  const rows = movementRows.map((m) => {
    const items = (itemMap[String(m.id)] || []).join(" | ");
    return [
      m.reference_no,
      m.movement_type,
      m.status,
      m.source_warehouse_name || "",
      m.destination_warehouse_name || "",
      items,
      new Date(m.created_at).toISOString()
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=coreinventory-report.csv");
  res.send(csv);
};

export const exportPdf = async (_req, res) => {
  const movements = await query(
    `
    SELECT reference_no, movement_type, status, created_at
    FROM stock_movements
    ORDER BY created_at DESC
    LIMIT 50
    `
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=coreinventory-report.pdf");

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(22).text("CoreInventory - Inventory Report", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("gray").text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown(1);

  doc.fillColor("black");
  movements.forEach((m, idx) => {
    doc
      .fontSize(12)
      .text(
        `${idx + 1}. ${m.reference_no} | ${String(m.movement_type).toUpperCase()} | ${String(m.status).toUpperCase()}`
      );
    doc.fontSize(10).fillColor("gray").text(new Date(m.created_at).toLocaleString());
    doc.fillColor("black").moveDown(0.4);
  });

  doc.end();
};