import { useEffect, useRef, type ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "soft" }) {
  const styles = {
    primary: "bg-pine text-pine-fg hover:bg-pine/92",
    ghost: "bg-transparent text-ink hover:bg-soft",
    danger: "border border-danger/30 bg-danger-bg text-danger hover:bg-danger-bg/80",
    soft: "bg-pine-soft text-pine hover:bg-pine-soft/70",
  }[variant];
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "h-11 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted focus-visible:border-pine";

export const areaClass = "min-h-24 w-full rounded-lg border border-line bg-card p-3 text-sm text-ink outline-none focus-visible:border-pine";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1>{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-pretty text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-card border border-line bg-card p-4", className)}>
      {title ? <h2>{title}</h2> : null}
      {description ? <p className={cn("text-sm text-pretty text-muted", title ? "mt-1" : "")}>{description}</p> : null}
      {children}
    </section>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "ok" | "warn";
  children: ReactNode;
}) {
  const styles = {
    info: "border-line bg-card text-muted",
    error: "border-danger/30 bg-danger-bg text-danger",
    ok: "border-ok/30 bg-ok-bg text-ok",
    warn: "border-warn/30 bg-warn-bg text-warn",
  }[tone];
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-lg border px-3 py-2 text-sm", styles)}>
      {children}
    </p>
  );
}

export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = panelRef.current;
    const focusable = node?.querySelector<HTMLElement>("input, select, textarea, button");
    focusable?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>("input, select, textarea, button, a[href]")].filter((item) => !item.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 sm:items-center" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-card border border-line bg-card p-5 shadow-pop"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="dialog-title">{title}</h2>
          <button type="button" className="h-11 rounded-lg px-3 text-sm font-medium text-muted hover:bg-soft" onClick={onClose}>
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-card px-5 py-12 text-center">
      <h2>{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted">{text}</p>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-card border border-line bg-card p-4">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "bad" | "warn" | "muted"; children: ReactNode }) {
  const styles = {
    ok: "bg-ok-bg text-ok",
    bad: "bg-danger-bg text-danger",
    warn: "bg-warn-bg text-warn",
    muted: "bg-soft text-muted",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", styles)}>{children}</span>;
}

export function errText(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Falha inesperada.";
}
