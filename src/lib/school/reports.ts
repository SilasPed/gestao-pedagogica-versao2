import type { AnalyticsInput } from "./analytics.ts";
import { buildDashboard, buildStudentView } from "./analytics.ts";
import { academicSituation, periodResult, roundGrade, summarizeItems, type GradeItem, type MarkStatus } from "./calc.ts";
import { fmtGrade, seriesLabel } from "./format.ts";
import { ASSESSMENT_KINDS, FREQ_MARKS, MARK_STATUSES, STUDENT_STATUSES } from "./constants.ts";

export type ExportKind =
  | "students"
  | "gradebook"
  | "report_cards"
  | "period_results"
  | "qualitative"
  | "frequency"
  | "below_average"
  | "recovery"
  | "class_overview"
  | "annual_history";

export const EXPORT_COLUMNS: Record<ExportKind, string[]> = {
  students: ["Nome completo", "Matrícula", "Ano letivo", "Série", "Turma", "Curso técnico", "Situação", "Observações"],
  gradebook: ["Nome", "Matrícula", "Turma", "Disciplina", "Período", "Avaliação", "Tipo", "Data", "Nota máxima", "Peso", "Nota", "Situação da nota", "Resultado do período", "Situação acadêmica"],
  report_cards: ["Nome", "Matrícula", "Turma", "Disciplina", "Período", "Média regular", "Recuperação", "Resultado", "Situação"],
  period_results: ["Nome", "Matrícula", "Turma", "Disciplina", "Período", "Média regular", "Recuperação", "Resultado", "Pendência", "Situação"],
  qualitative: ["Nome", "Matrícula", "Turma", "Critério", "Período", "Data", "Nível", "Comentário"],
  frequency: ["Nome", "Matrícula", "Turma", "Disciplina", "Data", "Aula", "Registro"],
  below_average: ["Nome", "Matrícula", "Turma", "Média", "Média mínima", "Diferença", "Motivo"],
  recovery: ["Nome", "Matrícula", "Turma", "Disciplina", "Período", "Média regular", "Recuperação", "Resultado", "Nota necessária"],
  class_overview: ["Turma", "Série", "Alunos", "Média", "Abaixo da média", "Pendências", "Frequência média"],
  annual_history: ["Nome", "Matrícula", "Ano", "Turma", "Disciplina", "Período", "Resultado", "Média acumulada", "Situação"],
};

export type Sheet = { name: string; rows: (string | number | null)[][] };

export type Bulletin = {
  studentId: string;
  studentName: string;
  enrollment: string;
  className: string;
  course: string;
  year: string;
  situation: string;
  average: string;
  frequency: string;
  rows: { subject: string; period: string; regular: string; recovery: string; final: string; situation: string }[];
  comparisons: string[];
  qualitative: { criterion: string; level: string; comment: string }[];
};

export type ReportBundle = {
  title: string;
  sheets: Sheet[];
  bulletins: Bulletin[];
};

const NOTE_HEADERS = new Set(["Observações", "Comentário"]);

export function filterColumns(sheet: Sheet, columns: string[] | null, includeNotes: boolean): Sheet {
  const header = (sheet.rows[0] ?? []).map((cell) => String(cell ?? ""));
  const keep = header.map((name) => {
    if (!includeNotes && NOTE_HEADERS.has(name)) return false;
    if (columns && columns.length > 0 && !columns.includes(name)) return false;
    return true;
  });
  return {
    name: sheet.name,
    rows: sheet.rows.map((row) => row.filter((_, index) => keep[index] !== false)),
  };
}

function labelOf(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? id;
}

function classNameOf(input: AnalyticsInput, classId: string | null): string {
  const klass = input.classes.find((item) => item.id === classId);
  if (!klass) return "—";
  return `${seriesLabel(klass.series)} ${klass.name}`;
}

export function buildReport(
  input: AnalyticsInput & {
    kind: ExportKind;
    includeNotes: boolean;
    columns: string[] | null;
    schoolName: string;
    yearLabel: string;
    notes: Record<string, string>;
    courseName: Record<string, string>;
    sessions: { id: string; classId: string; subjectId: string | null; date: string; label: string; studentId: string; status: string }[];
    qualRecords: { studentId: string; criterion: string; period: string | null; date: string; level: string; comment: string }[];
  },
): ReportBundle {
  const dash = buildDashboard(input);
  const titleBase = `${input.schoolName} · ${input.yearLabel || "Ano letivo"}`;
  let sheets: Sheet[] = [];
  let bulletins: Bulletin[] = [];
  let title = titleBase;

  if (input.kind === "students") {
    title = `Lista de estudantes · ${titleBase}`;
    const header = EXPORT_COLUMNS.students;
    const rows = input.students
      .filter((student) => !student.archived && inFilterStudent(input, student.id, student.classId))
      .map((student) => [
        student.name,
        student.enrollment ?? "",
        input.yearLabel,
        seriesLabel(input.classes.find((klass) => klass.id === student.classId)?.series ?? null),
        classNameOf(input, student.classId),
        input.courseName[input.classes.find((klass) => klass.id === student.classId)?.courseId ?? ""] ?? "",
        labelOf(STUDENT_STATUSES, student.status),
        input.notes[student.id] ?? "",
      ]);
    sheets = [{ name: "Estudantes", rows: [header, ...rows] }];
  }

  if (input.kind === "class_overview") {
    title = `Visão da turma · ${titleBase}`;
    sheets = [
      {
        name: "Turmas",
        rows: [
          EXPORT_COLUMNS.class_overview,
          ...dash.byClass.map((row) => [
            row.name,
            seriesLabel(row.series),
            row.students,
            row.average == null ? "" : fmtGrade(row.average),
            row.below,
            row.pending,
            row.frequency == null ? "" : fmtGrade(row.frequency),
          ]),
        ],
      },
    ];
  }

  if (input.kind === "below_average") {
    title = `Abaixo da média · ${titleBase}`;
    const header = EXPORT_COLUMNS.below_average;
    const body = dash.watchlist
      .filter((item) => item.reasons.some((reason) => reason.code === "media"))
      .map((item) => {
        const reason = item.reasons.find((entry) => entry.code === "media");
        const student = input.students.find((entry) => entry.id === item.studentId);
        const view = buildStudentView({ ...input, studentId: item.studentId });
        const diff = view?.average != null ? roundGrade(view.average - (view.passing ?? input.policy.passing)) : null;
        return [
          item.name,
          student?.enrollment ?? "",
          item.className,
          view?.average == null ? "" : fmtGrade(view.average),
          fmtGrade(view?.passing ?? input.policy.passing),
          diff == null ? "" : fmtGrade(diff),
          reason?.text ?? "",
        ];
      });
    sheets = [{ name: "Abaixo da média", rows: [header, ...body] }];
  }

  if (input.kind === "qualitative") {
    title = `Avaliação qualitativa · ${titleBase}`;
    const header = EXPORT_COLUMNS.qualitative;
    const body = input.qualRecords
      .filter((record) => {
        const student = input.students.find((item) => item.id === record.studentId);
        return student ? inFilterStudent(input, student.id, student.classId) : false;
      })
      .map((record) => {
        const student = input.students.find((item) => item.id === record.studentId);
        return [
          student?.name ?? "",
          student?.enrollment ?? "",
          classNameOf(input, student?.classId ?? null),
          record.criterion,
          record.period ?? "",
          record.date,
          record.level,
          record.comment,
        ];
      });
    sheets = [{ name: "Qualitativa", rows: [header, ...body] }];
  }

  if (input.kind === "frequency") {
    title = `Frequência · ${titleBase}`;
    const header = EXPORT_COLUMNS.frequency;
    const body = input.sessions
      .filter((session) => {
        if (input.filter.classId && session.classId !== input.filter.classId) return false;
        if (input.filter.subjectId && session.subjectId !== input.filter.subjectId) return false;
        return input.classes.some((klass) => klass.id === session.classId && (!input.filter.yearId || klass.yearId === input.filter.yearId));
      })
      .map((session) => {
        const student = input.students.find((item) => item.id === session.studentId);
        const subject = input.subjects.find((item) => item.id === session.subjectId);
        return [
          student?.name ?? "",
          student?.enrollment ?? "",
          classNameOf(input, session.classId),
          subject?.name ?? "",
          session.date,
          session.label,
          labelOf(FREQ_MARKS, session.status),
        ];
      });
    sheets = [{ name: "Frequência", rows: [header, ...body] }];
  }

  const gradeSheets = input.kind === "gradebook" || input.kind === "period_results" || input.kind === "recovery" || input.kind === "annual_history" || input.kind === "report_cards";
  if (gradeSheets) {
    const lines = gradeLines(input);
    if (input.kind === "gradebook") {
      title = `Diário de notas · ${titleBase}`;
      sheets = [{ name: "Diário", rows: [EXPORT_COLUMNS.gradebook, ...lines.launches] }];
    }
    if (input.kind === "period_results") {
      title = `Resultados por período · ${titleBase}`;
      sheets = [{ name: "Períodos", rows: [EXPORT_COLUMNS.period_results, ...lines.periods] }];
    }
    if (input.kind === "recovery") {
      title = `Recuperação · ${titleBase}`;
      sheets = [{ name: "Recuperação", rows: [EXPORT_COLUMNS.recovery, ...lines.recovery] }];
    }
    if (input.kind === "annual_history") {
      title = `Histórico anual · ${titleBase}`;
      sheets = [{ name: "Histórico", rows: [EXPORT_COLUMNS.annual_history, ...lines.history] }];
    }
    if (input.kind === "report_cards") {
      title = `Boletins · ${titleBase}`;
      sheets = [{ name: "Boletins", rows: [EXPORT_COLUMNS.report_cards, ...lines.cards] }];
      bulletins = lines.bulletins;
    }
  }

  return {
    title,
    sheets: sheets.map((sheet) => filterColumns(sheet, input.columns, input.includeNotes)),
    bulletins: input.includeNotes ? bulletins : bulletins.map((bulletin) => ({ ...bulletin, qualitative: [] })),
  };
}

function inFilterStudent(input: AnalyticsInput, studentId: string, classId: string | null): boolean {
  if (input.filter.studentId && input.filter.studentId !== studentId) return false;
  if (!classId) return !input.filter.classId && !input.filter.series;
  const klass = input.classes.find((item) => item.id === classId);
  if (!klass) return false;
  if (input.filter.yearId && klass.yearId !== input.filter.yearId) return false;
  if (input.filter.series && klass.series !== input.filter.series) return false;
  if (input.filter.classId && klass.id !== input.filter.classId) return false;
  return true;
}

function gradeLines(input: AnalyticsInput & { yearLabel: string; courseName: Record<string, string>; qualRecords: { studentId: string; criterion: string; level: string; comment: string }[] }) {
  const launches: (string | number | null)[][] = [];
  const periods: (string | number | null)[][] = [];
  const recovery: (string | number | null)[][] = [];
  const history: (string | number | null)[][] = [];
  const cards: (string | number | null)[][] = [];
  const bulletins: Bulletin[] = [];
  const scoreMap = new Map(input.scores.map((score) => [`${score.assessmentId}:${score.studentId}`, score]));
  const students = input.students.filter((student) => !student.archived && student.status === "ativo" && inFilterStudent(input, student.id, student.classId));
  for (const student of students) {
    const klass = input.classes.find((item) => item.id === student.classId);
    if (!klass) continue;
    const assessments = input.assessments.filter((assessment) => {
      if (assessment.classId !== klass.id) return false;
      if (input.filter.subjectId && assessment.subjectId !== input.filter.subjectId) return false;
      if (input.filter.periodId && assessment.periodId !== input.filter.periodId) return false;
      return true;
    });
    const items: GradeItem[] = assessments.map((assessment) => {
      const score = scoreMap.get(`${assessment.id}:${student.id}`);
      const status = (score?.status ?? "pending") as MarkStatus;
      const value = status === "graded" ? (score?.value ?? null) : null;
      return {
        assessmentId: assessment.id,
        name: assessment.name,
        periodId: assessment.periodId,
        subjectId: assessment.subjectId,
        classId: assessment.classId,
        weight: assessment.weight,
        maxScore: assessment.maxScore,
        isRecovery: assessment.isRecovery,
        value,
        status: status === "graded" && value == null ? "pending" : status,
      };
    });
    const yearPeriods = input.periods.filter((period) => period.yearId === klass.yearId).sort((a, b) => a.ord - b.ord);
    const summary = summarizeItems(items, yearPeriods, input.policy);
    const situation = academicSituation({
      average: summary.average,
      pending: summary.pending,
      passing: klass.passing ?? input.policy.passing,
      closed: summary.closed,
      frequencyPercent: null,
      frequencyMin: input.freq.minimum,
    });
    for (const assessment of assessments) {
      const item = items.find((entry) => entry.assessmentId === assessment.id)!;
      const subject = input.subjects.find((entry) => entry.id === assessment.subjectId);
      const period = yearPeriods.find((entry) => entry.id === assessment.periodId);
      const result = assessment.periodId ? periodResult(items.filter((entry) => entry.subjectId === assessment.subjectId), assessment.periodId, input.policy) : null;
      launches.push([
        student.name,
        student.enrollment ?? "",
        `${seriesLabel(klass.series)} ${klass.name}`,
        subject?.name ?? "",
        period?.name ?? "",
        assessment.name,
        labelOf(ASSESSMENT_KINDS, assessment.kind),
        assessment.date ?? "",
        assessment.maxScore,
        assessment.weight,
        item.status === "graded" ? fmtGrade(item.value) : "",
        labelOf(MARK_STATUSES, item.status),
        result?.final == null ? "" : fmtGrade(result.final),
        situation.label,
      ]);
    }
    for (const subject of summary.bySubject) {
      const subjectName = input.subjects.find((entry) => entry.id === subject.subjectId)?.name ?? "";
      for (const result of subject.periods) {
        const period = yearPeriods.find((entry) => entry.id === result.periodId);
        if (!period) continue;
        if (input.filter.periodId && period.id !== input.filter.periodId) continue;
        const needed = result.final != null && result.final + 1e-9 < (klass.passing ?? input.policy.passing);
        periods.push([
          student.name,
          student.enrollment ?? "",
          `${seriesLabel(klass.series)} ${klass.name}`,
          subjectName,
          period.name,
          result.base == null ? "" : fmtGrade(result.base),
          result.recovery == null ? "" : fmtGrade(result.recovery),
          result.final == null ? "" : fmtGrade(result.final),
          result.pending ? "Sim" : "Não",
          situation.label,
        ]);
        if (result.recovery != null || needed) {
          recovery.push([
            student.name,
            student.enrollment ?? "",
            `${seriesLabel(klass.series)} ${klass.name}`,
            subjectName,
            period.name,
            result.base == null ? "" : fmtGrade(result.base),
            result.recovery == null ? "" : fmtGrade(result.recovery),
            result.final == null ? "" : fmtGrade(result.final),
            needed ? fmtGrade(klass.passing ?? input.policy.passing) : "",
          ]);
        }
        history.push([
          student.name,
          student.enrollment ?? "",
          input.yearLabel,
          `${seriesLabel(klass.series)} ${klass.name}`,
          subjectName,
          period.name,
          result.final == null ? "" : fmtGrade(result.final),
          subject.average == null ? "" : fmtGrade(subject.average),
          situation.label,
        ]);
        cards.push([
          student.name,
          student.enrollment ?? "",
          `${seriesLabel(klass.series)} ${klass.name}`,
          subjectName,
          period.name,
          result.base == null ? "" : fmtGrade(result.base),
          result.recovery == null ? "" : fmtGrade(result.recovery),
          result.final == null ? "" : fmtGrade(result.final),
          situation.label,
        ]);
      }
    }
    const view = buildStudentView({ ...input, studentId: student.id });
    bulletins.push({
      studentId: student.id,
      studentName: student.name,
      enrollment: student.enrollment ?? "—",
      className: `${seriesLabel(klass.series)} ${klass.name}`,
      course: input.courseName[klass.courseId ?? ""] ?? "—",
      year: input.yearLabel,
      situation: situation.label,
      average: summary.average == null ? "—" : fmtGrade(summary.average),
      frequency: "—",
      rows: cards
        .filter((row) => row[0] === student.name)
        .map((row) => ({
          subject: String(row[3] ?? ""),
          period: String(row[4] ?? ""),
          regular: String(row[5] ?? ""),
          recovery: String(row[6] ?? ""),
          final: String(row[7] ?? ""),
          situation: String(row[8] ?? ""),
        })),
      comparisons: view?.comparisons ?? [],
      qualitative: input.qualRecords
        .filter((record) => record.studentId === student.id)
        .map((record) => ({ criterion: record.criterion, level: record.level, comment: record.comment })),
    });
  }
  return { launches, periods, recovery, history, cards, bulletins };
}
