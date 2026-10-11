import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  FileUp,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
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

const GROUPS = [
  {
    label: "Visão geral",
    items: [{ to: "/", label: "Painel", icon: LayoutDashboard }],
  },
  {
    label: "Cadastros",
    items: [
      { to: "/alunos", label: "Alunos", icon: Users },
      { to: "/turmas", label: "Turmas", icon: BookOpenCheck },
    ],
  },
  {
    label: "Diário",
    items: [
      { to: "/notas", label: "Notas", icon: Table2 },
      { to: "/qualitativa", label: "Avaliação qualitativa", icon: ClipboardList },
      { to: "/frequencia", label: "Frequência", icon: CalendarCheck },
    ],
  },
  {
    label: "Gestão",
    items: [
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
      { to: "/importar", label: "Importar", icon: FileUp },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
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

  const year = workspace?.years.find((item) => item.id === yearId);

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">
        Ir ao conteúdo
      </a>
      {open ? <button aria-label="Fechar menu" className="fixed inset-0 z-30 bg-ink/40 md:hidden" onClick={() => setOpen(false)} /> : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-card px-3 py-4 transition md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-2 px-2">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-pine text-sm font-bold text-pine-fg" aria-hidden="true">
              GP
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight tracking-tight">Gestão Escolar PRO</p>
              <p className="text-xs text-muted">Ensino Médio integrado</p>
            </div>
          </div>
          <button type="button" className="grid size-11 place-items-center rounded-lg md:hidden" onClick={() => setOpen(false)} aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-4 overflow-auto">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium",
                        active ? "bg-pine-soft text-pine" : "text-ink hover:bg-soft",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-card/95 px-4 backdrop-blur">
          <button type="button" className="grid size-11 place-items-center rounded-lg md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold">{workspace?.school.name ?? "Gestão pedagógica"}</p>
            <p className="truncate text-xs text-muted">{year ? `Ano letivo ${year.label}` : "Selecione o ano letivo"}</p>
          </div>
          <form
            className="relative min-w-0 flex-1"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const q = String(data.get("q") ?? "").trim();
              void navigate({ to: "/alunos", search: { q } });
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              name="q"
              aria-label="Busca global de estudantes"
              placeholder="Buscar estudante por nome ou matrícula"
              className="h-11 w-full rounded-lg border border-line bg-paper pr-3 pl-9 text-sm"
            />
          </form>
          {workspace ? (
            <select
              aria-label="Ano letivo"
              className="h-11 max-w-36 rounded-lg border border-line bg-card px-2 text-sm"
              value={yearId ?? ""}
              onChange={(event) => setYearId(event.target.value)}
            >
              {workspace.years.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          ) : null}
          <button type="button" className="grid size-11 place-items-center rounded-lg hover:bg-soft" onClick={toggleTheme} aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <UserButton />
        </header>
        <main id="conteudo" className="mx-auto min-w-0 w-full max-w-7xl flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
