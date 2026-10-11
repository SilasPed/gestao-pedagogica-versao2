import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell } from "@/components/shell";

export const Route = createFileRoute("/_shell")({ component: ShellGate });

function ShellGate() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="grid min-h-screen place-items-center bg-paper text-sm text-muted">Carregando sessão…</div>;
  }
  if (!user) return <RedirectToSignIn />;
  return <AppShell />;
}
