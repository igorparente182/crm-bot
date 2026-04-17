import { Mail, Phone, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";
import { ContactsForm, DeleteContactButton } from "./contacts-client";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
};

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  const contacts = (data ?? []) as Contact[];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-8 py-5">
        <h1 className="text-2xl font-bold">Contatos</h1>
        <p className="text-sm text-muted-foreground">
          {contacts.length} contato{contacts.length === 1 ? "" : "s"} cadastrado
          {contacts.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="grid flex-1 gap-6 p-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Nenhum contato ainda. Crie o primeiro ao lado.
            </div>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-sm font-semibold text-white">
                  {initials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {c.company && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {c.company}
                      </span>
                    )}
                    {c.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {c.email}
                      </span>
                    )}
                    {c.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </span>
                    )}
                  </div>
                </div>
                <DeleteContactButton id={c.id} />
              </div>
            ))
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Novo contato</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cadastre rapidamente para vincular a negócios.
          </p>
          <div className="mt-4">
            <ContactsForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
