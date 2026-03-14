"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityList } from "@/components/dashboard/ActivityList";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MovementModule, ProductModule, WarehouseModule } from "@/components/dashboard/DataTables";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import type { DashboardSummary, Movement, Product, ProfileUser, Warehouse } from "@/types";

const EMPTY_SUMMARY: DashboardSummary = {
  kpis: {
    totalProductsInStock: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    internalTransfersScheduled: 0
  },
  stockTrend: [],
  recentActivity: []
};

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [normalizedRole, setNormalizedRole] = useState<"inventory_manager" | "warehouse_staff">(
    "inventory_manager"
  );
  const [roleLabel, setRoleLabel] = useState("Inventory Manager");
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: ""
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const token = useMemo(() => authStorage.getToken(), []);

  const roleTabs: Record<"inventory_manager" | "warehouse_staff", string[]> = {
    inventory_manager: ["dashboard", "receipts", "add_product", "products", "warehouses", "delivery", "profile"],
    warehouse_staff: ["dashboard", "transfers", "picking", "shelving", "counting", "profile"]
  };

  const guardedRequest = async <T,>(endpoint: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET", body?: unknown) => {
    if (!token) {
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return apiRequest<T>(endpoint, method, body, token);
  };

  const fetchAll = async () => {
    setLoading(true);
    setActionError("");

    try {
      const me = await guardedRequest<{ user: ProfileUser }>("/auth/me");

      const [sumResult, productResult, warehouseResult, movementResult] = await Promise.allSettled([
        guardedRequest<DashboardSummary>("/dashboard/summary"),
        guardedRequest<Product[]>("/products"),
        guardedRequest<Warehouse[]>("/warehouses"),
        guardedRequest<Movement[]>("/movements")
      ]);

      const role = me.user?.normalizedRole === "warehouse_staff" ? "warehouse_staff" : "inventory_manager";
      setNormalizedRole(role);
      setRoleLabel(me.user?.roleLabel || (role === "warehouse_staff" ? "Warehouse Staff" : "Inventory Manager"));
      setProfile(me.user);
      setProfileForm((prev) => ({
        ...prev,
        name: me.user?.name || "",
        email: me.user?.email || ""
      }));

      const availableTabs = roleTabs[role];
      if (!availableTabs.includes(tab)) {
        setTab(availableTabs[0]);
      }

      setSummary(sumResult.status === "fulfilled" ? sumResult.value : EMPTY_SUMMARY);
      setProducts(productResult.status === "fulfilled" ? productResult.value : []);
      setWarehouses(warehouseResult.status === "fulfilled" ? warehouseResult.value : []);
      setMovements(movementResult.status === "fulfilled" ? movementResult.value : []);

      if (
        sumResult.status === "rejected" ||
        productResult.status === "rejected" ||
        warehouseResult.status === "rejected" ||
        movementResult.status === "rejected"
      ) {
        setActionError("Some dashboard data could not load. Please refresh.");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLogout = () => {
    authStorage.clear();
    router.push("/login");
  };

  const createProduct = async (payload: Record<string, unknown>) => {
    await guardedRequest("/products", "POST", payload);
    fetchAll();
  };

  const updateProduct = async (id: string, payload: Record<string, unknown>) => {
    await guardedRequest(`/products/${id}`, "PUT", payload);
    fetchAll();
  };

  const createWarehouse = async (payload: Record<string, unknown>) => {
    await guardedRequest("/warehouses", "POST", payload);
    fetchAll();
  };

  const createMovement = async (payload: Record<string, unknown>) => {
    try {
      setActionError("");
      setActionMessage("");
      await guardedRequest("/movements", "POST", payload);
      setActionMessage("Movement created successfully");
      fetchAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to create movement");
    }
  };

  const updateMovementStatus = async (id: string, status: string) => {
    try {
      setActionError("");
      setActionMessage("");
      const updated = await guardedRequest<{ warning?: string }>(`/movements/${id}/status`, "PATCH", {
        status
      });
      setActionMessage(
        updated?.warning
          ? `Movement status updated to ${status}. Note: ${updated.warning}`
          : `Movement status updated to ${status}`
      );
      fetchAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update movement");
    }
  };

  const updateProfile = async () => {
    try {
      setProfileError("");
      setProfileMessage("");
      setProfileSaving(true);

      const payload: Record<string, unknown> = {
        name: profileForm.name,
        email: profileForm.email
      };

      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const updated = await guardedRequest<{ message: string; user: ProfileUser }>(
        "/auth/me",
        "PUT",
        payload
      );

      setProfile(updated.user);
      setProfileForm((prev) => ({
        ...prev,
        name: updated.user.name,
        email: updated.user.email,
        currentPassword: "",
        newPassword: ""
      }));
      setProfileMessage(updated.message || "Profile updated successfully");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const receipts = movements.filter((m) => m.type === "receipt");
  const deliveries = movements.filter((m) => m.type === "delivery");
  const transfers = movements.filter((m) => m.type === "transfer");
  const adjustments = movements.filter((m) => m.type === "adjustment");
  const canManageMasterData = normalizedRole === "inventory_manager";
  const canUseTransfers = normalizedRole === "warehouse_staff";
  const canUseAdjustments = normalizedRole === "warehouse_staff";

  return (
    <main className="p-4 md:p-6">
      <div className="mx-auto flex max-w-[1700px] gap-4">
        <Sidebar
          current={tab}
          onChange={setTab}
          onLogout={onLogout}
          normalizedRole={normalizedRole}
          roleLabel={roleLabel}
        />

        <section className="flex-1 space-y-4">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
          )}

          {!loading && (
            <>
              {(actionError || actionMessage) && (
                <div className="space-y-2">
                  {actionError && <p className="text-sm text-rose-300">{actionError}</p>}
                  {actionMessage && <p className="text-sm text-emerald-300">{actionMessage}</p>}
                </div>
              )}

              {tab === "dashboard" && canManageMasterData && (
                <ManagerDashboard
                  summary={summary}
                  warehouses={warehouses}
                  products={products}
                  deliveries={deliveries}
                />
              )}

              {tab === "dashboard" && !canManageMasterData && (
                <StaffDashboard
                  products={products}
                  warehouses={warehouses}
                  movements={movements}
                />
              )}

              {tab === "history" && canManageMasterData && <ActivityList data={summary.recentActivity} />}

              {tab === "products" && canManageMasterData && (
                <ProductModule
                  products={products}
                  warehouses={warehouses}
                  onCreate={createProduct}
                  onUpdate={updateProduct}
                  loading={loading}
                  showCreateForm={false}
                  showProductTable
                />
              )}

              {tab === "add_product" && canManageMasterData && (
                <ProductModule
                  products={products}
                  warehouses={warehouses}
                  onCreate={createProduct}
                  onUpdate={updateProduct}
                  loading={loading}
                  showCreateForm
                  showProductTable={false}
                />
              )}

              {tab === "receipts" && canManageMasterData && (
                <MovementModule
                  title="Receiving Operations"
                  defaultType="receipt"
                  movements={receipts}
                  products={products}
                  warehouses={warehouses}
                  onCreate={createMovement}
                  onUpdateStatus={updateMovementStatus}
                  destinationNeeded
                />
              )}

              {tab === "delivery" && canManageMasterData && (
                <MovementModule
                  title="Delivery Scheduling"
                  defaultType="delivery"
                  movements={deliveries}
                  products={products}
                  warehouses={warehouses}
                  onCreate={createMovement}
                  onUpdateStatus={updateMovementStatus}
                  sourceNeeded
                />
              )}

              {tab === "transfers" && canUseTransfers && (
                <MovementModule
                  title="Internal Transfer"
                  defaultType="transfer"
                  movements={transfers}
                  products={products}
                  warehouses={warehouses}
                  onCreate={createMovement}
                  onUpdateStatus={updateMovementStatus}
                  sourceNeeded
                  destinationNeeded
                  sourceLabel="Transfer From"
                  destinationLabel="Transfer To"
                  supplierPlaceholder="Transfer Note"
                  submitLabel="Create Transfer"
                  workflowOverride="Search product → choose transfer-from warehouse (shows available stock) → choose transfer-to warehouse → enter quantity → create transfer."
                />
              )}

              {tab === "picking" && !canManageMasterData && (
                <MovementModule
                  title="Picking"
                  defaultType="delivery"
                  movements={deliveries}
                  products={products}
                  warehouses={warehouses}
                  onCreate={createMovement}
                  onUpdateStatus={updateMovementStatus}
                  sourceNeeded
                  sourceLabel="Pick From Warehouse"
                  supplierPlaceholder="Picking Reference"
                  submitLabel="Create Picking"
                  showSchedule={false}
                  requireSchedule={false}
                  workflowOverride="Search product → choose pick-from warehouse → verify available quantity → enter pick quantity → create picking order."
                />
              )}

              {tab === "shelving" && !canManageMasterData && (
                <MovementModule
                  title="Shelving"
                  defaultType="receipt"
                  movements={receipts}
                  products={products}
                  warehouses={warehouses}
                  onCreate={createMovement}
                  onUpdateStatus={updateMovementStatus}
                  destinationNeeded
                  destinationLabel="Shelve To Warehouse"
                  supplierPlaceholder="Shelving Reference"
                  submitLabel="Create Shelving"
                  workflowOverride="Search product → choose shelf destination warehouse → enter quantity to shelve → create shelving record."
                />
              )}

              {tab === "counting" && canUseAdjustments && (
                <MovementModule
                  title="Counting"
                  defaultType="adjustment"
                  movements={adjustments}
                  products={products}
                  warehouses={warehouses}
                  onCreate={createMovement}
                  onUpdateStatus={updateMovementStatus}
                  destinationNeeded
                  destinationLabel="Counted Warehouse"
                  supplierPlaceholder="Counting Note"
                  submitLabel="Save Count"
                  workflowOverride="Search product → choose counted warehouse → enter actual counted quantity → save count adjustment."
                />
              )}

              {tab === "warehouses" && canManageMasterData && (
                <WarehouseModule warehouses={warehouses} products={products} onCreate={createWarehouse} />
              )}

              {tab === "profile" && (
                <div className="glass rounded-xl p-5">
                  <h2 className="text-lg font-semibold">Profile & Settings</h2>
                  <p className="mt-2 text-sm text-slate-300">Manage your account details and password.</p>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-cyan-500/20 bg-slate-900/40 p-4 text-sm">
                      <p className="text-slate-400">Role</p>
                      <p className="font-medium text-cyan-200">{profile?.roleLabel || roleLabel}</p>
                      <p className="mt-3 text-slate-400">Status</p>
                      <p className="font-medium">{profile?.isActive ? "Active" : "Inactive"}</p>
                      <p className="mt-3 text-slate-400">Member since</p>
                      <p className="font-medium">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "-"}
                      </p>
                      <p className="mt-3 text-slate-400">Last updated</p>
                      <p className="font-medium">
                        {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "-"}
                      </p>
                    </div>

                    <div className="space-y-3 rounded-lg border border-cyan-500/20 bg-slate-900/40 p-4">
                      <Input
                        placeholder="Full name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                      <Input
                        type="password"
                        placeholder="Current password (required if changing password)"
                        value={profileForm.currentPassword}
                        onChange={(e) =>
                          setProfileForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                      />
                      <Input
                        type="password"
                        placeholder="New password (optional)"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      />

                      <Button onClick={updateProfile} disabled={profileSaving}>
                        {profileSaving ? "Saving..." : "Save Profile"}
                      </Button>

                      {profileMessage && <p className="text-sm text-emerald-300">{profileMessage}</p>}
                      {profileError && <p className="text-sm text-rose-300">{profileError}</p>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}