"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  KanbanSquare,
  Briefcase,
  Building2,
  Users,
  CheckSquare,
  Search,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Hit =
  | { type: "opportunity"; id: string; label: string }
  | { type: "person"; id: string; label: string }
  | { type: "company"; id: string; label: string };

export function CommandTrigger() {
  function open() {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    );
  }
  return (
    <button
      onClick={open}
      className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">Buscar...</span>
      <kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
    </button>
  );
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const [opps, people, companies] = await Promise.all([
        supabase.from("opportunities").select("id,title").ilike("title", `%${q}%`).limit(5),
        supabase.from("people").select("id,name").ilike("name", `%${q}%`).limit(5),
        supabase.from("companies").select("id,name").ilike("name", `%${q}%`).limit(5),
      ]);
      if (cancelled) return;
      const next: Hit[] = [
        ...(opps.data ?? []).map((r) => ({ type: "opportunity" as const, id: r.id, label: r.title })),
        ...(people.data ?? []).map((r) => ({ type: "person" as const, id: r.id, label: r.name })),
        ...(companies.data ?? []).map((r) => ({ type: "company" as const, id: r.id, label: r.name })),
      ];
      setHits(next);
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
        label="Command Palette"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar oportunidades, pessoas, empresas... ou navegar"
            className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>
        <Command.List className="scrollbar-thin max-h-96 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            Sem resultados.
          </Command.Empty>

          {hits.length > 0 && (
            <Command.Group heading="Registros" className="text-xs">
              {hits.map((h) => (
                <Command.Item
                  key={`${h.type}-${h.id}`}
                  value={`${h.type}-${h.label}`}
                  onSelect={() =>
                    go(
                      h.type === "opportunity"
                        ? "/dashboard/opportunities"
                        : h.type === "person"
                          ? "/dashboard/people"
                          : "/dashboard/companies"
                    )
                  }
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-muted"
                >
                  {h.type === "opportunity" && <Briefcase className="h-4 w-4 text-muted-foreground" />}
                  {h.type === "person" && <Users className="h-4 w-4 text-muted-foreground" />}
                  {h.type === "company" && <Building2 className="h-4 w-4 text-muted-foreground" />}
                  <span className="flex-1 truncate">{h.label}</span>
                  <span className="text-xs text-muted-foreground">{h.type}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Ir para" className="text-xs">
            {[
              { href: "/dashboard", label: "Pipeline", icon: KanbanSquare },
              { href: "/dashboard/opportunities", label: "Opportunities", icon: Briefcase },
              { href: "/dashboard/companies", label: "Companies", icon: Building2 },
              { href: "/dashboard/people", label: "People", icon: Users },
              { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
            ].map((n) => (
              <Command.Item
                key={n.href}
                value={`go-${n.label}`}
                onSelect={() => go(n.href)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-muted"
              >
                <n.icon className="h-4 w-4 text-muted-foreground" />
                {n.label}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Conta" className="text-xs">
            <Command.Item
              value="signout"
              onSelect={() => {
                setOpen(false);
                fetch("/auth/signout", { method: "POST" }).then(() =>
                  (window.location.href = "/login")
                );
              }}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-[hsl(var(--danger))] aria-selected:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sair
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
          <span>
            <kbd className="rounded bg-muted px-1 font-mono">↑↓</kbd> navegar ·{" "}
            <kbd className="rounded bg-muted px-1 font-mono">↵</kbd> selecionar
          </span>
          <span>
            <kbd className="rounded bg-muted px-1 font-mono">⌘K</kbd> abrir
          </span>
        </div>
      </Command>
    </div>
  );
}
