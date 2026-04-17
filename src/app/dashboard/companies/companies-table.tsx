"use client";

import { Building2, Globe } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Input, Label } from "@/components/ui/input";
import { initials } from "@/lib/utils";
import { createCompany, deleteCompany } from "../actions";
import type { Company } from "./page";

export function CompaniesTable({ rows }: { rows: Company[] }) {
  return (
    <DataTable<Company>
      title="Companies"
      rows={rows}
      onDelete={deleteCompany}
      newAction={createCompany}
      emptyText="Nenhuma empresa cadastrada. Crie a primeira."
      columns={[
        {
          key: "name",
          header: "Empresa",
          render: (r) => (
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-[linear-gradient(135deg,hsl(var(--primary)/0.2),hsl(var(--accent)/0.2))] text-xs font-semibold text-[hsl(var(--primary))]">
                {initials(r.name) || <Building2 className="h-4 w-4" />}
              </span>
              <span className="font-medium">{r.name}</span>
            </div>
          ),
        },
        {
          key: "domain",
          header: "Domínio",
          render: (r) =>
            r.domain ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Globe className="h-3 w-3" /> {r.domain}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "industry",
          header: "Setor",
          render: (r) => r.industry ?? <span className="text-muted-foreground">—</span>,
        },
        {
          key: "city",
          header: "Cidade",
          render: (r) => r.city ?? <span className="text-muted-foreground">—</span>,
        },
        {
          key: "employees",
          header: "Funcionários",
          render: (r) =>
            r.employees ? (
              <span>{r.employees}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
      ]}
      newForm={
        <>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" required placeholder="Acme Inc" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="domain">Domínio</Label>
              <Input id="domain" name="domain" placeholder="acme.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Setor</Label>
              <Input id="industry" name="industry" placeholder="SaaS" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" placeholder="São Paulo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employees">Funcionários</Label>
              <Input id="employees" name="employees" type="number" min={0} />
            </div>
          </div>
        </>
      }
    />
  );
}
