import { o as __toESM } from "./_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { C as useNavigate, S as Navigate, _ as Outlet, m as useRouterState, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./_ssr/client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./_ssr/server-D4GCTEes.mjs";
import { f as useCurrentUser, l as cn, p as useCurrentUserState } from "./_ssr/ui-FQ-oeRrS.mjs";
import { U as useSchool, t as SchoolProvider } from "./_ssr/school-context-BQIuyGAS.mjs";
import { a as Sun, c as Moon, d as FileUp, f as ClipboardList, h as BookOpenCheck, i as Table2, l as Menu, m as CalendarCheck, n as Users, o as Settings, p as ChartColumn, s as Search, t as X, u as LayoutDashboard } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_shell-CXSQIicy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-full bg-pine-soft text-sm font-semibold text-pine",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden max-w-32 truncate text-sm font-medium sm:inline",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "h-11 cursor-pointer rounded-lg px-2 text-sm font-medium text-muted hover:bg-soft hover:text-ink disabled:cursor-wait",
				children: signingOut ? "Saindo…" : "Sair"
			})
		]
	});
}
var GROUPS = [
	{
		label: "Visão geral",
		items: [{
			to: "/",
			label: "Painel",
			icon: LayoutDashboard
		}]
	},
	{
		label: "Cadastros",
		items: [{
			to: "/alunos",
			label: "Alunos",
			icon: Users
		}, {
			to: "/turmas",
			label: "Turmas",
			icon: BookOpenCheck
		}]
	},
	{
		label: "Diário",
		items: [
			{
				to: "/notas",
				label: "Notas",
				icon: Table2
			},
			{
				to: "/qualitativa",
				label: "Avaliação qualitativa",
				icon: ClipboardList
			},
			{
				to: "/frequencia",
				label: "Frequência",
				icon: CalendarCheck
			}
		]
	},
	{
		label: "Gestão",
		items: [
			{
				to: "/relatorios",
				label: "Relatórios",
				icon: ChartColumn
			},
			{
				to: "/importar",
				label: "Importar",
				icon: FileUp
			},
			{
				to: "/configuracoes",
				label: "Configurações",
				icon: Settings
			}
		]
	}
];
function AppShell() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, {}) });
}
function Frame() {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [dark, setDark] = (0, import_react.useState)(false);
	const { workspace, yearId, setYearId } = useSchool();
	(0, import_react.useEffect)(() => {
		setDark(document.documentElement.classList.contains("dark"));
	}, []);
	function toggleTheme() {
		const next = !document.documentElement.classList.contains("dark");
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("gep-theme", next ? "dark" : "light");
		setDark(next);
	}
	const year = workspace?.years.find((item) => item.id === yearId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#conteudo",
				className: "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2",
				children: "Ir ao conteúdo"
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": "Fechar menu",
				className: "fixed inset-0 z-30 bg-ink/40 md:hidden",
				onClick: () => setOpen(false)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-card px-3 py-4 transition md:sticky md:top-0 md:h-screen md:translate-x-0", open ? "translate-x-0" : "-translate-x-full"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5 flex items-start justify-between gap-2 px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-lg bg-pine text-sm font-bold text-pine-fg",
							"aria-hidden": "true",
							children: "GP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold leading-tight tracking-tight",
							children: "Gestão Escolar PRO"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Ensino Médio integrado"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-11 place-items-center rounded-lg md:hidden",
						onClick: () => setOpen(false),
						"aria-label": "Fechar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex flex-1 flex-col gap-4 overflow-auto",
					children: GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase",
						children: group.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-0.5",
						children: group.items.map((item) => {
							const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								onClick: () => setOpen(false),
								"aria-current": active ? "page" : void 0,
								className: cn("flex h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium", active ? "bg-pine-soft text-pine" : "text-ink hover:bg-soft"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), item.label]
							}, item.to);
						})
					})] }, group.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-card/95 px-4 backdrop-blur",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center rounded-lg md:hidden",
							onClick: () => setOpen(true),
							"aria-label": "Abrir menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden min-w-0 md:block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: workspace?.school.name ?? "Gestão pedagógica"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: year ? `Ano letivo ${year.label}` : "Selecione o ano letivo"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "relative min-w-0 flex-1",
							role: "search",
							onSubmit: (event) => {
								event.preventDefault();
								const data = new FormData(event.currentTarget);
								const q = String(data.get("q") ?? "").trim();
								navigate({
									to: "/alunos",
									search: { q }
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "q",
								"aria-label": "Busca global de estudantes",
								placeholder: "Buscar estudante por nome ou matrícula",
								className: "h-11 w-full rounded-lg border border-line bg-paper pr-3 pl-9 text-sm"
							})]
						}),
						workspace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Ano letivo",
							className: "h-11 max-w-36 rounded-lg border border-line bg-card px-2 text-sm",
							value: yearId ?? "",
							onChange: (event) => setYearId(event.target.value),
							children: workspace.years.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.label
							}, item.id))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center rounded-lg hover:bg-soft",
							onClick: toggleTheme,
							"aria-label": dark ? "Usar tema claro" : "Usar tema escuro",
							children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					id: "conteudo",
					className: "mx-auto min-w-0 w-full max-w-7xl flex-1 p-4 md:p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			})
		]
	});
}
function ShellGate() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center bg-paper text-sm text-muted",
		children: "Carregando sessão…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {});
}
//#endregion
export { ShellGate as component };
