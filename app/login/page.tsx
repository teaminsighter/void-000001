"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--void-bg)" }}
    >
      <div
        className="w-full max-w-sm"
        style={{ padding: 32 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center" style={{ marginBottom: 32 }}>
          <div
            className="flex items-center justify-center text-lg font-bold text-white"
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              marginBottom: 16,
            }}
          >
            V
          </div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--void-white)" }}
          >
            Void
          </h1>
          <p
            style={{ fontSize: 13, color: "var(--void-muted)", marginTop: 4 }}
          >
            Enter password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-lg"
            style={{
              padding: "12px 16px",
              background: "var(--void-surface)",
              border: "1px solid var(--void-border)",
              color: "var(--void-text)",
              fontSize: 14,
              outline: "none",
              marginBottom: 12,
            }}
          />

          {error && (
            <div
              style={{
                fontSize: 12,
                color: "#ef4444",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg font-semibold transition-colors"
            style={{
              padding: "12px 16px",
              background: loading ? "#92400e" : "#f59e0b",
              color: "#0c0d10",
              fontSize: 14,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: !password ? 0.5 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
