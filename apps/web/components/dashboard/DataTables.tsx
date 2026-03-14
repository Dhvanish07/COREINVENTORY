"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Movement, Product, Warehouse } from "@/types";

const warehouseSpaceMap = (warehouses: Warehouse[], products: Product[]) => {
  const usage = new Map<string, number>();

  for (const product of products) {
    for (const entry of product.stockByWarehouse || []) {
      const warehouseId = String(entry.warehouse._id);
      usage.set(warehouseId, (usage.get(warehouseId) || 0) + Number(entry.quantity || 0));
    }
  }

  const result = new Map<string, { used: number; left: number; capacity: number }>();
  for (const warehouse of warehouses) {
    const used = usage.get(String(warehouse._id)) || 0;
    const capacity = Number(warehouse.capacity || 0);
    const left = Math.max(capacity - used, 0);
    result.set(String(warehouse._id), { used, left, capacity });
  }

  return result;
};

export function ProductModule({
  products,
  warehouses,
  onCreate,
  onUpdate,
  loading,
  showCreateForm = true,
  showProductTable = true
}: {
  products: Product[];
  warehouses: Warehouse[];
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, payload: Record<string, unknown>) => Promise<void>;
  loading: boolean;
  showCreateForm?: boolean;
  showProductTable?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const space = useMemo(() => warehouseSpaceMap(warehouses, products), [warehouses, products]);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
    initialStock: 0,
    warehouseLocation: "",
    lowStockThreshold: 10
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const bySearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const byCategory = category ? p.category.toLowerCase() === category.toLowerCase() : true;
      return bySearch && byCategory;
    });
  }, [products, search, category]);

  return (
    <div className="space-y-4">
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Unit of Measure" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <Input
              type="number"
              placeholder="Initial Stock"
              value={form.initialStock}
              onChange={(e) => setForm({ ...form, initialStock: Number(e.target.value) })}
            />
            <select
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
              value={form.warehouseLocation}
              onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
            >
              <option value="">Warehouse Location</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} (Space left: {space.get(String(w._id))?.left ?? 0})
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="Low Stock Threshold"
              value={form.lowStockThreshold}
              onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
            />
            <Button
              onClick={async () => {
                setFormError("");
                setFormMessage("");

                if (!form.warehouseLocation) {
                  setFormError("Please select a warehouse location for this product.");
                  return;
                }

                const selected = space.get(String(form.warehouseLocation));
                if (selected && Number(form.initialStock) > selected.left) {
                  setFormError(`Not enough warehouse space. Only ${selected.left} units left.`);
                  return;
                }

                await onCreate(form);
                setFormMessage("Product created and assigned to selected warehouse.");
                setForm({
                  name: "",
                  sku: "",
                  category: "",
                  unit: "pcs",
                  initialStock: 0,
                  warehouseLocation: "",
                  lowStockThreshold: 10
                });
              }}
              disabled={loading}
            >
              Add Product
            </Button>
            {formMessage && <p className="text-sm text-emerald-300">{formMessage}</p>}
            {formError && <p className="text-sm text-rose-300">{formError}</p>}
          </CardContent>
        </Card>
      )}

      {showProductTable && (
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 grid gap-2 md:grid-cols-3">
              <Input placeholder="SKU or name search" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Input placeholder="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-2">Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Assigned Warehouses</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id} className="border-t border-slate-800">
                      <td className="py-2">{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category}</td>
                      <td className="max-w-[280px]">
                        {p.stockByWarehouse?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {p.stockByWarehouse.map((entry) => (
                              <span
                                key={`${p._id}-${entry.warehouse._id}`}
                                className="rounded-md border border-cyan-500/20 bg-slate-900/40 px-2 py-1 text-xs"
                              >
                                {entry.warehouse.name} ({entry.quantity})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-rose-300">Not assigned</span>
                        )}
                      </td>
                      <td>{p.totalStock}</td>
                      <td>
                        {p.totalStock <= p.lowStockThreshold ? (
                          <Badge className="border-rose-500/30 text-rose-300">Low Stock</Badge>
                        ) : (
                          <Badge>Healthy</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onUpdate(p._id, {
                              lowStockThreshold: p.lowStockThreshold + 5
                            })
                          }
                        >
                          + Threshold
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const actionStatuses = ["draft", "waiting", "ready", "done", "cancelled"];
const visibleDocumentStatuses = ["draft", "waiting", "ready"];

export function MovementModule({
  title,
  defaultType,
  movements,
  products,
  warehouses,
  onCreate,
  onUpdateStatus,
  sourceNeeded,
  destinationNeeded,
  sourceLabel,
  destinationLabel,
  supplierPlaceholder,
  submitLabel,
  workflowOverride,
  showSchedule,
  requireSchedule
}: {
  title: string;
  defaultType: "receipt" | "delivery" | "transfer" | "adjustment";
  movements: Movement[];
  products: Product[];
  warehouses: Warehouse[];
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  sourceNeeded?: boolean;
  destinationNeeded?: boolean;
  sourceLabel?: string;
  destinationLabel?: string;
  supplierPlaceholder?: string;
  submitLabel?: string;
  workflowOverride?: string;
  showSchedule?: boolean;
  requireSchedule?: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    supplier: "",
    sourceWarehouse: "",
    destinationWarehouse: "",
    product: "",
    quantity: 1,
    status: defaultType === "delivery" ? "waiting" : "draft",
    scheduleAt: ""
  });

  const space = useMemo(() => warehouseSpaceMap(warehouses, products), [warehouses, products]);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p._id) === String(form.product)),
    [products, form.product]
  );

  const productMatches = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 8);
  }, [productSearch, products]);

  const sourceWarehouseStock = useMemo(() => {
    if (!selectedProduct || !form.sourceWarehouse) return 0;
    const hit = selectedProduct.stockByWarehouse.find(
      (entry) => String(entry.warehouse._id) === String(form.sourceWarehouse)
    );
    return Number(hit?.quantity || 0);
  }, [selectedProduct, form.sourceWarehouse]);

  const sourceWarehouseOptions = useMemo(() => {
    if (defaultType !== "transfer" || !selectedProduct) {
      return warehouses;
    }

    const availableWarehouseIds = new Set(
      selectedProduct.stockByWarehouse
        .filter((entry) => Number(entry.quantity || 0) > 0)
        .map((entry) => String(entry.warehouse._id))
    );

    return warehouses.filter((w) => availableWarehouseIds.has(String(w._id)));
  }, [defaultType, selectedProduct, warehouses]);

  const effectiveShowSchedule = showSchedule ?? defaultType === "delivery";
  const effectiveRequireSchedule = requireSchedule ?? effectiveShowSchedule;

  const workflowMap: Record<typeof defaultType, string> = {
    receipt: "1 Create receipt → 2 Add supplier → 3 Add products → 4 Enter quantities → 5 Validate receipt",
    delivery: "1 Pick items → 2 Pack items → 3 Validate delivery",
    transfer: "Move stock between locations such as Warehouse → Production Floor, Rack A → Rack B, or Warehouse 1 → Warehouse 2.",
    adjustment: "Record physical count mismatches and the system auto-adjusts stock with full audit trail."
  };

  const workflowText = workflowOverride || workflowMap[defaultType];

  const filtered = movements.filter((m) => {
    const statusMatch = statusFilter
      ? m.status === statusFilter
      : visibleDocumentStatuses.includes(m.status);
    const whMatch = warehouseFilter
      ? m.sourceWarehouse?._id === warehouseFilter || m.destinationWarehouse?._id === warehouseFilter
      : true;
    const catMatch = categoryFilter
      ? m.items.some((i) => i.product?.category?.toLowerCase() === categoryFilter.toLowerCase())
      : true;
    return statusMatch && whMatch && catMatch;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-400">Workflow</p>
          <p className="text-sm text-slate-300">{workflowText}</p>

          {(defaultType === "delivery" || defaultType === "receipt" || defaultType === "transfer") && (
            <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-slate-900/30 p-3">
              <p className="text-xs text-slate-400">Search Product</p>
              <Input
                placeholder="Search by product name or SKU"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productMatches.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-md border border-slate-700/70">
                  {productMatches.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className="flex w-full items-center justify-between border-b border-slate-800 px-3 py-2 text-left text-sm hover:bg-slate-800/60"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, product: p._id }));
                        setProductSearch(`${p.name} (${p.sku})`);
                      }}
                    >
                      <span>{p.name}</span>
                      <span className="text-xs text-slate-400">{p.sku}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedProduct && (defaultType === "delivery" || defaultType === "receipt" || defaultType === "transfer") && (
            <div className="rounded-lg border border-cyan-500/20 bg-slate-900/30 p-3 text-sm">
              <p className="font-medium text-cyan-200">Selected: {selectedProduct.name}</p>
              <p className="text-xs text-slate-400">Stock by Warehouse</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProduct.stockByWarehouse.length ? (
                  selectedProduct.stockByWarehouse.map((entry) => (
                    <span
                      key={`${selectedProduct._id}-${entry.warehouse._id}`}
                      className="rounded-md border border-cyan-500/20 bg-slate-900/40 px-2 py-1 text-xs"
                    >
                      {entry.warehouse.name}: {entry.quantity}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-rose-300">No stock found in any warehouse</span>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder={
                supplierPlaceholder ||
                (defaultType === "delivery"
                  ? "Customer / Reference"
                  : defaultType === "transfer"
                    ? "Transfer Note"
                    : "Supplier / Notes")
              }
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            />
            {sourceNeeded && (
              <select
                className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
                value={form.sourceWarehouse}
                onChange={(e) => setForm({ ...form, sourceWarehouse: e.target.value })}
              >
                <option value="">{sourceLabel || (defaultType === "transfer" ? "Transfer From" : "Source Warehouse")}</option>
                {sourceWarehouseOptions.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            )}
            {destinationNeeded && (
              <select
                className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
                value={form.destinationWarehouse}
                onChange={(e) => setForm({ ...form, destinationWarehouse: e.target.value })}
              >
                <option value="">{destinationLabel || (defaultType === "transfer" ? "Transfer To" : "Destination Warehouse")}</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} (Space left: {space.get(String(w._id))?.left ?? 0})
                  </option>
                ))}
              </select>
            )}
            <select
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
              value={form.product}
              onChange={(e) => {
                const selected = e.target.value;
                setForm((prev) => ({ ...prev, product: selected }));
                const hit = products.find((p) => String(p._id) === selected);
                setProductSearch(hit ? `${hit.name} (${hit.sku})` : "");
              }}
            >
              <option value="">Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            {effectiveShowSchedule && (
              <Input
                type="datetime-local"
                value={form.scheduleAt}
                onChange={(e) => setForm((prev) => ({ ...prev, scheduleAt: e.target.value }))}
              />
            )}
            <select
              className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {actionStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Button
              onClick={async () => {
                setFormError("");

                if (!form.product) {
                  setFormError("Please select a product.");
                  return;
                }

                if (form.quantity <= 0) {
                  setFormError("Quantity must be greater than zero.");
                  return;
                }

                if (sourceNeeded && !form.sourceWarehouse) {
                  setFormError(`Please select ${sourceLabel || (defaultType === "transfer" ? "transfer-from warehouse" : "source warehouse")}.`);
                  return;
                }

                if (destinationNeeded && !form.destinationWarehouse) {
                  setFormError(`Please select ${destinationLabel || (defaultType === "transfer" ? "transfer-to warehouse" : "destination warehouse")}.`);
                  return;
                }

                if (defaultType === "receipt" && form.destinationWarehouse) {
                  const selectedSpace = space.get(String(form.destinationWarehouse));
                  if (selectedSpace && Number(form.quantity) > selectedSpace.left) {
                    setFormError(`Not enough space in destination warehouse. Left: ${selectedSpace.left}`);
                    return;
                  }
                }

                if (defaultType === "delivery") {
                  if (effectiveRequireSchedule && !form.scheduleAt) {
                    setFormError("Please select delivery date and time.");
                    return;
                  }

                  if (form.quantity > sourceWarehouseStock) {
                    setFormError(`Insufficient stock in selected source warehouse. Available: ${sourceWarehouseStock}`);
                    return;
                  }
                }

                if (defaultType === "transfer") {
                  if (String(form.sourceWarehouse) === String(form.destinationWarehouse)) {
                    setFormError("Transfer-from and transfer-to warehouses must be different.");
                    return;
                  }

                  if (form.quantity > sourceWarehouseStock) {
                    setFormError(`Insufficient stock in transfer-from warehouse. Available: ${sourceWarehouseStock}`);
                    return;
                  }
                }

                await onCreate({
                  type: defaultType,
                  status: form.status,
                  supplier: form.supplier,
                  notes:
                    effectiveShowSchedule && form.scheduleAt
                      ? `Scheduled delivery at ${new Date(form.scheduleAt).toLocaleString()}`
                      : undefined,
                  sourceWarehouse: form.sourceWarehouse || undefined,
                  destinationWarehouse: form.destinationWarehouse || undefined,
                  items: [{ product: form.product, quantity: form.quantity }]
                });

                setForm({
                  supplier: "",
                  sourceWarehouse: "",
                  destinationWarehouse: "",
                  product: "",
                  quantity: 1,
                  status: defaultType === "delivery" ? "waiting" : "draft",
                  scheduleAt: ""
                });
                setProductSearch("");
              }}
            >
              {submitLabel || (defaultType === "delivery" ? "Schedule Delivery" : "Create Document")}
            </Button>
          </div>
          {(defaultType === "delivery" || defaultType === "transfer") && form.sourceWarehouse && form.product && (
            <p className="text-xs text-slate-400">Available in source warehouse: {sourceWarehouseStock}</p>
          )}
          {formError && <p className="text-sm text-rose-300">{formError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <select
            className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            {visibleDocumentStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-700 bg-slate-900/70 px-3"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
          >
            <option value="">Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
          <Input placeholder="Product Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(defaultType === "delivery" || defaultType === "transfer") && (
            <p className="text-xs text-slate-400">
              Mark as <span className="font-medium text-cyan-200">done</span> to apply stock movement from the selected source warehouse.
            </p>
          )}
          {filtered.map((m) => (
            <div key={m._id} className="rounded-lg border border-cyan-500/20 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{m.referenceNo}</p>
                <Badge>{m.status}</Badge>
              </div>
              <p className="text-slate-400">Type: {m.type}</p>
              <p className="text-slate-400">Items: {m.items.map((i) => `${i.product?.sku || "N/A"} x ${i.quantity}`).join(", ")}</p>
              <div className="mt-2 flex gap-2">
                {actionStatuses.map((s) => (
                  <Button key={s} size="sm" variant="ghost" onClick={() => onUpdateStatus(m._id, s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function WarehouseModule({
  warehouses,
  products,
  onCreate
}: {
  warehouses: Warehouse[];
  products: Product[];
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: "", code: "", location: "", capacity: 0 });
  const space = useMemo(() => warehouseSpaceMap(warehouses, products), [warehouses, products]);

  const productsByWarehouse = useMemo(() => {
    const map = new Map<
      string,
      Array<{ productId: string; productName: string; sku: string; quantity: number; unit: string }>
    >();

    for (const product of products) {
      for (const entry of product.stockByWarehouse || []) {
        const key = String(entry.warehouse._id);
        if (!map.has(key)) map.set(key, []);
        map.get(key)?.push({
          productId: String(product._id),
          productName: product.name,
          sku: product.sku,
          quantity: Number(entry.quantity),
          unit: product.unit
        });
      }
    }

    for (const item of map.values()) {
      item.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return map;
  }, [products]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Management</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          <Button onClick={() => onCreate(form)}>Create Warehouse</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2 text-left">Name</th>
                  <th className="text-left">Code</th>
                  <th className="text-left">Location</th>
                  <th className="text-left">Capacity</th>
                  <th className="text-left">Used</th>
                  <th className="text-left">Space Left</th>
                  <th className="text-left">Products in Warehouse</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w._id} className="border-t border-slate-800">
                    <td className="py-2">{w.name}</td>
                    <td>{w.code}</td>
                    <td>{w.location}</td>
                    <td>{w.capacity}</td>
                    <td>{space.get(String(w._id))?.used ?? 0}</td>
                    <td>{space.get(String(w._id))?.left ?? 0}</td>
                    <td className="max-w-[420px]">
                      <div className="flex flex-wrap gap-1">
                        {(productsByWarehouse.get(String(w._id)) || []).length ? (
                          (productsByWarehouse.get(String(w._id)) || []).map((item) => (
                            <span
                              key={`${w._id}-${item.productId}`}
                              className="rounded-md border border-cyan-500/20 bg-slate-900/40 px-2 py-1 text-xs"
                            >
                              {item.productName} ({item.sku}): {item.quantity} {item.unit}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No products currently stored</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
