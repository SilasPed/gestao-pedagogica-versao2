import type { AssessmentKind, StudentStatus } from "./constants.ts";
import { normalizeKey } from "./format.ts";

export function parseSeries(raw: unknown): "1" | "2" | "3" | null | "invalid" {
  if (raw == null || String(raw).trim() === "") return null;
  const t = normalizeKey(String(raw)).replace(/\s+/g, " ");
  if (/\b(primeiro|1)\b/.test(t) && !/\b(2|3|segundo|terceiro)\b/.test(t)) return "1";
  if (/\b(segundo|2)\b/.test(t) && !/\b(1|3|primeiro|terceiro)\b/.test(t)) return "2";
  if (/\b(terceiro|3)\b/.test(t) && !/\b(1|2|primeiro|segundo)\b/.test(t)) return "3";
  return "invalid";
}

export function parseStatus(raw: unknown): StudentStatus | null | "invalid" {
  if (raw == null || String(raw).trim() === "") return null;
  const t = normalizeKey(String(raw));
  if (["ativo", "ativa", "cursando", "matriculado", "matriculada"].includes(t)) return "ativo";
  if (["transferido", "transferida", "transferencia"].includes(t)) return "transferido";
  if (["concluido", "concluida", "formado", "formada", "concluinte"].includes(t)) return "concluido";
  if (["inativo", "inativa", "evadido", "evadida", "cancelado", "cancelada", "desistente"].includes(t)) return "inativo";
  return "invalid";
}

export type GradeCell =
  | { kind: "empty" }
  | { kind: "graded"; value: number }
  | { kind: "pending" }
  | { kind: "absent" }
  | { kind: "excused" }
  | { kind: "na" }
  | { kind: "invalid"; error: string };

export function parseGradeCell(raw: unknown, maxScore: number | null): GradeCell {
  if (raw == null) return { kind: "empty" };
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return { kind: "invalid", error: "Nota inválida." };
    if (raw < 0) return { kind: "invalid", error: "Nota negativa não é permitida." };
    if (maxScore != null && raw > maxScore + 1e-9) {
      return { kind: "invalid", error: `Nota ${raw} acima do máximo ${maxScore}.` };
    }
    return { kind: "graded", value: raw };
  }
  const s = String(raw).trim();
  if (!s || s === "-" || s === "—" || s === "–") return { kind: "empty" };
  const t = normalizeKey(s);
  if (["pendente", "p", "pend"].includes(t)) return { kind: "pending" };
  if (["ausente", "ausencia", "falta", "f", "aus"].includes(t)) return { kind: "absent" };
  if (["dispensado", "dispensada", "dispensa", "d", "disp"].includes(t)) return { kind: "excused" };
  if (["na", "n a", "nao aplicavel"].includes(t)) return { kind: "na" };
  const normalized = s.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return { kind: "invalid", error: `Nota "${s}" não foi reconhecida.` };
  const value = Number(normalized);
  if (value < 0) return { kind: "invalid", error: "Nota negativa não é permitida." };
  if (maxScore != null && value > maxScore + 1e-9) {
    return { kind: "invalid", error: `Nota ${value} acima do máximo ${maxScore}.` };
  }
  return { kind: "graded", value };
}

export function parseWeight(raw: unknown): number | null | "invalid" {
  if (raw == null || String(raw).trim() === "") return null;
  const cell = parseGradeCell(raw, null);
  if (cell.kind !== "graded" || !(cell.value > 0) || cell.value > 100) return "invalid";
  return cell.value;
}

export function parseDateCell(raw: unknown): string | null | "invalid" {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, "0");
    const d = String(raw.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(raw) * 86400000);
    if (Number.isNaN(utc.getTime())) return "invalid";
    return utc.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  const br = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(s);
  if (br) {
    const d = Number(br[1]);
    const m = Number(br[2]);
    const y = Number(br[3]);
    if (m < 1 || m > 12 || d < 1 || d > 31) return "invalid";
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return "invalid";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return "invalid";
}

export function parseKind(raw: unknown): AssessmentKind | null | "invalid" {
  if (raw == null || String(raw).trim() === "") return null;
  const t = normalizeKey(String(raw));
  if (t.startsWith("prov")) return "prova";
  if (t.startsWith("trabal")) return "trabalho";
  if (t.startsWith("ativ")) return "atividade";
  if (t.startsWith("proje")) return "projeto";
  if (t.startsWith("part")) return "participacao";
  if (t.startsWith("recup")) return "recuperacao";
  return "invalid";
}

export function parseBool(raw: unknown): boolean | null | "invalid" {
  if (raw == null || String(raw).trim() === "") return null;
  const t = normalizeKey(String(raw));
  if (["sim", "s", "true", "1", "recuperacao", "yes"].includes(t)) return true;
  if (["nao", "n", "false", "0", "no"].includes(t)) return false;
  return "invalid";
}

export function cleanName(raw: unknown): string {
  return String(raw ?? "").replace(/\s+/g, " ").trim();
}

export function cleanEnrollment(raw: unknown): string | null {
  const t = String(raw ?? "").trim().toUpperCase();
  return t || null;
}

export function clip(raw: unknown, max: number): string {
  return cleanName(raw).slice(0, max);
}
