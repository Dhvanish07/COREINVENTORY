import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions({ onSeed, onExport }: { onSeed: () => void; onExport: (kind: "csv" | "pdf") => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onSeed}>Load Dummy Data</Button>
        <Button variant="outline" onClick={() => onExport("csv")}>Export CSV</Button>
        <Button variant="outline" onClick={() => onExport("pdf")}>Export PDF</Button>
      </CardContent>
    </Card>
  );
}