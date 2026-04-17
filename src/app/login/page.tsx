import Link from "next/link";
import { Sparkles } from "lucide-react";
import { LoginForm } from "./login-form";

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const mode = sp?.mode === "signup" ? "signup" : "login";

  return (
    <div className="gradient-bg flex flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          CRM Bot
        </Link>
        <div className="glass rounded-2xl p-8 animate-fade-up">
          <h1 className="text-2xl font-bold">
            {mode === "signup" ? "Criar conta" : "Bem-vindo de volta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Comece grátis, sem cartão de crédito."
              : "Entre para acessar seu pipeline."}
          </p>
          <div className="mt-6">
            <LoginForm mode={mode} />
          </div>
        </div>
      </div>
    </div>
  );
}
