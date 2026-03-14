"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { authStorage } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      setError("Please fill name, email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<{ token: string }>("/auth/signup", "POST", {
        name: normalizedName,
        email: normalizedEmail,
        password
      });
      authStorage.setToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error && /fetch|network|failed to fetch/i.test(err.message)) {
        setError("Cannot reach API server. Please start backend and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create CoreInventory account</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </CardContent>
    </Card>
  );
}