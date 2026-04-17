import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Sparkles,
  KanbanSquare,
  Users,
  Building2,
  Briefcase,
  CheckSquare,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Pipeline", icon: KanbanSquare },
  { href: "/dashboard/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/dashboard/companies", label: "Companies", icon: Building2 },
  { href: "/dashboard/people", label: "People", icon: Users },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const email = user.email ?? "";

  return (
    <div className="flex min-h-screen flex-1 bg-muted/30">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-5 py-5 font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          CRM Bot
        </Link>
        <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-[10px] font-semibold text-white">
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
