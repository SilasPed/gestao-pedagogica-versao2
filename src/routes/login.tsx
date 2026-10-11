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
    <main className="grid min-h-screen bg-paper text-ink lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-pine px-8 py-10 text-pine-fg">
        <p className="text-sm font-semibold tracking-wide uppercase">Ensino Médio integrado</p>
        <div>
          <h1 className="max-w-md text-4xl">Gestão Escolar PRO</h1>
          <p className="mt-4 max-w-md text-pretty text-pine-fg/80">
            Diário de notas, avaliação qualitativa, frequência e relatórios para quem acompanha turmas de perto.
            Cada conta vê apenas as escolas em que foi autorizada.
          </p>
        </div>
        <p className="text-sm text-pine-fg/70">Notas em branco não viram zero. Recuperação não apaga o lançamento original.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl">Entrar</h2>
          <p className="mt-1 text-sm text-muted">Use Google, X ou uma conta com e-mail e senha.</p>
          <div className="mt-6 flex flex-col gap-2">
            {GROK_PROVIDERS.map((provider) => (
              <Button key={provider.providerId} variant="soft" type="button" onClick={() => signIn(provider.providerId, { callbackURL: "/" })}>
                Continuar com {provider.label}
              </Button>
            ))}
          </div>
          <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
            {mode === "up" ? <input name="name" required placeholder="Seu nome" className={controlClass} /> : null}
            <input name="email" type="email" required placeholder="E-mail" autoComplete="email" className={controlClass} />
            <input name="password" type="password" required placeholder="Senha" autoComplete={mode === "up" ? "new-password" : "current-password"} className={controlClass} />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Aguarde…" : mode === "up" ? "Criar conta" : "Entrar com e-mail"}
            </Button>
          </form>
          <button type="button" className="mt-4 h-11 text-sm text-pine" onClick={() => setMode(mode === "in" ? "up" : "in")}>
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
