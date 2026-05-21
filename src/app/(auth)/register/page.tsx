"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  async function checkUsername(val: string) {
    if (val.length < 3) return;
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", val)
      .maybeSingle();
    setUsernameError(data ? "Brukernavnet er allerede tatt" : "");
  }

  function onUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(val);
    setUsernameError("");
    if (val.length >= 3) {
      const t = setTimeout(() => checkUsername(val), 500);
      return () => clearTimeout(t);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usernameError || username.length < 3) {
      setError("Velg et gyldig brukernavn (min 3 tegn, a-z 0-9 _)");
      return;
    }

    setLoading(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName || username },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="glass rounded-3xl p-6 space-y-5">
      <h2 className="text-xl font-semibold text-white/90">Opprett konto</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Brukernavn"
          value={username}
          onChange={onUsernameChange}
          placeholder="matelsker_bergen"
          error={usernameError}
          required
          autoComplete="username"
        />
        <Input
          label="Visningsnavn"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ditt navn"
        />
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
          placeholder="Min 6 tegn"
          required
          minLength={6}
          autoComplete="new-password"
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Opprett konto
        </Button>
      </form>

      <p className="text-center text-sm text-white/35">
        Har du allerede konto?{" "}
        <Link href="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
          Logg inn
        </Link>
      </p>
    </div>
  );
}
