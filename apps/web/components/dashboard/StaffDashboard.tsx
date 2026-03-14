"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Movement, Product, Warehouse } from "@/types";

type StaffDashboardProps = {
  products: Product[];
  warehouses: Warehouse[];
  movements: Movement[];
};

const isOpenStatus = (status: string) => ["draft", "waiting", "ready"].includes(status);

export function StaffDashboard({ products, warehouses, movements }: StaffDashboardProps) {
  const transferDocs = useMemo(
    () => movements.filter((m) => m.type === "transfer" && isOpenStatus(m.status)),
    [movements]
  );
  const pickingDocs = useMemo(
    () => movements.filter((m) => m.type === "delivery" && isOpenStatus(m.status)),
    [movements]
  );
  const shelvingDocs = useMemo(
    () => movements.filter((m) => m.type === "receipt" && isOpenStatus(m.status)),
    [movements]
  );
  const countingDocs = useMemo(
    () => movements.filter((m) => m.type === "adjustment" && isOpenStatus(m.status)),
    [movements]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.totalStock <= product.lowStockThreshold).slice(0, 6),
    [products]
  );

  const openWorkQueue = useMemo(() => {
    return movements
      .filter((m) => isOpenStatus(m.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [movements]);

  const cards = [
    { label: "Warehouses", value: warehouses.length },
    { label: "Open Transfers", value: transferDocs.length },
    { label: "Open Picking", value: pickingDocs.length },
    { label: "Open Shelving", value: shelvingDocs.length },
    { label: "Open Counting", value: countingDocs.length }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-400">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Work Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openWorkQueue.length === 0 && <p className="text-sm text-slate-400">No open work items.</p>}
            {openWorkQueue.map((movement) => (
              <div key={movement._id} className="rounded-lg border border-cyan-500/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{movement.referenceNo}</p>
                  <Badge>{movement.status}</Badge>
                </div>
                <p className="text-slate-400 capitalize">{movement.type}</p>
                <p className="text-xs text-slate-400">
                  {movement.items.map((item) => `${item.product?.sku || "N/A"} x ${item.quantity}`).join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 && <p className="text-sm text-slate-400">No low stock alerts.</p>}
            {lowStockProducts.map((product) => (
              <div key={product._id} className="rounded-lg border border-rose-500/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{product.name}</p>
                  <Badge className="border-rose-500/30 text-rose-300">Low</Badge>
                </div>
                <p className="text-slate-400">SKU: {product.sku}</p>
                <p className="text-xs text-slate-400">
                  Current {product.totalStock} • Threshold {product.lowStockThreshold}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
