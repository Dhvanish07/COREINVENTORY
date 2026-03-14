"use client";

import { motion } from "framer-motion";
import { ArrowRight, Boxes, Truck, Warehouse } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-cyan-500/20 grid-pattern">
      <div className="container py-24 md:py-32">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-1 text-xs text-cyan-200">
              SaaS Inventory Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Smart Inventory Management for Modern Warehouses.
            </h1>
            <p className="max-w-xl text-slate-300 text-lg">
              Track stock, automate operations, and manage warehouses in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <Card className="p-4">
              <CardContent className="space-y-4 p-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Warehouse, label: "Warehouses", value: "12" },
                    { icon: Boxes, label: "SKUs", value: "4,280" },
                    { icon: Truck, label: "Movements", value: "1,120" }
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-cyan-400/20 bg-slate-900/50 p-3">
                      <item.icon className="mb-2 h-4 w-4 text-cyan-300" />
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="text-xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-cyan-400/20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4">
                  <p className="text-sm text-slate-200">Live Dashboard Preview</p>
                  <div className="mt-3 h-36 rounded-md bg-slate-950/60 grid-pattern animate-float" />
                </div>
              </CardContent>
            </Card>
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/25 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-blue-500/25 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}