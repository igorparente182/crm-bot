import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  KanbanSquare,
  MessageSquare,
  Bot,
  TrendingUp,
  Inbox,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: KanbanSquare,
    title: "Pipeline visual",
    desc: "Funil Kanban com drag-and-drop, etapas customizáveis e visão clara de cada negócio.",
  },
  {
    icon: Bot,
    title: "IA copilot nativa",
    desc: "Score de leads, próxima melhor ação e respostas geradas em todas as telas.",
  },
  {
    icon: Inbox,
    title: "Inbox omnichannel",
    desc: "WhatsApp, Instagram, e-mail e chat unificados com contexto completo do cliente.",
  },
  {
    icon: MessageSquare,
    title: "Social selling",
    desc: "Capte, responda e nutra leads de redes sociais sem sair da plataforma.",
  },
  {
    icon: TrendingUp,
    title: "Análise em linguagem natural",
    desc: "Pergunte 'por que minhas vendas caíram?' e receba a resposta com gráficos.",
  },
  {
    icon: Zap,
    title: "Automações prontas",
    desc: "Follow-up automático, distribuição de leads e pós-venda configurados em minutos.",
  },
];

export default function Home() {
  return (
    <div className="gradient-bg flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>CRM Bot</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/login?mode=signup">
            <Button variant="gradient" size="sm">
              Criar conta
            </Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-[hsl(var(--accent))]" /> IA copilot
          em todas as telas
        </span>
        <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
          Um CRM que <span className="gradient-text">pensa, responde</span>
          <br /> e vende junto com você
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Pipeline visual, atendimento omnichannel e IA nativa para sua equipe
          comercial responder mais rápido, priorizar melhor e fechar mais.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/login?mode=signup">
            <Button variant="gradient" size="lg">
              Começar grátis <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--primary)/0.15),hsl(var(--accent)/0.15))] text-[hsl(var(--primary))]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="glass rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-bold">Pronto para vender com IA?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Crie sua conta em 30 segundos e organize seu primeiro pipeline
            agora.
          </p>
          <Link href="/login?mode=signup" className="mt-6 inline-block">
            <Button variant="gradient" size="lg">
              Criar minha conta <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CRM Bot · Construído com Next.js, Supabase
        e IA.
      </footer>
    </div>
  );
}
