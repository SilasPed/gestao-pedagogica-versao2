import { useEffect, type ReactNode } from "react";

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
    primary: "bg-pine text-pine-fg hover:opacity-90",
    ghost: "bg-transparent text-ink hover:bg-soft",
    danger: "bg-card text-danger border border-danger/40 hover:bg-soft",
    soft: "bg-soft text-ink hover:opacity-90",
  }[variant];
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-card px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50",
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
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "h-11 w-full rounded-card border border-line bg-card px-3 text-sm text-ink outline-none";

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
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-card bg-card p-5 shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="dialog-title" className="text-xl">
            {title}
          </h2>
          <button type="button" className="h-11 px-2 text-sm text-muted" onClick={onClose}>
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
    <div className="rounded-card border border-dashed border-line bg-card px-5 py-10 text-center">
      <h2 className="text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-muted">{text}</p>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-card border border-line bg-card p-4">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-serif text-3xl tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}

export function Badge({ tone, children }: { tone: "ok" | "bad" | "warn" | "muted"; children: ReactNode }) {
  const styles = {
    ok: "bg-ok/15 text-ok",
    bad: "bg-danger/15 text-danger",
    warn: "bg-warn/15 text-warn",
    muted: "bg-soft text-muted",
  }[tone];
  return <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-semibold", styles)}>{children}</span>;
}

export function errText(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Falha inesperada.";
}
