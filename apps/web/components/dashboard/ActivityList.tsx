import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityList({
  data
}: {
  data: Array<{ _id: string; action: string; entityType: string; createdAt: string; user?: { name: string } }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
          {data.map((item) => (
            <div key={item._id} className="rounded-lg border border-cyan-500/20 p-3 text-sm">
              <p className="font-medium text-slate-100">{item.action}</p>
              <p className="text-xs text-slate-400">
                {item.entityType} • {new Date(item.createdAt).toLocaleString()} • {item.user?.name || "System"}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}