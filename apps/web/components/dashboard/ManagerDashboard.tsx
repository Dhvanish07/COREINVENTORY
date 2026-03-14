"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardSummary, Movement, Product, Warehouse } from "@/types";

type ManagerDashboardProps = {
  summary: DashboardSummary;
  warehouses: Warehouse[];
  products: Product[];
  deliveries: Movement[];
};

const parseScheduledAt = (movement: Movement) => {
  const value = movement.notes || "";
  const marker = "Scheduled delivery at ";
  const index = value.indexOf(marker);
  if (index < 0) return "Not specified";
  return value.slice(index + marker.length) || "Not specified";
};

export function ManagerDashboard({ summary, warehouses, products, deliveries }: ManagerDashboardProps) {
  const warehouseChartData = useMemo(() => {
    const usedMap = new Map<string, number>();

    for (const product of products) {
      for (const entry of product.stockByWarehouse || []) {
        const key = String(entry.warehouse._id);
        usedMap.set(key, (usedMap.get(key) || 0) + Number(entry.quantity || 0));
      }
    }

    return warehouses.map((warehouse) => {
      const used = usedMap.get(String(warehouse._id)) || 0;
      const capacity = Number(warehouse.capacity || 0);
      const available = Math.max(capacity - used, 0);

      return {
        name: warehouse.name,
        used,
        available,
        capacity
      };
    });
  }, [warehouses, products]);

  const scheduledDeliveries = useMemo(() => {
    return deliveries
      .filter((delivery) => ["draft", "waiting", "ready"].includes(delivery.status))
      .slice(0, 8);
  }, [deliveries]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product) => product.totalStock <= product.lowStockThreshold)
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 10);
  }, [products]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Warehouses</p>
            <p className="mt-1 text-2xl font-semibold">{warehouses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Products</p>
            <p className="mt-1 text-2xl font-semibold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Scheduled Deliveries</p>
            <p className="mt-1 text-2xl font-semibold">{scheduledDeliveries.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Low Stock Warnings</p>
            <p className="mt-1 text-2xl font-semibold">{lowStockProducts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Pending Receipts</p>
            <p className="mt-1 text-2xl font-semibold">{summary.kpis.pendingReceipts}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Capacity Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="used" stackId="capacity" fill="#22d3ee" name="Used" />
                <Bar dataKey="available" stackId="capacity" fill="#0f172a" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Deliveries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scheduledDeliveries.length === 0 && (
              <p className="text-sm text-slate-400">No scheduled deliveries.</p>
            )}
            {scheduledDeliveries.map((delivery) => (
              <div key={delivery._id} className="rounded-lg border border-cyan-500/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{delivery.referenceNo}</p>
                  <Badge>{delivery.status}</Badge>
                </div>
                <p className="text-slate-400">{delivery.supplier || "No customer/reference"}</p>
                <p className="text-xs text-slate-400">{parseScheduledAt(delivery)}</p>
                <p className="text-xs text-slate-400">
                  {delivery.items.map((item) => `${item.product?.sku || "N/A"} x ${item.quantity}`).join(", ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 && (
              <p className="text-sm text-slate-400">No low-stock products right now.</p>
            )}
            {lowStockProducts.map((product) => (
              <div key={product._id} className="rounded-lg border border-rose-500/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{product.name}</p>
                  <Badge className="border-rose-500/30 text-rose-300">Low Stock</Badge>
                </div>
                <p className="text-slate-400">SKU: {product.sku}</p>
                <p className="text-xs text-slate-400">
                  Stock {product.totalStock} / Threshold {product.lowStockThreshold}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
