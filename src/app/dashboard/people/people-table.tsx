"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { RecordDrawer } from "@/components/record-drawer";
import { Input, Label } from "@/components/ui/input";
import { initials } from "@/lib/utils";
import { createPerson, deletePerson } from "../actions";
import type { Person, CompanyOpt } from "./page";

export function PeopleTable({
  rows,
  companies,
}: {
  rows: Person[];
  companies: CompanyOpt[];
}) {
  const compById = new Map(companies.map((c) => [c.id, c.name]));
  const [active, setActive] = useState<Person | null>(null);
  return (
    <>
    <DataTable<Person>
      onRowClick={(r) => setActive(r)}
      title="People"
      rows={rows}
      onDelete={deletePerson}
      newAction={createPerson}
      emptyText="Nenhuma pessoa cadastrada."
      columns={[
        {
          key: "name",
          header: "Nome",
          render: (r) => (
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-[10px] font-semibold text-white">
                {initials(r.name)}
              </span>
              <div>
                <p className="font-medium">{r.name}</p>
                {r.job_title && (
                  <p className="text-xs text-muted-foreground">{r.job_title}</p>
                )}
              </div>
            </div>
          ),
        },
        {
          key: "company_id",
          header: "Empresa",
          render: (r) =>
            r.company_id ? (
              compById.get(r.company_id) ?? "—"
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "email",
          header: "E-mail",
          render: (r) =>
            r.email ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3 w-3" /> {r.email}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "phone",
          header: "Telefone",
          render: (r) =>
            r.phone ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" /> {r.phone}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
      ]}
      newForm={
        <>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" required placeholder="Nome completo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="job_title">Cargo</Label>
              <Input id="job_title" name="job_title" placeholder="CEO" />
            </div>
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
          </div>
        </>
      }
    />
    {active && (
      <RecordDrawer
        open={!!active}
        onClose={() => setActive(null)}
        title={active.name}
        subtitle={active.job_title ?? undefined}
        target={{ person_id: active.id }}
        fields={[
          { label: "Cargo", value: active.job_title },
          {
            label: "Empresa",
            value: active.company_id ? compById.get(active.company_id) : "",
          },
          { label: "E-mail", value: active.email },
          { label: "Telefone", value: active.phone },
        ]}
      />
    )}
    </>
  );
}
