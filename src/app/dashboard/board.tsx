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
import { createDeal, deleteDeal, moveDeal } from "./actions";
import type { Stage, Deal } from "./page";

export function Board({
  stages,
  deals: initialDeals,
}: {
  stages: Stage[];
  deals: Deal[];
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [open, setOpen] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function onDragEnd(r: DropResult) {
    if (!r.destination) return;
    const { draggableId } = r;
    const newStage = r.destination.droppableId;
    setDeals((prev) =>
      prev.map((d) => (d.id === draggableId ? { ...d, stage_id: newStage } : d))
    );
    startTransition(() => moveDeal(draggableId, newStage));
  }

  function onDelete(id: string) {
    setDeals((p) => p.filter((d) => d.id !== id));
    startTransition(() => deleteDeal(id));
  }

  const totalsByStage = stages.reduce<Record<string, number>>((acc, s) => {
    acc[s.id] = deals
      .filter((d) => d.stage_id === s.id)
      .reduce((sum, d) => sum + (d.value ?? 0), 0);
    return acc;
  }, {});

  if (stages.length === 0) {
    return (
      <div className="grid flex-1 place-items-center p-10 text-center">
        <div>
          <h1 className="text-xl font-semibold">Nenhuma etapa configurada</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rode a migration do Supabase para criar as etapas iniciais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} negócios ·{" "}
            {formatCurrency(deals.reduce((s, d) => s + (d.value ?? 0), 0))} no
            funil
          </p>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="scrollbar-thin flex flex-1 gap-4 overflow-x-auto p-6">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage_id === stage.id);
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
                      {stageDeals.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setOpen(stage.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-4 py-2 text-xs text-muted-foreground">
                  {formatCurrency(totalsByStage[stage.id] ?? 0)}
                </div>
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[120px] space-y-2 px-3 pb-3 transition-colors ${
                        snapshot.isDraggingOver ? "bg-muted/40" : ""
                      }`}
                    >
                      {stageDeals.map((deal, idx) => (
                        <Draggable
                          key={deal.id}
                          draggableId={deal.id}
                          index={idx}
                        >
                          {(p, s) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className={`group rounded-xl border border-border bg-background p-3 shadow-sm transition-all ${
                                s.isDragging
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
                              {deal.contact_name && (
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-[10px] font-semibold text-white">
                                    {initials(deal.contact_name)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {deal.contact_name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {open && (
        <NewDealModal
          stageId={open}
          stageName={stages.find((s) => s.id === open)?.name ?? ""}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function NewDealModal({
  stageId,
  stageName,
  onClose,
}: {
  stageId: string;
  stageName: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("stage_id", stageId);
    startTransition(async () => {
      await createDeal(fd);
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
          <h2 className="text-lg font-semibold">Novo negócio em {stageName}</h2>
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
          <Input id="title" name="title" required placeholder="Ex: Plano Pro" />
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
            <Label htmlFor="contact_name">Contato</Label>
            <Input id="contact_name" name="contact_name" placeholder="Nome" />
          </div>
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
