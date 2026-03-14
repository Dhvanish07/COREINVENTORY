"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest<{ message: string; sentTo?: string }>("/auth/forgot-password", "POST", { email });
      setMessage(data.message);
      setSentTo(data.sentTo || "");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiRequest<{ message: string }>("/auth/reset-password", "POST", {
        email,
        otp,
        newPassword
      });
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot Password (OTP reset)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {step === 1 ? (
          <Button className="w-full" onClick={requestOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        ) : (
          <>
            <Input placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button className="w-full" onClick={resetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </>
        )}
        {sentTo && <p className="text-xs text-cyan-300">OTP email sent to: {sentTo}</p>}
        {message && <p className="text-sm text-slate-300">{message}</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <p className="text-sm text-slate-300">
          Back to <Link href="/login">Login</Link>
        </p>
      </CardContent>
    </Card>
  );
}