export function fmtGrade(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const neg = n < 0;
  const r = Math.round(Math.abs(n) * 100) / 100;
  const [i, d] = r.toFixed(2).split(".");
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const dec = d === "00" ? "" : d.endsWith("0") ? `,${d[0]}` : `,${d}`;
  return `${neg ? "-" : ""}${int}${dec}`;
}

export function fmtPercent(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${fmtGrade(n)}%`;
}

export function asNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function asNumberOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function seriesLabel(series: string | null | undefined): string {
  if (series === "1") return "1º ano";
  if (series === "2") return "2º ano";
  if (series === "3") return "3º ano";
  return series?.trim() || "—";
}

export function todayBR(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function normalizeKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
