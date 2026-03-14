import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 py-10">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-slate-400">© {new Date().getFullYear()} CoreInventory</p>
        <div className="flex gap-4 text-sm text-slate-300">
          <Link href="#">About</Link>
          <Link href="#">Contact</Link>
          <Link href="/login">Login</Link>
          <Link href="#">Documentation</Link>
        </div>
      </div>
    </footer>
  );
}