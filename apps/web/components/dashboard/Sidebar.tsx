"use client";

import { Boxes, FileInput, FileOutput, Gauge, Settings, Shuffle, UserCircle2, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { key: "dashboard", label: "Dashboard", icon: Gauge, roles: ["inventory_manager", "warehouse_staff"] },
  { key: "receipts", label: "Receiving", icon: FileInput, roles: ["inventory_manager"] },
  { key: "add_product", label: "Add Product", icon: Boxes, roles: ["inventory_manager"] },
  { key: "products", label: "Products", icon: Boxes, roles: ["inventory_manager"] },
  { key: "warehouses", label: "Warehouses", icon: Warehouse, roles: ["inventory_manager"] },
  { key: "delivery", label: "Delivery Scheduling", icon: FileOutput, roles: ["inventory_manager"] },
  { key: "transfers", label: "Internal Transfer", icon: Shuffle, roles: ["warehouse_staff"] },
  { key: "picking", label: "Picking", icon: FileOutput, roles: ["warehouse_staff"] },
  { key: "shelving", label: "Shelving", icon: FileInput, roles: ["warehouse_staff"] },
  { key: "counting", label: "Counting", icon: Settings, roles: ["warehouse_staff"] }
];

export function Sidebar({
  current,
  onChange,
  onLogout,
  normalizedRole = "inventory_manager",
  roleLabel = "Inventory Manager"
}: {
  current: string;
  onChange: (key: string) => void;
  onLogout: () => void;
  normalizedRole?: "inventory_manager" | "warehouse_staff";
  roleLabel?: string;
}) {
  const visibleItems = items.filter((item) => item.roles.includes(normalizedRole));

  return (
    <aside className="glass h-full min-h-[calc(100vh-2rem)] w-72 rounded-2xl p-4">
      <p className="mb-4 text-xl font-semibold text-cyan-200">CoreInventory</p>
      <div className="mb-3 rounded-lg border border-cyan-500/20 bg-slate-900/40 px-3 py-2 text-xs text-slate-300">
        <p className="font-medium text-cyan-200">{roleLabel}</p>
        <p>{visibleItems.length} module options</p>
      </div>
      <nav className="space-y-1">
        {visibleItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition",
              current === item.key ? "bg-cyan-500/20 text-cyan-200" : "hover:bg-slate-800"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-6 border-t border-cyan-500/20 pt-4">
        <button onClick={() => onChange("profile")} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-800">
          <UserCircle2 className="h-4 w-4" /> Profile
        </button>
        <button onClick={onLogout} className="mt-1 w-full rounded-lg border border-cyan-500/25 px-3 py-2 text-left text-sm text-cyan-200 hover:bg-cyan-500/10">
          Logout
        </button>
      </div>
    </aside>
  );
}