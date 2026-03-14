import Product from "../models/Product.js";

const ensureWarehouseStockRow = (product, warehouseId) => {
  let row = product.stockByWarehouse.find(
    (entry) => entry.warehouse.toString() === warehouseId.toString()
  );

  if (!row) {
    row = { warehouse: warehouseId, quantity: 0, locationNote: "" };
    product.stockByWarehouse.push(row);
  }

  return row;
};

export const increaseStock = async (items, warehouseId) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const row = ensureWarehouseStockRow(product, warehouseId);
    row.quantity += Number(item.quantity);
    product.totalStock += Number(item.quantity);
    await product.save();
  }
};

export const decreaseStock = async (items, warehouseId) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const row = ensureWarehouseStockRow(product, warehouseId);
    const qty = Number(item.quantity);

    if (row.quantity < qty || product.totalStock < qty) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    row.quantity -= qty;
    product.totalStock -= qty;
    await product.save();
  }
};

export const adjustStock = async (items, warehouseId) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const row = ensureWarehouseStockRow(product, warehouseId);
    const newQty = Number(item.quantity);

    const diff = newQty - row.quantity;
    row.quantity = newQty;
    product.totalStock += diff;
    await product.save();
  }
};