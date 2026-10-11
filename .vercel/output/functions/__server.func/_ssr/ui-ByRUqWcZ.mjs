import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as authClient } from "./client-1vAx-gM_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-ByRUqWcZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}
function Button({ children, variant = "primary", className, ...props }) {
	const styles = {
		primary: "bg-pine text-pine-fg hover:opacity-90",
		ghost: "bg-transparent text-ink hover:bg-soft",
		danger: "bg-card text-danger border border-danger/40 hover:bg-soft",
		soft: "bg-soft text-ink hover:opacity-90"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-card px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50", styles, className),
		children
	});
}
function Field({ label, children, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-1 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
var controlClass = "h-11 w-full rounded-card border border-line bg-card px-3 text-sm text-ink outline-none";
function Dialog({ open, title, onClose, children }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center",
		onMouseDown: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "dialog-title",
			className: "max-h-[90vh] w-full max-w-lg overflow-auto rounded-card bg-card p-5 shadow-lg",
			onMouseDown: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "dialog-title",
					className: "text-xl",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 px-2 text-sm text-muted",
					onClick: onClose,
					children: "Fechar"
				})]
			}), children]
		})
	});
}
function Empty({ title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-card border border-dashed border-line bg-card px-5 py-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto mt-2 max-w-md text-sm text-pretty text-muted",
			children: text
		})]
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-card border border-line bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-muted uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-serif text-3xl tabular-nums",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function Badge({ tone, children }) {
	const styles = {
		ok: "bg-ok/15 text-ok",
		bad: "bg-danger/15 text-danger",
		warn: "bg-warn/15 text-warn",
		muted: "bg-soft text-muted"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", styles),
		children
	});
}
function errText(error) {
	return error instanceof Error && error.message ? error.message : "Falha inesperada.";
}
//#endregion
export { Field as a, controlClass as c, useCurrentUserState as d, Empty as i, errText as l, Button as n, Stat as o, Dialog as r, cn as s, Badge as t, useCurrentUser as u };
