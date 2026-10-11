import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  FileUp,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  Sun,
  Table2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { SchoolProvider, useSchool } from "./school-context";
import { cn } from "./ui";

const NAV = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/alunos", label: "Alunos", icon: Users },
  { to: "/turmas", label: "Turmas", icon: BookOpenCheck },
  { to: "/notas", label: "Notas", icon: Table2 },
  { to: "/qualitativa", label: "Avaliação qualitativa", icon: BookOpenCheck },
  { to: "/frequencia", label: "Frequência", icon: CalendarCheck },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/importar", label: "Importar", icon: FileUp },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell() {
  return (
    <SchoolProvider>
      <Frame />
    </SchoolProvider>
  );
}

function Frame() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { workspace, yearId, setYearId } = useSchool();
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gep-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-card focus:px-3 focus:py-2">
        Ir ao conteúdo
      </a>
      {open ? <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-ink/40 md:hidden" onClick={() => setOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-card p-4 transition md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-2">
          <div>
            <p className="font-serif text-lg leading-tight">Gestão Escolar PRO</p>
            <p className="text-xs text-muted">Ensino Médio integrado</p>
          </div>
          <button type="button" className="h-11 px-2 md:hidden" onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-card px-3 text-sm font-medium",
                  active ? "bg-pine text-pine-fg" : "text-ink hover:bg-soft",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur">
          <button type="button" className="h-11 px-2 md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const q = String(data.get("q") ?? "").trim();
              void navigate({ to: "/alunos", search: { q } });
            }}
          >
            <input name="q" aria-label="Buscar estudante" placeholder="Buscar estudante" className="h-11 w-full max-w-md rounded-card border border-line bg-card px-3 text-sm" />
          </form>
          {workspace ? (
            <select
              aria-label="Ano letivo"
              className="h-11 rounded-card border border-line bg-card px-2 text-sm"
              value={yearId ?? ""}
              onChange={(event) => setYearId(event.target.value)}
            >
              {workspace.years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </select>
          ) : null}
          <button type="button" className="grid size-11 place-items-center rounded-card hover:bg-soft" onClick={toggleTheme} aria-label="Alternar tema">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <UserButton />
        </header>
        <main id="conteudo" className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
