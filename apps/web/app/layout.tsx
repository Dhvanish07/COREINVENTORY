import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreInventory",
  description: "Smart inventory management for modern warehouses."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}