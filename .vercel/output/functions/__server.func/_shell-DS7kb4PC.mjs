import { o as __toESM } from "./_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { C as useNavigate, S as Navigate, _ as Outlet, m as useRouterState, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as signOut } from "./_ssr/client-1vAx-gM_.mjs";
import { d as useCurrentUserState, s as cn, u as useCurrentUser } from "./_ssr/ui-ByRUqWcZ.mjs";
import { U as useSchool, t as SchoolProvider } from "./_ssr/school-context-MF74zmn4.mjs";
import { a as hasGateSessionMarker } from "./_ssr/server-D4GCTEes.mjs";
import { a as Sun, c as Menu, d as ChartColumn, f as CalendarCheck, i as Table2, l as LayoutDashboard, n as Users, o as Settings, p as BookOpenCheck, s as Moon, t as X, u as FileUp } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_shell-DS7kb4PC.js
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
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var NAV = [
	{
		to: "/",
		label: "Painel",
		icon: LayoutDashboard
	},
	{
		to: "/alunos",
		label: "Alunos",
		icon: Users
	},
	{
		to: "/turmas",
		label: "Turmas",
		icon: BookOpenCheck
	},
	{
		to: "/notas",
		label: "Notas",
		icon: Table2
	},
	{
		to: "/qualitativa",
		label: "Avaliação qualitativa",
		icon: BookOpenCheck
	},
	{
		to: "/frequencia",
		label: "Frequência",
		icon: CalendarCheck
	},
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#conteudo",
				className: "sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:bg-card focus:px-3 focus:py-2",
				children: "Ir ao conteúdo"
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": "Fechar menu",
				className: "fixed inset-0 z-30 bg-ink/40 md:hidden",
				onClick: () => setOpen(false)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-card p-4 transition md:static md:translate-x-0", open ? "translate-x-0" : "-translate-x-full"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-lg leading-tight",
						children: "Gestão Escolar PRO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Ensino Médio integrado"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-11 px-2 md:hidden",
						onClick: () => setOpen(false),
						"aria-label": "Fechar",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex flex-1 flex-col gap-1",
					children: NAV.map((item) => {
						const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							onClick: () => setOpen(false),
							"aria-current": active ? "page" : void 0,
							className: cn("flex h-11 items-center gap-2 rounded-card px-3 text-sm font-medium", active ? "bg-pine text-pine-fg" : "text-ink hover:bg-soft"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), item.label]
						}, item.to);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 px-2 md:hidden",
							onClick: () => setOpen(true),
							"aria-label": "Abrir menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
							className: "min-w-0 flex-1",
							onSubmit: (event) => {
								event.preventDefault();
								const data = new FormData(event.currentTarget);
								const q = String(data.get("q") ?? "").trim();
								navigate({
									to: "/alunos",
									search: { q }
								});
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "q",
								"aria-label": "Buscar estudante",
								placeholder: "Buscar estudante",
								className: "h-11 w-full max-w-md rounded-card border border-line bg-card px-3 text-sm"
							})
						}),
						workspace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Ano letivo",
							className: "h-11 rounded-card border border-line bg-card px-2 text-sm",
							value: yearId ?? "",
							onChange: (event) => setYearId(event.target.value),
							children: workspace.years.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: year.id,
								children: year.label
							}, year.id))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center rounded-card hover:bg-soft",
							onClick: toggleTheme,
							"aria-label": "Alternar tema",
							children: dark ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					id: "conteudo",
					className: "min-w-0 flex-1 p-4 md:p-6",
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
