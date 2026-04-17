"use client";

import { useRef, useTransition } from "react";
import { Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, deleteTask, toggleTask } from "../actions";
import type { Task } from "./page";

export function TasksList({ rows }: { rows: Task[] }) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createTask(fd);
      ref.current?.reset();
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-8 py-5">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          {rows.filter((r) => !r.done).length} abertas · {rows.filter((r) => r.done).length} concluídas
        </p>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 p-6">
        <form ref={ref} onSubmit={onSubmit} className="mb-6 flex gap-2">
          <Input name="title" required placeholder="Nova tarefa..." className="flex-1" />
          <Input name="due_date" type="date" className="w-40" />
          <Button type="submit" variant="gradient" disabled={pending}>
            Adicionar
          </Button>
        </form>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma tarefa. Comece criando uma acima.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [, startTransition] = useTransition();
  return (
    <li
      className={`group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-sm ${
        task.done ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => startTransition(() => toggleTask(task.id, e.target.checked))}
        className="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]"
      />
      <span className={`flex-1 text-sm ${task.done ? "line-through" : ""}`}>
        {task.title}
      </span>
      {task.due_date && (
        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(task.due_date).toLocaleDateString("pt-BR")}
        </span>
      )}
      <button
        onClick={() => startTransition(() => deleteTask(task.id))}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[hsl(var(--danger))]"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
