import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button, controlClass, errText } from "@/components/ui";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (isPending) return <main className="grid min-h-screen place-items-center bg-paper text-muted">Carregando…</main>;
  if (user) return <Navigate to="/" />;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    if (password.length < 8) {
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }
    setPending(true);
    const result =
      mode === "up"
        ? await authClient.signUp.email({ email, password, name: name || "Professor", callbackURL: "/" })
        : await authClient.signIn.email({ email, password, callbackURL: "/" });
    setPending(false);
    if (result.error) {
      setError(translate(result.error.message ?? ""));
      return;
    }
    window.location.assign("/");
  }

  return (
    <main className="grid min-h-screen bg-paper text-ink lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="hidden flex-col justify-between bg-pine px-10 py-12 text-pine-fg lg:flex">
        <p className="text-sm font-semibold tracking-wide">Ensino Médio integrado</p>
        <div>
          <h1 className="max-w-md text-4xl font-semibold text-pine-fg">Gestão Escolar PRO</h1>
          <p className="mt-4 max-w-md text-pretty text-pine-fg/85">
            Diário de notas, avaliação qualitativa, frequência e relatórios para quem acompanha turmas de perto.
            Cada conta vê apenas as escolas em que foi autorizada.
          </p>
          <ul className="mt-8 flex max-w-md flex-col gap-2 text-sm text-pine-fg/90">
            <li>Notas em branco não viram zero.</li>
            <li>Recuperação não apaga o lançamento original.</li>
            <li>Avaliação qualitativa permanece separada da nota numérica.</li>
          </ul>
        </div>
        <p className="text-sm text-pine-fg/75">Acesso restrito às escolas autorizadas para esta conta.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm rounded-card border border-line bg-card p-6">
          <p className="text-xs font-semibold tracking-wide text-pine uppercase lg:hidden">Gestão Escolar PRO</p>
          <h2 className="mt-1 text-2xl">{mode === "up" ? "Criar conta" : "Entrar"}</h2>
          <p className="mt-1 text-sm text-muted">Use Google, X ou uma conta com e-mail e senha.</p>
          <div className="mt-6 flex flex-col gap-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button key={provider.providerId} variant="soft" type="button" onClick={() => signIn(provider.providerId, { callbackURL: "/" })}>
                Continuar com {provider.label}
              </Button>
            ))}
          </div>
          <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
            {mode === "up" ? <input name="name" required placeholder="Seu nome" aria-label="Seu nome" className={controlClass} /> : null}
            <input name="email" type="email" required placeholder="E-mail" aria-label="E-mail" autoComplete="email" className={controlClass} />
            <input name="password" type="password" required placeholder="Senha" aria-label="Senha" autoComplete={mode === "up" ? "new-password" : "current-password"} className={controlClass} />
            {error ? <p role="alert" className="rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Aguarde…" : mode === "up" ? "Criar conta" : "Entrar com e-mail"}
            </Button>
          </form>
          <button type="button" className="mt-4 h-11 text-sm font-semibold text-pine" onClick={() => { setMode(mode === "in" ? "up" : "in"); setError(null); }}>
            {mode === "in" ? "Ainda não tenho conta" : "Já tenho conta"}
          </button>
        </div>
      </section>
    </main>
  );
}

function translate(message: string) {
  const text = message.toLowerCase();
  if (text.includes("already")) return "Já existe uma conta com este e-mail.";
  if (text.includes("password")) return "Senha recusada. Use pelo menos 8 caracteres.";
  if (text.includes("invalid") && text.includes("email")) return "E-mail inválido.";
  if (text.includes("invalid")) return "E-mail ou senha incorretos.";
  return errText(new Error(message || "Não foi possível entrar."));
}
