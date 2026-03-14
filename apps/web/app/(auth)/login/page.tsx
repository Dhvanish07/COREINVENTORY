"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<{ token: string }>("/auth/login", "POST", {
        email: normalizedEmail,
        password
      });
      authStorage.setToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error && /fetch|network|failed to fetch/i.test(err.message)) {
        setError("Cannot reach API server. Please start backend and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to CoreInventory</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "Please wait..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-slate-300">
          <Link href="/signup">Create account</Link>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
      </CardContent>
    </Card>
  );
}