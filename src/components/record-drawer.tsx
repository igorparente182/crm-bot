"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { X, StickyNote, Trash2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createNote, deleteNote } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

type Note = {
  id: string;
  body: string;
  created_at: string;
};

export function RecordDrawer({
  open,
  onClose,
  title,
  subtitle,
  fields,
  target,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: { label: string; value: ReactNode }[];
  target: {
    opportunity_id?: string;
    person_id?: string;
    company_id?: string;
  };
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const fetch = async () => {
      const supabase = createClient();
      let q = supabase
        .from("notes")
        .select("id,body,created_at")
        .order("created_at", { ascending: false });
      if (target.opportunity_id) q = q.eq("opportunity_id", target.opportunity_id);
      else if (target.person_id) q = q.eq("person_id", target.person_id);
      else if (target.company_id) q = q.eq("company_id", target.company_id);
      const { data } = await q;
      if (!cancelled) {
        setNotes((data ?? []) as Note[]);
        setLoading(false);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [open, target.opportunity_id, target.person_id, target.company_id]);

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBody("");
    const optimistic: Note = {
      id: `tmp-${Date.now()}`,
      body: text,
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [optimistic, ...prev]);
    startTransition(async () => {
      await createNote(text, target);
      const supabase = createClient();
      let q = supabase
        .from("notes")
        .select("id,body,created_at")
        .order("created_at", { ascending: false });
      if (target.opportunity_id) q = q.eq("opportunity_id", target.opportunity_id);
      else if (target.person_id) q = q.eq("person_id", target.person_id);
      else if (target.company_id) q = q.eq("company_id", target.company_id);
      const { data } = await q;
      setNotes((data ?? []) as Note[]);
    });
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => deleteNote(id));
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{title}</h2>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto">
          <section className="border-b border-border p-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detalhes
            </h3>
            <dl className="space-y-2">
              {fields.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[120px_1fr] gap-2 text-sm"
                >
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd>{f.value || <span className="text-muted-foreground">—</span>}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="p-6">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <StickyNote className="h-3 w-3" /> Notas
            </h3>
            {loading ? (
              <p className="text-xs text-muted-foreground">Carregando...</p>
            ) : notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma nota ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="group rounded-lg border border-border bg-background p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="whitespace-pre-wrap break-words">{n.body}</p>
                      <button
                        onClick={() => removeNote(n.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[hsl(var(--danger))]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("pt-BR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <form
          onSubmit={addNote}
          className="flex items-end gap-2 border-t border-border p-4"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva uma nota..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                addNote(e);
              }
            }}
          />
          <Button type="submit" variant="gradient" size="icon" disabled={!body.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </aside>
    </>
  );
}
