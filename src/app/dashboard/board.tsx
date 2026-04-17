"use client";

import { useState, useTransition } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCurrency, initials } from "@/lib/utils";
import {
  createOpportunity,
  deleteOpportunity,
  moveOpportunity,
} from "./actions";
import type { Stage, Opportunity, Person, Company } from "./page";

export function Board({
  stages,
  opportunities: initial,
  people,
  companies,
}: {
  stages: Stage[];
  opportunities: Opportunity[];
  people: Person[];
  companies: Company[];
}) {
  const [items, setItems] = useState(initial);
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const peopleById = new Map(people.map((p) => [p.id, p.name]));
  const companiesById = new Map(companies.map((c) => [c.id, c.name]));

  function onDragEnd(r: DropResult) {
    if (!r.destination) return;
    const newStage = r.destination.droppableId;
    setItems((p) =>
      p.map((d) => (d.id === r.draggableId ? { ...d, stage_id: newStage } : d))
    );
    startTransition(() => moveOpportunity(r.draggableId, newStage));
  }

  function onDelete(id: string) {
    setItems((p) => p.filter((d) => d.id !== id));
    startTransition(() => deleteOpportunity(id));
  }

  if (stages.length === 0) {
    return (
      <div className="grid flex-1 place-items-center p-10 text-center">
        <p className="text-muted-foreground">
          Nenhuma etapa configurada. Rode a migration do Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} oportunidades ·{" "}
            {formatCurrency(items.reduce((s, d) => s + (d.value ?? 0), 0))} no
            funil
          </p>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="scrollbar-thin flex flex-1 gap-4 overflow-x-auto p-6">
          {stages.map((stage) => {
            const cards = items.filter((d) => d.stage_id === stage.id);
            const total = cards.reduce((s, d) => s + (d.value ?? 0), 0);
            return (
              <div
                key={stage.id}
                className="flex w-80 shrink-0 flex-col rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: stage.color }}
                    />
                    <h3 className="text-sm font-semibold">{stage.name}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {cards.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setOpenStage(stage.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  {formatCurrency(total)}
                </div>
                <Droppable droppableId={stage.id}>
                  {(p, s) => (
                    <div
                      ref={p.innerRef}
                      {...p.droppableProps}
                      className={`flex-1 min-h-[120px] space-y-2 px-3 pb-3 transition-colors ${
                        s.isDraggingOver ? "bg-muted/40" : ""
                      }`}
                    >
                      {cards.map((deal, idx) => {
                        const personName = deal.person_id
                          ? peopleById.get(deal.person_id)
                          : deal.contact_name;
                        const companyName = deal.company_id
                          ? companiesById.get(deal.company_id)
                          : null;
                        return (
                          <Draggable
                            key={deal.id}
                            draggableId={deal.id}
                            index={idx}
                          >
                            {(p2, s2) => (
                              <div
                                ref={p2.innerRef}
                                {...p2.draggableProps}
                                {...p2.dragHandleProps}
                                className={`group rounded-xl border border-border bg-background p-3 shadow-sm transition-all ${
                                  s2.isDragging
                                    ? "rotate-1 shadow-lg ring-2 ring-primary/30"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-medium leading-snug">
                                    {deal.title}
                                  </h4>
                                  <button
                                    onClick={() => onDelete(deal.id)}
                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[hsl(var(--danger))]"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                {deal.value > 0 && (
                                  <p className="mt-1 text-sm font-semibold text-[hsl(var(--success))]">
                                    {formatCurrency(deal.value)}
                                  </p>
                                )}
                                {(personName || companyName) && (
                                  <div className="mt-3 flex items-center gap-2">
                                    {personName && (
                                      <>
                                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-[10px] font-semibold text-white">
                                          {initials(personName)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {personName}
                                        </span>
                                      </>
                                    )}
                                    {companyName && (
                                      <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                        {companyName}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {p.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {openStage && (
        <NewOpportunityModal
          stageId={openStage}
          stageName={stages.find((s) => s.id === openStage)?.name ?? ""}
          people={people}
          companies={companies}
          onClose={() => setOpenStage(null)}
        />
      )}
    </div>
  );
}

function NewOpportunityModal({
  stageId,
  stageName,
  people,
  companies,
  onClose,
}: {
  stageId: string;
  stageName: string;
  people: Person[];
  companies: Company[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("stage_id", stageId);
    startTransition(async () => {
      await createOpportunity(fd);
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
          <h2 className="text-lg font-semibold">
            Nova oportunidade em {stageName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" name="title" required placeholder="Plano Pro" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              name="value"
              type="number"
              min={0}
              step="0.01"
              placeholder="0,00"
            />
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
