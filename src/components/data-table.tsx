"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  searchable?: boolean;
};

export function DataTable<T extends { id: string }>({
  title,
  rows,
  columns,
  onDelete,
  newAction,
  newForm,
  onRowClick,
  emptyText = "Nenhum registro ainda.",
}: {
  title: string;
  rows: T[];
  columns: Column<T>[];
  onDelete: (id: string) => Promise<void>;
  newAction: (fd: FormData) => Promise<void>;
  newForm: ReactNode;
  onRowClick?: (row: T) => void;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pendingDel, setPendingDel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [, startTransition] = useTransition();

  const searchableKeys = columns
    .filter((c) => c.searchable !== false)
    .map((c) => String(c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = out.filter((r) =>
        searchableKeys.some((k) => {
          const v = (r as Record<string, unknown>)[k];
          return typeof v === "string" && v.toLowerCase().includes(q);
        })
      );
    }
    if (sort) {
      const { key, dir } = sort;
      out = [...out].sort((a, b) => {
        const av = (a as Record<string, unknown>)[key];
        const bv = (b as Record<string, unknown>)[key];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === "number" && typeof bv === "number")
          return dir === "asc" ? av - bv : bv - av;
        const as = String(av).toLowerCase();
        const bs = String(bv).toLowerCase();
        return dir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
      });
    }
    return out;
  }, [rows, query, sort, searchableKeys]);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function handleDelete(id: string) {
    setPendingDel(id);
    startTransition(async () => {
      await onDelete(id);
      setPendingDel(null);
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {rows.length} registro{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="gradient" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </header>

      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {sort && (
            <button
              onClick={() => setSort(null)}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Limpar ordenação
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum resultado para &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {columns.map((c) => {
                    const k = String(c.key);
                    const isSorted = sort?.key === k;
                    const sortable = c.sortable !== false;
                    return (
                      <th
                        key={k}
                        className={`px-4 py-2.5 font-medium ${c.className ?? ""}`}
                      >
                        {sortable ? (
                          <button
                            onClick={() => toggleSort(k)}
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            {c.header}
                            {isSorted ? (
                              sort?.dir === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          c.header
                        )}
                      </th>
                    );
                  })}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={`group border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${
                      onRowClick ? "cursor-pointer" : ""
                    }`}
                  >
                    {columns.map((c) => (
                      <td
                        key={String(c.key)}
                        className={`px-4 py-3 ${c.className ?? ""}`}
                      >
                        {c.render
                          ? c.render(row)
                          : String((row as Record<string, unknown>)[c.key as string] ?? "—")}
                      </td>
                    ))}
                    <td className="pr-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row.id);
                        }}
                        disabled={pendingDel === row.id}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[hsl(var(--danger))] disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <NewModal
          title={`Novo registro em ${title}`}
          action={newAction}
          onClose={() => setOpen(false)}
        >
          {newForm}
        </NewModal>
      )}
    </div>
  );
}

function NewModal({
  title,
  action,
  onClose,
  children,
}: {
  title: string;
  action: (fd: FormData) => Promise<void>;
  onClose: () => void;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(fd);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-2xl bg-card p-6 shadow-xl border border-border animate-fade-up"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="gradient" disabled={pending}>
            {pending ? "Salvando..." : "Criar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
