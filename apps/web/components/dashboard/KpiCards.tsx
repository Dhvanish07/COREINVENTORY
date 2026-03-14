import { Card, CardContent } from "@/components/ui/card";

export function KpiCards({
  kpis
}: {
  kpis: {
    totalProductsInStock: number;
    lowStockItems: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    internalTransfersScheduled: number;
  };
}) {
  const list = [
    ["Total Products in Stock", kpis.totalProductsInStock],
    ["Low Stock Items", kpis.lowStockItems],
    ["Pending Receipts", kpis.pendingReceipts],
    ["Pending Deliveries", kpis.pendingDeliveries],
    ["Internal Transfers Scheduled", kpis.internalTransfersScheduled]
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {list.map(([label, value]) => (
        <Card key={String(label)}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">{String(label)}</p>
            <p className="mt-1 text-2xl font-semibold">{String(value)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}