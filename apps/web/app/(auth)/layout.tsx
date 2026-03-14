export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid-pattern">
      <div className="container flex min-h-screen items-center justify-center py-10">{children}</div>
    </main>
  );
}