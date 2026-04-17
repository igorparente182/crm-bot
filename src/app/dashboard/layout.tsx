import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Sparkles,
  KanbanSquare,
  Users,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";

  return (
    <div className="flex min-h-screen flex-1 bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-5 font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          CRM Bot
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <KanbanSquare className="h-4 w-4" /> Pipeline
          </Link>
          <Link
            href="/dashboard/contacts"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Users className="h-4 w-4" /> Contatos
          </Link>
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-xs font-semibold text-white">
              {initials(email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                title="Sair"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
