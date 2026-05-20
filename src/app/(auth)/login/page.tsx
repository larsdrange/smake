"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/feed";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Velkommen tilbake</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-post"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deg@eksempel.no"
          required
          autoComplete="email"
        />
        <Input
          label="Passord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Logg inn
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Ingen konto?{" "}
        <Link href="/register" className="text-brand-600 font-medium hover:underline">
          Registrer deg her
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white rounded-2xl p-6 h-64 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
