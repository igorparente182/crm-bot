"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } =
        mode === "signup"
          ? await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo:
                  typeof window !== "undefined"
                    ? `${window.location.origin}/dashboard`
                    : undefined,
              },
            })
          : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }
      if (mode === "signup") {
        setInfo(
          "Conta criada! Verifique seu e-mail para confirmar e depois entre."
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@empresa.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="mínimo 6 caracteres"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-[hsl(var(--danger)/0.1)] px-3 py-2 text-sm text-[hsl(var(--danger))]">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-lg bg-[hsl(var(--success)/0.1)] px-3 py-2 text-sm text-[hsl(var(--success))]">
          {info}
        </p>
      )}

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending
          ? "Aguarde..."
          : mode === "signup"
            ? "Criar conta"
            : "Entrar"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-[hsl(var(--primary))] hover:underline"
            >
              Entrar
            </Link>
          </>
        ) : (
          <>
            Novo aqui?{" "}
            <Link
              href="/login?mode=signup"
              className="font-medium text-[hsl(var(--primary))] hover:underline"
            >
              Criar conta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
