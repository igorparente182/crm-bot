"use client";

import { useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createContact, deleteContact } from "../actions";

export function ContactsForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createContact(fd);
      ref.current?.reset();
    });
  }

  return (
    <form ref={ref} onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" name="name" required placeholder="Nome completo" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" placeholder="email@..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="company">Empresa</Label>
        <Input id="company" name="company" placeholder="Empresa" />
      </div>
      <Button
        type="submit"
        variant="gradient"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Salvando..." : "Adicionar contato"}
      </Button>
    </form>
  );
}

export function DeleteContactButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteContact(id))}
      disabled={pending}
      className="text-muted-foreground hover:text-[hsl(var(--danger))] disabled:opacity-50"
      title="Excluir"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
