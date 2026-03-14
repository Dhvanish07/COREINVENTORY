import { Card } from "@/components/ui/card";

export function DashboardPreview() {
  return (
    <section className="container py-20">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">Single-view operations dashboard</h2>
        <p className="mt-2 text-slate-300">KPI cards, inventory charts, stock tables, and warehouse stats.</p>
      </div>
      <Card className="overflow-hidden p-4">
        <div className="grid gap-3 md:grid-cols-4">
          {["Products", "Low Stock", "Receipts", "Deliveries"].map((kpi) => (
            <div key={kpi} className="rounded-lg border border-cyan-400/20 bg-slate-950/60 p-3">
              <p className="text-xs text-slate-400">{kpi}</p>
              <p className="mt-1 text-2xl font-semibold">{Math.floor(Math.random() * 900 + 100)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg border border-cyan-500/20 bg-slate-950/70 p-4">
            <div className="h-40 rounded-md bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20" />
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-slate-950/70 p-4">
            <div className="h-40 rounded-md bg-slate-900/80 grid-pattern" />
          </div>
        </div>
      </Card>
    </section>
  );
}