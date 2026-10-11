import { FIELD_ALIASES, IMPORT_FIELDS, type AssessmentKind, type ImportKind, type StudentStatus } from "./constants.ts";
import { normalizeKey } from "./format.ts";
import {
  cleanEnrollment,
  cleanName,
  clip,
  parseBool,
  parseDateCell,
  parseGradeCell,
  parseKind,
  parseSeries,
  parseStatus,
  parseWeight,
  type GradeCell,
} from "./validate.ts";

export type ImportMode = "add" | "update" | "merge";

export type ImportPlan = {
  row: number;
  action: "add" | "update" | "ignore" | "reject";
  message: string;
  payload: Record<string, unknown>;
};

export type ExistingStudent = {
  id: string;
  name: string;
  enrollment: string | null;
  classId: string | null;
  yearId: string | null;
  archived: boolean;
};

export type ExistingClass = {
  id: string;
  yearId: string;
  series: string;
  name: string;
  courseId: string | null;
};

export type ExistingCourse = { id: string; name: string };
export type ExistingSubject = { id: string; name: string };
export type ExistingPeriod = { id: string; yearId: string; ord: number; name: string; kind: string };
export type ExistingAssessment = {
  id: string;
  classId: string;
  subjectId: string;
  periodId: string | null;
  name: string;
  isRecovery: boolean;
};
export type ExistingCriterion = { id: string; name: string; scale: string[] };

export function detectHeaderRow(rows: unknown[][]): number {
  const limit = Math.min(rows.length, 15);
  for (let i = 0; i < limit; i += 1) {
    const cells = (rows[i] ?? []).map((cell) => (cell == null ? "" : String(cell).trim())).filter(Boolean);
    if (cells.length < 2) continue;
    const textish = cells.filter((cell) => Number.isNaN(Number(cell.replace(",", ".")))).length;
    if (textish >= 2) return i;
  }
  return 0;
}

export function autoMap(headers: string[], kind: ImportKind): Record<string, number | null> {
  const used = new Set<number>();
  const result: Record<string, number | null> = {};
  for (const field of IMPORT_FIELDS[kind]) {
    const aliases = (FIELD_ALIASES[field.key] ?? [field.key]).map(normalizeKey);
    let found: number | null = null;
    headers.forEach((header, index) => {
      if (found != null || used.has(index)) return;
      if (aliases.includes(normalizeKey(header))) found = index;
    });
    if (found != null) used.add(found);
    result[field.key] = found;
  }
  return result;
}

export function sheetRecords(
  rows: unknown[][],
  headerIndex: number,
  mapping: Record<string, number | null>,
): { sheetRow: number; values: Record<string, unknown> }[] {
  const out: { sheetRow: number; values: Record<string, unknown> }[] = [];
  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const line = rows[i] ?? [];
    const values: Record<string, unknown> = {};
    let any = false;
    for (const [key, index] of Object.entries(mapping)) {
      if (index == null) continue;
      const value = line[index] ?? null;
      values[key] = value;
      if (value != null && String(value).trim() !== "") any = true;
    }
    if (!any) continue;
    out.push({ sheetRow: i + 1, values });
  }
  return out;
}

function text(values: Record<string, unknown>, key: string): string {
  return cleanName(values[key]);
}

export function planStudentImport(
  existing: ExistingStudent[],
  records: { sheetRow: number; values: Record<string, unknown> }[],
  options: { mode: ImportMode; allowNameMatch: boolean; allowSameName: boolean; yearId: string | null; yearLabel?: string | null },
): ImportPlan[] {
  const pool = existing.map((student) => ({ ...student }));
  return records.map((record) => {
    const fullName = clip(record.values.fullName, 160);
    const enrollment = cleanEnrollment(record.values.enrollment);
    const series = parseSeries(record.values.series);
    const status = parseStatus(record.values.status);
    const notes = clip(record.values.notes, 4000);
    const className = clip(record.values.className, 80);
    const courseName = clip(record.values.course, 120);
    const yearLabel = clip(record.values.year, 20);
    if (!fullName) {
      return reject(record.sheetRow, "Nome vazio.");
    }
    if (yearLabel && options.yearLabel && normalizeKey(yearLabel) !== normalizeKey(options.yearLabel)) {
      return reject(record.sheetRow, `A linha está no ano ${yearLabel}, mas o destino escolhido é ${options.yearLabel}.`);
    }
    if (series === "invalid") return reject(record.sheetRow, `Série "${text(record.values, "series")}" não é 1º, 2º ou 3º ano.`);
    if (status === "invalid") return reject(record.sheetRow, `Situação "${text(record.values, "status")}" não foi reconhecida.`);
    const byEnrollment = enrollment
      ? pool.filter((student) => student.enrollment && student.enrollment.toUpperCase() === enrollment)
      : [];
    if (byEnrollment.length > 1) {
      return reject(record.sheetRow, `Matrícula ${enrollment} aparece mais de uma vez nos dados já salvos.`);
    }
    let match: ExistingStudent | null = byEnrollment[0] ?? null;
    let weak = false;
    if (!match) {
      const byName = pool.filter((student) => normalizeKey(student.name) === normalizeKey(fullName));
      if (byName.length > 1 && !enrollment) {
        return reject(record.sheetRow, `Há mais de um estudante com o nome "${fullName}". Informe a matrícula.`);
      }
      if (byName.length >= 1 && enrollment && options.allowSameName && !options.allowNameMatch) {
        match = null;
      } else if (byName.length === 1 && !enrollment && options.allowNameMatch) {
        match = byName[0];
        weak = true;
      } else if (byName.length === 1 && enrollment && options.allowNameMatch && !options.allowSameName) {
        match = byName[0];
        weak = true;
      } else if (byName.length >= 1) {
        return {
          row: record.sheetRow,
          action: "ignore",
          message: enrollment
            ? `A matrícula ${enrollment} é nova, mas o nome "${fullName}" já existe. Nada foi gravado. Confirme a mescla se for a mesma pessoa, ou permita outro estudante com o mesmo nome.`
            : `Possível duplicidade pelo nome "${fullName}". Nada foi alterado. Confirme a mescla por nome se for a mesma pessoa.`,
          payload: basePayload(record, fullName, enrollment, series, status, notes, className, courseName, yearLabel),
        };
      }
    }
    const payload: Record<string, unknown> = {
      ...basePayload(record, fullName, enrollment, series, status, notes, className, courseName, yearLabel),
      studentId: match?.id ?? null,
      weak,
    };
    if (match) {
      if (options.mode === "add") {
        return { row: record.sheetRow, action: "ignore", message: "Já existe e o modo é somente adicionar.", payload };
      }
      if (match.archived) payload.unarchive = true;
      const updated = pool.find((student) => student.id === match!.id);
      if (updated && enrollment) updated.enrollment = enrollment;
      if (updated) updated.name = fullName;
      return { row: record.sheetRow, action: "update", message: weak ? "Atualização pelo nome confirmado." : "Atualização pela matrícula.", payload };
    }
    if (options.mode === "update") {
      return { row: record.sheetRow, action: "ignore", message: "Não encontrado para atualizar.", payload };
    }
    const id = `new:${record.sheetRow}`;
    pool.push({
      id,
      name: fullName,
      enrollment,
      classId: null,
      yearId: options.yearId,
      archived: false,
    });
    return { row: record.sheetRow, action: "add", message: "Novo estudante.", payload: { ...payload, studentId: null } };
  });
}

function basePayload(
  record: { sheetRow: number; values: Record<string, unknown> },
  fullName: string,
  enrollment: string | null,
  series: "1" | "2" | "3" | null | "invalid",
  status: StudentStatus | null | "invalid",
  notes: string,
  className: string,
  courseName: string,
  yearLabel: string,
): Record<string, unknown> {
  return {
    sheetRow: record.sheetRow,
    fullName,
    enrollment,
    series: series === "invalid" ? null : series,
    status: status && status !== "invalid" ? status : "ativo",
    notes,
    className,
    courseName,
    yearLabel,
  };
}

function reject(row: number, message: string): ImportPlan {
  return { row, action: "reject", message, payload: {} };
}

export function planScoreImport(
  records: { sheetRow: number; values: Record<string, unknown> }[],
  ctx: {
    students: ExistingStudent[];
    classes: ExistingClass[];
    subjects: ExistingSubject[];
    periods: ExistingPeriod[];
    assessments: ExistingAssessment[];
    yearId: string;
    scaleMax: number;
    mode: ImportMode;
    allowNameMatch: boolean;
  },
): ImportPlan[] {
  const students = ctx.students.map((student) => ({ ...student }));
  return records.map((record) => {
    const fullName = clip(record.values.fullName, 160);
    const enrollment = cleanEnrollment(record.values.enrollment);
    const className = clip(record.values.className, 80);
    const subjectName = clip(record.values.subject, 120);
    const assessmentName = clip(record.values.assessment, 120);
    const series = parseSeries(record.values.series);
    if (!className || !subjectName || !assessmentName) {
      return reject(record.sheetRow, "Turma, disciplina e avaliação são obrigatórias.");
    }
    if (!fullName && !enrollment) return reject(record.sheetRow, "Informe matrícula ou nome para vincular a nota.");
    if (series === "invalid") return reject(record.sheetRow, "Série inválida.");
    const student = matchStudent(students, fullName, enrollment, ctx.allowNameMatch);
    if (student.status === "ambiguous") return reject(record.sheetRow, student.message);
    if (student.status === "missing" && ctx.mode === "update") {
      return reject(record.sheetRow, "Estudante não encontrado no modo atualizar.");
    }
    if (student.status === "needs-confirm") {
      return {
        row: record.sheetRow,
        action: "ignore",
        message: student.message,
        payload: {},
      };
    }
    const periodId = matchPeriod(ctx.periods.filter((period) => period.yearId === ctx.yearId), record.values.period);
    if (periodId === "invalid") return reject(record.sheetRow, `Período "${text(record.values, "period")}" não existe neste ano.`);
    if (periodId === "ambiguous") return reject(record.sheetRow, "Período ambíguo.");
    const weight = parseWeight(record.values.weight);
    if (weight === "invalid") return reject(record.sheetRow, "Peso inválido. Use um número maior que zero.");
    const maxParsed = parseWeight(record.values.maxScore);
    if (maxParsed === "invalid") return reject(record.sheetRow, "Nota máxima inválida.");
    const maxScore = maxParsed ?? ctx.scaleMax;
    if (maxScore > ctx.scaleMax + 1e-9) {
      return reject(record.sheetRow, `Nota máxima ${maxScore} passa da escala ${ctx.scaleMax}.`);
    }
    const kind = parseKind(record.values.kind);
    if (kind === "invalid") return reject(record.sheetRow, "Tipo de avaliação não reconhecido.");
    const date = parseDateCell(record.values.date);
    if (date === "invalid") return reject(record.sheetRow, "Data inválida. Use dia/mês/ano.");
    const rawScore = record.values.scoreStatus != null && String(record.values.scoreStatus).trim() !== "" && (record.values.score == null || String(record.values.score).trim() === "")
      ? record.values.scoreStatus
      : record.values.score;
    const cell: GradeCell = parseGradeCell(rawScore, maxScore);
    if (cell.kind === "invalid") return reject(record.sheetRow, cell.error);
    const mark =
      cell.kind === "empty" || cell.kind === "pending"
        ? { status: "pending" as const, value: null }
        : cell.kind === "graded"
          ? { status: "graded" as const, value: cell.value }
          : { status: cell.kind, value: null };
    const classHit = matchClass(ctx.classes, ctx.yearId, className, series);
    if (classHit === "ambiguous") return reject(record.sheetRow, `Há mais de uma turma "${className}". Informe a série.`);
    return {
      row: record.sheetRow,
      action: student.status === "missing" ? "add" : "update",
      message: mark.status === "pending" ? "Pendência registrada, sem transformar em zero." : "Nota vinculada ao estudante.",
      payload: {
        studentId: student.status === "found" ? student.id : null,
        fullName,
        enrollment,
        createStudent: student.status === "missing",
        classId: classHit && classHit !== "missing" ? classHit.id : null,
        createClass: !classHit || classHit === "missing",
        className,
        series,
        subjectName,
        subjectId: ctx.subjects.find((subject) => normalizeKey(subject.name) === normalizeKey(subjectName))?.id ?? null,
        periodId: periodId === "invalid" || periodId === "ambiguous" ? null : periodId,
        assessmentName,
        kind: (kind ?? "prova") as AssessmentKind,
        date,
        weight: weight ?? 1,
        maxScore,
        isRecovery: kind === "recuperacao",
        value: mark.value,
        markStatus: mark.status,
        yearId: ctx.yearId,
      },
    };
  });
}

function matchStudent(
  students: ExistingStudent[],
  fullName: string,
  enrollment: string | null,
  allowNameMatch: boolean,
):
  | { status: "found"; id: string }
  | { status: "missing" }
  | { status: "ambiguous"; message: string }
  | { status: "needs-confirm"; message: string } {
  if (enrollment) {
    const hits = students.filter((student) => student.enrollment && student.enrollment.toUpperCase() === enrollment);
    if (hits.length > 1) return { status: "ambiguous", message: `Matrícula ${enrollment} duplicada.` };
    if (hits.length === 1) return { status: "found", id: hits[0].id };
  }
  if (fullName) {
    const hits = students.filter((student) => normalizeKey(student.name) === normalizeKey(fullName));
    if (hits.length > 1) return { status: "ambiguous", message: `Nome "${fullName}" corresponde a mais de um estudante.` };
    if (hits.length === 1) {
      if (!allowNameMatch && !enrollment) {
        return {
          status: "needs-confirm",
          message: `A nota de "${fullName}" só pode ser ligada pelo nome. Confirme a mescla por nome ou informe a matrícula.`,
        };
      }
      return { status: "found", id: hits[0].id };
    }
  }
  return { status: "missing" };
}

export function matchClass(
  classes: ExistingClass[],
  yearId: string,
  className: string,
  series: "1" | "2" | "3" | null,
): ExistingClass | "missing" | "ambiguous" {
  const sameYear = classes.filter(
    (klass) => klass.yearId === yearId && normalizeKey(klass.name) === normalizeKey(className),
  );
  const hits = series ? sameYear.filter((klass) => klass.series === series) : sameYear;
  if (hits.length === 1) return hits[0];
  if (hits.length > 1) return "ambiguous";
  return "missing";
}

export function matchPeriod(periods: ExistingPeriod[], raw: unknown): string | null | "invalid" | "ambiguous" {
  if (raw == null || String(raw).trim() === "") return null;
  const t = normalizeKey(String(raw)).replace(/\s+/g, " ");
  const hits = periods.filter((period) => {
    const name = normalizeKey(period.name);
    if (name === t) return true;
    if (t === String(period.ord)) return true;
    if (t === `${period.ord} ${period.kind}` || t === `${period.ord} bimestre` || t === `${period.ord} trimestre` || t === `${period.ord} semestre`) {
      return true;
    }
    return false;
  });
  if (hits.length === 1) return hits[0].id;
  if (hits.length > 1) return "ambiguous";
  return "invalid";
}

export function planClassImport(
  records: { sheetRow: number; values: Record<string, unknown> }[],
  classes: ExistingClass[],
  yearId: string,
  mode: ImportMode,
): ImportPlan[] {
  const pool = classes.map((klass) => ({ ...klass }));
  return records.map((record) => {
    const series = parseSeries(record.values.series);
    const className = clip(record.values.className, 80);
    const courseName = clip(record.values.course, 120);
    const teacher = clip(record.values.teacher, 120);
    if (!className) return reject(record.sheetRow, "Nome da turma vazio.");
    if (series == null || series === "invalid") return reject(record.sheetRow, "Série obrigatória: 1º, 2º ou 3º ano.");
    const hit = matchClass(pool, yearId, className, series);
    if (hit === "ambiguous") return reject(record.sheetRow, "Turma ambígua.");
    const payload = { className, series, courseName, teacher, classId: hit !== "missing" && hit ? hit.id : null, yearId };
    if (hit && hit !== "missing") {
      if (mode === "add") return { row: record.sheetRow, action: "ignore", message: "Turma já existe.", payload };
      return { row: record.sheetRow, action: "update", message: "Turma atualizada.", payload };
    }
    if (mode === "update") return { row: record.sheetRow, action: "ignore", message: "Turma não encontrada.", payload };
    pool.push({ id: `new:${record.sheetRow}`, yearId, series, name: className, courseId: null });
    return { row: record.sheetRow, action: "add", message: "Nova turma.", payload };
  });
}

export function planAssessmentImport(
  records: { sheetRow: number; values: Record<string, unknown> }[],
  ctx: {
    classes: ExistingClass[];
    subjects: ExistingSubject[];
    periods: ExistingPeriod[];
    assessments: ExistingAssessment[];
    yearId: string;
    scaleMax: number;
    mode: ImportMode;
  },
): ImportPlan[] {
  return records.map((record) => {
    const className = clip(record.values.className, 80);
    const subjectName = clip(record.values.subject, 120);
    const assessmentName = clip(record.values.assessment, 120);
    const series = parseSeries(record.values.series);
    if (!className || !subjectName || !assessmentName) return reject(record.sheetRow, "Turma, disciplina e avaliação são obrigatórias.");
    if (series === "invalid") return reject(record.sheetRow, "Série inválida.");
    const klass = matchClass(ctx.classes, ctx.yearId, className, series);
    if (klass === "ambiguous") return reject(record.sheetRow, "Turma ambígua.");
    const periodId = matchPeriod(ctx.periods.filter((period) => period.yearId === ctx.yearId), record.values.period);
    if (periodId === "invalid" || periodId === "ambiguous") return reject(record.sheetRow, "Período não reconhecido.");
    const weight = parseWeight(record.values.weight);
    if (weight === "invalid") return reject(record.sheetRow, "Peso inválido.");
    const maxParsed = parseWeight(record.values.maxScore);
    if (maxParsed === "invalid") return reject(record.sheetRow, "Nota máxima inválida.");
    const maxScore = maxParsed ?? ctx.scaleMax;
    if (maxScore > ctx.scaleMax + 1e-9) return reject(record.sheetRow, "Nota máxima acima da escala.");
    const kind = parseKind(record.values.kind);
    if (kind === "invalid") return reject(record.sheetRow, "Tipo inválido.");
    const date = parseDateCell(record.values.date);
    if (date === "invalid") return reject(record.sheetRow, "Data inválida.");
    const recoveryFlag = parseBool(record.values.recovery);
    if (recoveryFlag === "invalid") return reject(record.sheetRow, "Campo de recuperação inválido. Use sim ou não.");
    const isRecovery = recoveryFlag === true || kind === "recuperacao";
    const subject = ctx.subjects.find((item) => normalizeKey(item.name) === normalizeKey(subjectName));
    const classId = klass && klass !== "missing" ? klass.id : null;
    const existing =
      classId && subject
        ? ctx.assessments.find(
            (assessment) =>
              assessment.classId === classId &&
              assessment.subjectId === subject.id &&
              assessment.periodId === periodId &&
              normalizeKey(assessment.name) === normalizeKey(assessmentName),
          )
        : undefined;
    const payload = {
      classId,
      createClass: !classId,
      className,
      series,
      subjectId: subject?.id ?? null,
      subjectName,
      periodId,
      assessmentName,
      kind: kind ?? (isRecovery ? "recuperacao" : "prova"),
      date,
      weight: weight ?? 1,
      maxScore,
      isRecovery,
      assessmentId: existing?.id ?? null,
      yearId: ctx.yearId,
    };
    if (existing) {
      if (ctx.mode === "add") return { row: record.sheetRow, action: "ignore", message: "Avaliação já existe.", payload };
      return { row: record.sheetRow, action: "update", message: "Avaliação atualizada sem apagar notas.", payload };
    }
    if (ctx.mode === "update") return { row: record.sheetRow, action: "ignore", message: "Avaliação não encontrada.", payload };
    return { row: record.sheetRow, action: "add", message: "Nova avaliação.", payload };
  });
}

export function planQualImport(
  records: { sheetRow: number; values: Record<string, unknown> }[],
  ctx: {
    students: ExistingStudent[];
    criteria: ExistingCriterion[];
    periods: ExistingPeriod[];
    yearId: string;
    mode: ImportMode;
    allowNameMatch: boolean;
  },
): ImportPlan[] {
  return records.map((record) => {
    const fullName = clip(record.values.fullName, 160);
    const enrollment = cleanEnrollment(record.values.enrollment);
    const criterionName = clip(record.values.criterion, 160);
    const level = clip(record.values.level, 80);
    const comment = clip(record.values.comment, 2000);
    if (!criterionName || !level) return reject(record.sheetRow, "Critério e nível são obrigatórios.");
    const student = matchStudent(ctx.students, fullName, enrollment, ctx.allowNameMatch);
    if (student.status === "ambiguous" || student.status === "needs-confirm") {
      return { row: record.sheetRow, action: student.status === "ambiguous" ? "reject" : "ignore", message: student.message, payload: {} };
    }
    if (student.status === "missing") return reject(record.sheetRow, "Estudante não encontrado. Cadastre-o antes do registro qualitativo.");
    const criterion = ctx.criteria.find((item) => normalizeKey(item.name) === normalizeKey(criterionName));
    if (!criterion) return reject(record.sheetRow, `Critério "${criterionName}" não está configurado.`);
    const levelHit = criterion.scale.find((item) => normalizeKey(item) === normalizeKey(level));
    if (!levelHit) return reject(record.sheetRow, `Nível "${level}" não faz parte da escala de "${criterion.name}".`);
    const periodId = matchPeriod(ctx.periods.filter((period) => period.yearId === ctx.yearId), record.values.period);
    if (periodId === "invalid" || periodId === "ambiguous") return reject(record.sheetRow, "Período inválido.");
    const date = parseDateCell(record.values.date);
    if (date === "invalid") return reject(record.sheetRow, "Data inválida.");
    if (ctx.mode === "add") {
      return {
        row: record.sheetRow,
        action: "add",
        message: "Novo registro qualitativo.",
        payload: { studentId: student.id, criterionId: criterion.id, periodId, date, level: levelHit, comment },
      };
    }
    return {
      row: record.sheetRow,
      action: ctx.mode === "update" ? "update" : "add",
      message: "Registro qualitativo.",
      payload: { studentId: student.id, criterionId: criterion.id, periodId, date, level: levelHit, comment },
    };
  });
}

export function summarizePlans(plans: ImportPlan[]): { added: number; updated: number; ignored: number; rejected: number } {
  return {
    added: plans.filter((plan) => plan.action === "add").length,
    updated: plans.filter((plan) => plan.action === "update").length,
    ignored: plans.filter((plan) => plan.action === "ignore").length,
    rejected: plans.filter((plan) => plan.action === "reject").length,
  };
}
