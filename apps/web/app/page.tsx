import { Benefits } from "@/components/landing/Benefits";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <DashboardPreview />
      <Benefits />
      <Footer />
    </main>
  );
}