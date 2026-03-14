"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrendChart({
  data
}: {
  data: Array<{ date: string; receipt: number; delivery: number; transfer: number; adjustment: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Charts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="receipt" stroke="#22d3ee" strokeWidth={2} />
              <Line type="monotone" dataKey="delivery" stroke="#60a5fa" strokeWidth={2} />
              <Line type="monotone" dataKey="transfer" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}