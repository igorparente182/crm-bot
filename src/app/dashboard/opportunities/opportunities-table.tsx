"use client";

import { DataTable } from "@/components/data-table";
import { Input, Label } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { createOpportunity, deleteOpportunity } from "../actions";
import type { Opportunity, Stage, Lookup } from "./page";

export function OpportunitiesTable({
  rows,
  stages,
  people,
  companies,
}: {
  rows: Opportunity[];
  stages: Stage[];
  people: Lookup[];
  companies: Lookup[];
}) {
  const stageById = new Map(stages.map((s) => [s.id, s]));
  const peopleById = new Map(people.map((p) => [p.id, p.name]));
  const compById = new Map(companies.map((c) => [c.id, c.name]));

  return (
    <DataTable<Opportunity>
      title="Opportunities"
      rows={rows}
      onDelete={deleteOpportunity}
      newAction={createOpportunity}
      emptyText="Nenhuma oportunidade. Crie pelo Pipeline ou aqui."
      columns={[
        { key: "title", header: "Título", render: (r) => <span className="font-medium">{r.title}</span> },
        {
          key: "value",
          header: "Valor",
          render: (r) =>
            r.value > 0 ? (
              <span className="font-semibold text-[hsl(var(--success))]">
                {formatCurrency(r.value)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "stage_id",
          header: "Etapa",
          render: (r) => {
            const s = stageById.get(r.stage_id);
            if (!s) return <span className="text-muted-foreground">—</span>;
            return (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
            );
          },
        },
        {
          key: "company_id",
          header: "Empresa",
          render: (r) =>
            r.company_id ? compById.get(r.company_id) ?? "—" : <span className="text-muted-foreground">—</span>,
        },
        {
          key: "person_id",
          header: "Contato",
          render: (r) => {
            const name = r.person_id ? peopleById.get(r.person_id) : r.contact_name;
            return name ?? <span className="text-muted-foreground">—</span>;
          },
        },
      ]}
      newForm={
        <>
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required placeholder="Plano Pro" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input id="value" name="value" type="number" min={0} step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stage_id">Etapa *</Label>
              <select
                id="stage_id"
                name="stage_id"
                required
                defaultValue={stages[0]?.id ?? ""}
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company_id">Empresa</Label>
              <select
                id="company_id"
                name="company_id"
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                <option value="">—</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="person_id">Contato</Label>
              <select
                id="person_id"
                name="person_id"
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                <option value="">—</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      }
    />
  );
}
