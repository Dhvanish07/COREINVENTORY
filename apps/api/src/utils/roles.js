export const normalizeRole = (role) => {
  const value = String(role || "").toLowerCase();

  if (value === "admin") return "inventory_manager";
  if (value === "manager") return "inventory_manager";
  if (value === "inventory_manager") return "inventory_manager";

  if (value === "operator") return "warehouse_staff";
  if (value === "warehouse_staff") return "warehouse_staff";

  return "warehouse_staff";
};

export const roleLabel = (normalizedRole) => {
  if (normalizedRole === "inventory_manager") return "Inventory Manager";
  return "Warehouse Staff";
};

export const canManageMasters = (normalizedRole) => normalizedRole === "inventory_manager";

export const canExportReports = (normalizedRole) => normalizedRole === "inventory_manager";

export const canSeedData = (normalizedRole) => normalizedRole === "inventory_manager";

export const canUseMovementType = (normalizedRole, movementType) => {
  const type = String(movementType || "").toLowerCase();

  if (normalizedRole === "inventory_manager") {
    return type === "receipt" || type === "delivery";
  }

  return ["receipt", "delivery", "transfer", "adjustment"].includes(type);
};