"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  ClipboardList,
  MoveRight,
  PackageSearch,
  ScanSearch,
  Warehouse
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const featureList = [
  { title: "Product Management", icon: Boxes },
  { title: "Real-Time Stock Tracking", icon: ScanSearch },
  { title: "Multi-Warehouse Support", icon: Warehouse },
  { title: "Smart Inventory Transfers", icon: MoveRight },
  { title: "Low Stock Alerts", icon: PackageSearch },
  { title: "Complete Stock Ledger", icon: ClipboardList }
];

export function Features() {
  return (
    <section id="features" className="container py-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold">Features built for modern operations</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featureList.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full transition hover:-translate-y-1 hover:border-cyan-300/30">
              <CardHeader>
                <feature.icon className="h-5 w-5 text-cyan-300" />
                <CardTitle className="pt-2 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Automate your stock workflows and eliminate spreadsheet complexity.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}