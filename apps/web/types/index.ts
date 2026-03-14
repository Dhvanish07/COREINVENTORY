export type Warehouse = {
  _id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
};

export type Product = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  totalStock: number;
  lowStockThreshold: number;
  stockByWarehouse: Array<{
    warehouse: Warehouse;
    quantity: number;
    locationNote: string;
  }>;
};

export type Movement = {
  _id: string;
  referenceNo: string;
  type: "receipt" | "delivery" | "transfer" | "adjustment";
  status: "draft" | "waiting" | "ready" | "done" | "cancelled";
  supplier?: string;
  notes?: string;
  sourceWarehouse?: Warehouse;
  destinationWarehouse?: Warehouse;
  items: Array<{ product: Product; quantity: number }>;
  createdAt: string;
};

export type DashboardSummary = {
  kpis: {
    totalProductsInStock: number;
    lowStockItems: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    internalTransfersScheduled: number;
  };
  stockTrend: Array<{ date: string; receipt: number; delivery: number; transfer: number; adjustment: number }>;
  recentActivity: Array<{
    _id: string;
    action: string;
    entityType: string;
    createdAt: string;
    user?: { name: string; email: string };
  }>;
};

export type ProfileUser = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  normalizedRole: "inventory_manager" | "warehouse_staff";
  roleLabel: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};