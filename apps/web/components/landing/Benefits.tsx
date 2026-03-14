import { Bolt, ChartNoAxesCombined, ShieldCheck, Timer } from "lucide-react";

const benefits = [
  { icon: ShieldCheck, label: "Reduce stock errors" },
  { icon: Timer, label: "Faster warehouse operations" },
  { icon: ChartNoAxesCombined, label: "Real-time analytics" },
  { icon: Bolt, label: "Automated stock tracking" }
];

export function Benefits() {
  return (
    <section className="container py-20">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((item) => (
          <div key={item.label} className="glass rounded-xl p-4">
            <item.icon className="mb-2 h-5 w-5 text-cyan-300" />
            <p className="text-sm text-slate-200">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}