import { query } from "../config/mysql.js";

export const getDashboardSummary = async (_req, res) => {
  const [kpiRows] = await Promise.all([
    query(
      `
      SELECT
        (SELECT COALESCE(SUM(total_stock),0) FROM products) AS totalProductsInStock,
        (SELECT COUNT(*) FROM products WHERE total_stock <= low_stock_threshold) AS lowStockItems,
        (SELECT COUNT(*) FROM stock_movements WHERE movement_type = 'receipt' AND status IN ('waiting','ready')) AS pendingReceipts,
        (SELECT COUNT(*) FROM stock_movements WHERE movement_type = 'delivery' AND status IN ('waiting','ready')) AS pendingDeliveries,
        (SELECT COUNT(*) FROM stock_movements WHERE movement_type = 'transfer' AND status IN ('waiting','ready')) AS internalTransfersScheduled
      `
    )
  ]);

  const recentActivityRows = await query(
    `
    SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at, u.name AS user_name, u.email AS user_email
    FROM activities a
    LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 8
    `
  );

  const recentActivity = recentActivityRows.map((a) => ({
    _id: String(a.id),
    action: a.action,
    entityType: a.entity_type,
    entityId: a.entity_id,
    createdAt: a.created_at,
    user: a.user_name ? { name: a.user_name, email: a.user_email } : undefined
  }));

  const movements = await query(
    `
    SELECT movement_type, created_at
    FROM stock_movements
    WHERE status = 'done'
    ORDER BY created_at DESC
    LIMIT 100
    `
  );
  const chartMap = {};

  movements.forEach((doc) => {
    const key = new Date(doc.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric"
    });
    if (!chartMap[key]) {
      chartMap[key] = { date: key, receipt: 0, delivery: 0, transfer: 0, adjustment: 0 };
    }
    chartMap[key][doc.movement_type] += 1;
  });

  const stockTrend = Object.values(chartMap).slice(-10);
  const kpis = kpiRows[0] || {
    totalProductsInStock: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    internalTransfersScheduled: 0
  };

  res.json({
    kpis: {
      totalProductsInStock: Number(kpis.totalProductsInStock || 0),
      lowStockItems: Number(kpis.lowStockItems || 0),
      pendingReceipts: Number(kpis.pendingReceipts || 0),
      pendingDeliveries: Number(kpis.pendingDeliveries || 0),
      internalTransfersScheduled: Number(kpis.internalTransfersScheduled || 0)
    },
    stockTrend,
    recentActivity
  });
};