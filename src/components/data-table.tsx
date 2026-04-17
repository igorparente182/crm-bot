"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  title,
  rows,
  columns,
  onDelete,
  newAction,
  newForm,
  emptyText = "Nenhum registro ainda.",
}: {
  title: string;
  rows: T[];
  columns: Column<T>[];
  onDelete: (id: string) => Promise<void>;
  newAction: (fd: FormData) => Promise<void>;
  newForm: ReactNode;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pendingDel, setPendingDel] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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
            {rows.length} registro{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button variant="gradient" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo
        </Button>
      </header>

      <div className="flex-1 p-6">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={String(c.key)}
                      className={`px-4 py-2.5 font-medium ${c.className ?? ""}`}
                    >
                      {c.header}
                    </th>
                  ))}
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-border last:border-0 transition-colors hover:bg-muted/30"
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
                        onClick={() => handleDelete(row.id)}
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
