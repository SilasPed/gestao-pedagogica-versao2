import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { S as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-D4GCTEes.mjs";
import { d as errText, n as Button, p as useCurrentUserState, u as controlClass } from "./ui-FQ-oeRrS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CIyMc5fc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper text-muted",
		children: "Carregando…"
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function onSubmit(event) {
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
		const result = mode === "up" ? await authClient.signUp.email({
			email,
			password,
			name: name || "Professor",
			callbackURL: "/"
		}) : await authClient.signIn.email({
			email,
			password,
			callbackURL: "/"
		});
		setPending(false);
		if (result.error) {
			setError(translate(result.error.message ?? ""));
			return;
		}
		window.location.assign("/");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-screen bg-paper text-ink lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between bg-pine px-10 py-12 text-pine-fg lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tracking-wide",
					children: "Ensino Médio integrado"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "max-w-md text-4xl font-semibold text-pine-fg",
						children: "Gestão Escolar PRO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-md text-pretty text-pine-fg/85",
						children: "Diário de notas, avaliação qualitativa, frequência e relatórios para quem acompanha turmas de perto. Cada conta vê apenas as escolas em que foi autorizada."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-8 flex max-w-md flex-col gap-2 text-sm text-pine-fg/90",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Notas em branco não viram zero." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Recuperação não apaga o lançamento original." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Avaliação qualitativa permanece separada da nota numérica." })
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-pine-fg/75",
					children: "Acesso restrito às escolas autorizadas para esta conta."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center justify-center px-5 py-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm rounded-card border border-line bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-wide text-pine uppercase lg:hidden",
						children: "Gestão Escolar PRO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-2xl",
						children: mode === "up" ? "Criar conta" : "Entrar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Use Google, X ou uma conta com e-mail e senha."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex flex-col gap-2",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "soft",
							type: "button",
							onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
							children: ["Continuar com ", provider.label]
						}, provider.providerId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 flex flex-col gap-3",
						onSubmit,
						children: [
							mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								required: true,
								placeholder: "Seu nome",
								"aria-label": "Seu nome",
								className: controlClass
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "email",
								type: "email",
								required: true,
								placeholder: "E-mail",
								"aria-label": "E-mail",
								autoComplete: "email",
								className: controlClass
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "password",
								type: "password",
								required: true,
								placeholder: "Senha",
								"aria-label": "Senha",
								autoComplete: mode === "up" ? "new-password" : "current-password",
								className: controlClass
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: pending,
								children: pending ? "Aguarde…" : mode === "up" ? "Criar conta" : "Entrar com e-mail"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 h-11 text-sm font-semibold text-pine",
						onClick: () => {
							setMode(mode === "in" ? "up" : "in");
							setError(null);
						},
						children: mode === "in" ? "Ainda não tenho conta" : "Já tenho conta"
					})
				]
			})
		})]
	});
}
function translate(message) {
	const text = message.toLowerCase();
	if (text.includes("already")) return "Já existe uma conta com este e-mail.";
	if (text.includes("password")) return "Senha recusada. Use pelo menos 8 caracteres.";
	if (text.includes("invalid") && text.includes("email")) return "E-mail inválido.";
	if (text.includes("invalid")) return "E-mail ou senha incorretos.";
	return errText(new Error(message || "Não foi possível entrar."));
}
//#endregion
export { LoginPage as component };
