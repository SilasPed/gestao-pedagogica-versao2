import {
  academicSituation,
  accumulate,
  frequencyOf,
  isPendingItem,
  neededGrade,
  periodResult,
  roundGrade,
  rulesText,
  summarizeItems,
  type CalcPolicy,
  type FreqMark,
  type FreqPolicy,
  type GradeItem,
  type MarkStatus,
  type NeededGrade,
} from "./calc.ts";
import { fmtGrade } from "./format.ts";

export type AnalyticsFilter = {
  yearId: string | null;
  series: string | null;
  classId: string | null;
  subjectId: string | null;
  periodId: string | null;
  studentId: string | null;
};

export type DomainStudent = {
  id: string;
  name: string;
  enrollment: string | null;
  classId: string | null;
  status: string;
  archived: boolean;
};

export type DomainClass = {
  id: string;
  yearId: string;
  series: string;
  name: string;
  courseId: string | null;
  passing: number | null;
  teacherName: string;
};

export type DomainPeriod = { id: string; yearId: string; ord: number; name: string };
export type DomainSubject = { id: string; name: string };
export type DomainAssessment = {
  id: string;
  classId: string;
  subjectId: string;
  periodId: string | null;
  name: string;
  date: string | null;
  kind: string;
  maxScore: number;
  weight: number;
  isRecovery: boolean;
};
export type DomainScore = {
  assessmentId: string;
  studentId: string;
  value: number | null;
  status: MarkStatus;
};
export type DomainEnrollment = {
  studentId: string;
  classId: string | null;
  yearId: string;
  status: string;
  endedOn: string | null;
};
export type DomainMark = {
  studentId: string;
  classId: string;
  subjectId: string | null;
  status: FreqMark;
};
export type DomainQual = {
  studentId: string;
  criterionId: string;
  level: string;
  date: string;
  comment: string;
  periodId: string | null;
};
export type DomainCriterion = { id: string; name: string; scale: string[]; description: string };

export type AnalyticsInput = {
  policy: CalcPolicy;
  freq: FreqPolicy;
  students: DomainStudent[];
  classes: DomainClass[];
  periods: DomainPeriod[];
  subjects: DomainSubject[];
  assessments: DomainAssessment[];
  scores: DomainScore[];
  enrollments: DomainEnrollment[];
  marks: DomainMark[];
  qualitative: DomainQual[];
  criteria: DomainCriterion[];
  courses: { id: string; name: string }[];
  filter: AnalyticsFilter;
};

export type WatchReason = { code: string; text: string };

export type DashboardModel = {
  studentCount: number;
  classCount: number;
  subjectCount: number;
  assessmentCount: number;
  generalAverage: number | null;
  satisfactoryPercent: number | null;
  gradedStudents: number;
  belowCount: number;
  pendingStudents: number;
  frequencyAverage: number | null;
  absenceCount: number;
  evolution: { periodId: string; name: string; average: number | null }[];
  distribution: { label: string; min: number; max: number; count: number }[];
  byClass: {
    classId: string;
    name: string;
    series: string;
    students: number;
    average: number | null;
    below: number;
    pending: number;
    frequency: number | null;
  }[];
  bySubject: { subjectId: string; name: string; average: number | null; pending: number }[];
  watchlist: { studentId: string; name: string; className: string; reasons: WatchReason[] }[];
  watchTotal: number;
  lowestAssessments: { id: string; name: string; subject: string; className: string; average: number | null; count: number }[];
  improved: { studentId: string; name: string; text: string }[];
  declined: { studentId: string; name: string; text: string }[];
  consistentDrops: { studentId: string; name: string; text: string }[];
  qualitativeHotspots: { criterionId: string; name: string; students: number }[];
  bestEvolution: { className: string; delta: number; text: string } | null;
  rules: string[];
};

const EMPTY_FILTER: AnalyticsFilter = {
  yearId: null,
  series: null,
  classId: null,
  subjectId: null,
  periodId: null,
  studentId: null,
};

function scoreKey(assessmentId: string, studentId: string): string {
  return `${assessmentId}:${studentId}`;
}

function toItem(assessment: DomainAssessment, score: DomainScore | undefined): GradeItem {
  const status = score?.status ?? "pending";
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
}

function classLabel(klass: DomainClass | undefined): string {
  if (!klass) return "Sem turma";
  const series = klass.series === "1" ? "1º" : klass.series === "2" ? "2º" : klass.series === "3" ? "3º" : klass.series;
  return `${series} ${klass.name}`;
}

export function buildDashboard(input: AnalyticsInput): DashboardModel {
  const { policy, freq } = input;
  const filter = { ...EMPTY_FILTER, ...input.filter };
  const classes = input.classes.filter((klass) => {
    if (filter.yearId && klass.yearId !== filter.yearId) return false;
    if (filter.series && klass.series !== filter.series) return false;
    if (filter.classId && klass.id !== filter.classId) return false;
    return true;
  });
  const classIds = new Set(classes.map((klass) => klass.id));
  const periods = input.periods
    .filter((period) => !filter.yearId || period.yearId === filter.yearId)
    .filter((period) => classes.some((klass) => klass.yearId === period.yearId))
    .sort((a, b) => a.ord - b.ord);
  const focusPeriods = filter.periodId ? periods.filter((period) => period.id === filter.periodId) : periods;
  const assessments = input.assessments.filter((assessment) => {
    if (!classIds.has(assessment.classId)) return false;
    if (filter.subjectId && assessment.subjectId !== filter.subjectId) return false;
    return true;
  });
  const headlineAssessments = filter.periodId
    ? assessments.filter((assessment) => assessment.periodId === filter.periodId)
    : assessments;
  const subjects = input.subjects.filter(
    (subject) => !filter.subjectId || subject.id === filter.subjectId,
  );
  const scoreMap = new Map(input.scores.map((score) => [scoreKey(score.assessmentId, score.studentId), score]));
  const activeEnrollment = input.enrollments.filter(
    (enrollment) =>
      enrollment.status === "ativo" &&
      !enrollment.endedOn &&
      enrollment.classId &&
      classIds.has(enrollment.classId),
  );

  const membersByClass = new Map<string, string[]>();
  const studentClass = new Map<string, string>();
  for (const enrollment of activeEnrollment) {
    if (!enrollment.classId) continue;
    const list = membersByClass.get(enrollment.classId) ?? [];
    list.push(enrollment.studentId);
    membersByClass.set(enrollment.classId, list);
    if (!studentClass.has(enrollment.studentId)) studentClass.set(enrollment.studentId, enrollment.classId);
  }
  for (const student of input.students) {
    if (student.archived || student.status !== "ativo" || !student.classId || !classIds.has(student.classId)) continue;
    if (studentClass.has(student.id)) continue;
    studentClass.set(student.id, student.classId);
    const list = membersByClass.get(student.classId) ?? [];
    list.push(student.id);
    membersByClass.set(student.classId, list);
  }

  let studentIds = [...studentClass.keys()];
  if (filter.studentId) studentIds = studentIds.filter((id) => id === filter.studentId);
  const studentById = new Map(input.students.map((student) => [student.id, student]));
  studentIds = studentIds.filter((id) => {
    const student = studentById.get(id);
    return student && !student.archived && student.status === "ativo";
  });

  const margin = roundGrade(policy.scaleMax * 0.05);
  const subjectName = new Map(input.subjects.map((subject) => [subject.id, subject.name]));
  const classById = new Map(input.classes.map((klass) => [klass.id, klass]));

  type Row = {
    studentId: string;
    name: string;
    classId: string;
    passing: number;
    average: number | null;
    pending: boolean;
    closed: boolean;
    evolution: { periodId: string; average: number | null }[];
    frequency: ReturnType<typeof frequencyOf> | null;
    items: GradeItem[];
  };

  const rows: Row[] = studentIds.map((studentId) => {
    const student = studentById.get(studentId)!;
    const classId = studentClass.get(studentId)!;
    const klass = classById.get(classId);
    const currentItems = headlineAssessments
      .filter((assessment) => assessment.classId === classId)
      .map((assessment) => toItem(assessment, scoreMap.get(scoreKey(assessment.id, studentId))));
    const summary = summarizeItems(currentItems, focusPeriods, policy);
    const yearItems = assessments
      .filter((assessment) => assessment.classId === classId)
      .map((assessment) => toItem(assessment, scoreMap.get(scoreKey(assessment.id, studentId))));
    const evolution = periods.map((period) => {
      const slice = yearItems.filter((item) => item.periodId === period.id);
      return { periodId: period.id, average: summarizeItems(slice, [period], policy).average };
    });
    const studentMarks = input.marks.filter(
      (mark) =>
        mark.studentId === studentId &&
        mark.classId === classId &&
        (!filter.subjectId || mark.subjectId === filter.subjectId),
    );
    const frequency = studentMarks.length ? frequencyOf(studentMarks.map((mark) => mark.status), freq) : null;
    return {
      studentId,
      name: student.name,
      classId,
      passing: klass?.passing ?? policy.passing,
      average: summary.average,
      pending: summary.pending,
      closed: summary.closed,
      evolution,
      frequency,
      items: currentItems,
    };
  });

  const graded = rows.filter((row) => row.average != null);
  const generalAverage = graded.length
    ? roundGrade(graded.reduce((sum, row) => sum + (row.average ?? 0), 0) / graded.length)
    : null;
  const satisfactory = graded.filter((row) => (row.average ?? 0) + 1e-9 >= row.passing);
  const below = graded.filter((row) => (row.average ?? 0) + 1e-9 < row.passing);
  const pendingStudents = rows.filter((row) => row.pending).length;
  const freqRows = rows.filter((row) => row.frequency?.percent != null);
  const frequencyAverage = freqRows.length
    ? roundGrade(freqRows.reduce((sum, row) => sum + (row.frequency?.percent ?? 0), 0) / freqRows.length)
    : null;
  const absenceCount = rows.reduce((sum, row) => sum + (row.frequency?.absences ?? 0), 0);

  const bands = 5;
  const size = policy.scaleMax / bands;
  const distribution = Array.from({ length: bands }, (_, index) => {
    const min = roundGrade(index * size);
    const max = roundGrade((index + 1) * size);
    const count = graded.filter((row) => {
      const value = row.average ?? 0;
      return index === bands - 1 ? value >= min && value <= max + 1e-9 : value >= min && value < max;
    }).length;
    return { label: `${fmtGrade(min)}–${fmtGrade(max)}`, min, max, count };
  });

  const evolution = periods.map((period) => {
    const vals = rows
      .map((row) => row.evolution.find((item) => item.periodId === period.id)?.average)
      .filter((value): value is number => value != null);
    return {
      periodId: period.id,
      name: period.name,
      average: vals.length ? roundGrade(vals.reduce((sum, value) => sum + value, 0) / vals.length) : null,
    };
  });

  const byClass = classes.map((klass) => {
    const members = rows.filter((row) => row.classId === klass.id);
    const withAvg = members.filter((row) => row.average != null);
    const freqMembers = members.filter((row) => row.frequency?.percent != null);
    return {
      classId: klass.id,
      name: classLabel(klass),
      series: klass.series,
      students: members.length,
      average: withAvg.length
        ? roundGrade(withAvg.reduce((sum, row) => sum + (row.average ?? 0), 0) / withAvg.length)
        : null,
      below: withAvg.filter((row) => (row.average ?? 0) + 1e-9 < (klass.passing ?? policy.passing)).length,
      pending: members.filter((row) => row.pending).length,
      frequency: freqMembers.length
        ? roundGrade(freqMembers.reduce((sum, row) => sum + (row.frequency?.percent ?? 0), 0) / freqMembers.length)
        : null,
    };
  });

  const bySubject = subjects
    .map((subject) => {
      const vals: number[] = [];
      let pending = 0;
      for (const row of rows) {
        const sub = summarizeItems(
          row.items.filter((item) => item.subjectId === subject.id),
          focusPeriods,
          policy,
        );
        if (sub.average != null) vals.push(sub.average);
        if (sub.pending) pending += 1;
      }
      return {
        subjectId: subject.id,
        name: subject.name,
        average: vals.length ? roundGrade(vals.reduce((sum, value) => sum + value, 0) / vals.length) : null,
        pending,
      };
    })
    .filter((subject) => subject.average != null || subject.pending > 0);

  const lowestAssessments = headlineAssessments
    .map((assessment) => {
      const gradedScores = input.scores.filter(
        (score) => score.assessmentId === assessment.id && score.status === "graded" && score.value != null,
      );
      const normalized = gradedScores.map((score) =>
        roundGrade(((score.value ?? 0) / assessment.maxScore) * policy.scaleMax),
      );
      return {
        id: assessment.id,
        name: assessment.name,
        subject: subjectName.get(assessment.subjectId) ?? "Disciplina",
        className: classLabel(classById.get(assessment.classId)),
        average: normalized.length ? roundGrade(normalized.reduce((sum, value) => sum + value, 0) / normalized.length) : null,
        count: normalized.length,
      };
    })
    .filter((assessment) => assessment.average != null)
    .sort((a, b) => (a.average ?? 0) - (b.average ?? 0))
    .slice(0, 8);

  const improved: DashboardModel["improved"] = [];
  const declined: DashboardModel["declined"] = [];
  const consistentDrops: DashboardModel["consistentDrops"] = [];
  const watch: DashboardModel["watchlist"] = [];

  const latestQual = new Map<string, DomainQual>();
  const qualSorted = [...input.qualitative].sort((a, b) => b.date.localeCompare(a.date));
  for (const record of qualSorted) {
    const key = `${record.studentId}:${record.criterionId}`;
    if (!latestQual.has(key)) latestQual.set(key, record);
  }
  const hotspot = new Map<string, Set<string>>();

  for (const row of rows) {
    const reasons: WatchReason[] = [];
    const defined = row.evolution.filter((item) => item.average != null);
    const drops: string[] = [];
    for (let i = 1; i < defined.length; i += 1) {
      const prev = defined[i - 1];
      const next = defined[i];
      const delta = (next.average ?? 0) - (prev.average ?? 0);
      const prevName = periods.find((period) => period.id === prev.periodId)?.name ?? "período";
      const nextName = periods.find((period) => period.id === next.periodId)?.name ?? "período";
      if (delta <= -margin) {
        const text = `A média passou de ${fmtGrade(prev.average)} em ${prevName} para ${fmtGrade(next.average)} em ${nextName} (queda de ${fmtGrade(Math.abs(delta))}; a regra usa queda de pelo menos ${fmtGrade(margin)}).`;
        declined.push({ studentId: row.studentId, name: row.name, text });
        drops.push(text);
      } else if (delta >= margin) {
        improved.push({
          studentId: row.studentId,
          name: row.name,
          text: `A média passou de ${fmtGrade(prev.average)} em ${prevName} para ${fmtGrade(next.average)} em ${nextName} (alta de ${fmtGrade(delta)}).`,
        });
      }
    }
    if (drops.length >= 2) {
      const text = `Queda em períodos seguidos: ${drops.slice(-2).join(" ")}`;
      consistentDrops.push({ studentId: row.studentId, name: row.name, text });
      reasons.push({ code: "queda", text });
    }
    if (row.average != null && row.average + 1e-9 < row.passing) {
      reasons.push({
        code: "media",
        text: `Média ${fmtGrade(row.average)} abaixo da mínima ${fmtGrade(row.passing)} na escala da escola. O cálculo ignora lançamentos em branco.`,
      });
    }
    if (row.pending) {
      const names = row.items.filter(isPendingItem).slice(0, 3).map((item) => item.name);
      reasons.push({
        code: "pendente",
        text: `Há avaliação sem nota lançada${names.length ? `: ${names.join(", ")}` : ""}. Célula vazia não foi convertida em zero.`,
      });
    }
    if (row.frequency?.percent != null && row.frequency.percent + 1e-9 < freq.minimum) {
      reasons.push({
        code: "frequencia",
        text: `Frequência ${fmtGrade(row.frequency.percent)}% nas aulas já registradas, abaixo do mínimo de ${fmtGrade(freq.minimum)}%. Aulas sem registro não entram como falta.`,
      });
    }
    for (const criterion of input.criteria) {
      const record = latestQual.get(`${row.studentId}:${criterion.id}`);
      if (!record) continue;
      const lowest = criterion.scale[criterion.scale.length - 1];
      if (lowest && record.level.trim().toLowerCase() === lowest.trim().toLowerCase()) {
        const set = hotspot.get(criterion.id) ?? new Set<string>();
        set.add(row.studentId);
        hotspot.set(criterion.id, set);
        reasons.push({
          code: "qualitativo",
          text: `No critério "${criterion.name}", o registro mais recente (${record.date}) está em "${record.level}", o último nível da escala configurada.`,
        });
      }
    }
    const absents = row.items.filter((item) => item.status === "absent");
    if (absents.length && !policy.absenceCountsAsZero) {
      reasons.push({
        code: "ausencia",
        text: `Há ausência em ${absents
          .slice(0, 2)
          .map((item) => item.name)
          .join(", ")}. Essa ausência não entrou como zero.`,
      });
    }
    if (reasons.length) {
      watch.push({
        studentId: row.studentId,
        name: row.name,
        className: classLabel(classById.get(row.classId)),
        reasons,
      });
    }
  }

  watch.sort((a, b) => b.reasons.length - a.reasons.length || a.name.localeCompare(b.name, "pt-BR"));

  const classEvolution = classes
    .map((klass) => {
      const members = rows.filter((row) => row.classId === klass.id);
      const points = periods.map((period) => {
        const vals = members
          .map((row) => row.evolution.find((item) => item.periodId === period.id)?.average)
          .filter((value): value is number => value != null);
        return vals.length ? vals.reduce((sum, value) => sum + value, 0) / vals.length : null;
      });
      const defined = points.filter((value): value is number => value != null);
      if (defined.length < 2) return null;
      const delta = roundGrade(defined[defined.length - 1] - defined[0]);
      return { className: classLabel(klass), delta };
    })
    .filter((item): item is { className: string; delta: number } => item != null)
    .sort((a, b) => b.delta - a.delta);

  const best = classEvolution[0];
  return {
    studentCount: rows.length,
    classCount: classes.length,
    subjectCount: new Set(headlineAssessments.map((assessment) => assessment.subjectId)).size || subjects.length,
    assessmentCount: headlineAssessments.length,
    generalAverage,
    satisfactoryPercent: graded.length ? roundGrade((satisfactory.length / graded.length) * 100) : null,
    gradedStudents: graded.length,
    belowCount: below.length,
    pendingStudents,
    frequencyAverage,
    absenceCount,
    evolution,
    distribution,
    byClass,
    bySubject,
    watchlist: watch.slice(0, 40),
    watchTotal: watch.length,
    lowestAssessments,
    improved,
    declined,
    consistentDrops,
    qualitativeHotspots: input.criteria
      .map((criterion) => ({
        criterionId: criterion.id,
        name: criterion.name,
        students: hotspot.get(criterion.id)?.size ?? 0,
      }))
      .filter((item) => item.students > 0)
      .sort((a, b) => b.students - a.students),
    bestEvolution: best
      ? {
          ...best,
          text: `${best.className} variou ${best.delta >= 0 ? "+" : ""}${fmtGrade(best.delta)} do primeiro ao último período com média.`,
        }
      : null,
    rules: rulesText(policy),
  };
}

export type StudentView = {
  situation: { label: string; tone: "ok" | "bad" | "muted" | "warn" };
  average: number | null;
  passing: number;
  frequency: { percent: number | null; absences: number; considered: number; minimum: number } | null;
  evolution: { period: string; average: number | null }[];
  subjects: {
    id: string;
    name: string;
    accumulated: number | null;
    pending: boolean;
    periods: {
      id: string;
      name: string;
      base: number | null;
      recovery: number | null;
      final: number | null;
      pending: boolean;
      needed: NeededGrade;
    }[];
  }[];
  assessments: {
    id: string;
    name: string;
    subject: string;
    period: string;
    date: string | null;
    kind: string;
    maxScore: number;
    weight: number;
    isRecovery: boolean;
    value: number | null;
    status: MarkStatus;
  }[];
  qualitative: { id?: string; date: string; criterion: string; level: string; comment: string; period: string | null }[];
  comparisons: string[];
  rules: string[];
};

export function buildStudentView(
  input: AnalyticsInput & { studentId: string; qualLabels?: { id?: string; date: string; criterion: string; level: string; comment: string; period: string | null }[] },
): StudentView | null {
  const student = input.students.find((item) => item.id === input.studentId);
  if (!student) return null;
  const yearId = input.filter.yearId;
  const classes = input.classes.filter((klass) => !yearId || klass.yearId === yearId);
  const classIds = new Set(classes.map((klass) => klass.id));
  const enrollClass =
    input.enrollments.find(
      (enrollment) =>
        enrollment.studentId === student.id &&
        enrollment.status === "ativo" &&
        !enrollment.endedOn &&
        enrollment.classId &&
        classIds.has(enrollment.classId),
    )?.classId ?? (student.classId && classIds.has(student.classId) ? student.classId : null);
  const scoreMap = new Map(input.scores.filter((score) => score.studentId === student.id).map((score) => [score.assessmentId, score]));
  const applicable = input.assessments.filter((assessment) => {
    if (!classIds.has(assessment.classId)) return false;
    if (input.filter.subjectId && assessment.subjectId !== input.filter.subjectId) return false;
    const hasScore = scoreMap.has(assessment.id);
    return hasScore || assessment.classId === enrollClass;
  });
  const items = applicable.map((assessment) => toItem(assessment, scoreMap.get(assessment.id)));
  const periods = input.periods
    .filter((period) => !yearId || period.yearId === yearId)
    .sort((a, b) => a.ord - b.ord);
  const summary = summarizeItems(items, periods, input.policy);
  const klass = classes.find((item) => item.id === enrollClass);
  const passing = klass?.passing ?? input.policy.passing;
  const marks = input.marks.filter((mark) => mark.studentId === student.id && (!yearId || classIds.has(mark.classId)));
  const frequency = marks.length ? frequencyOf(marks.map((mark) => mark.status), input.freq) : null;
  const situation = academicSituation({
    average: summary.average,
    pending: summary.pending,
    passing,
    closed: summary.closed,
    frequencyPercent: frequency?.percent ?? null,
    frequencyMin: input.freq.minimum,
  });
  const subjectName = new Map(input.subjects.map((subject) => [subject.id, subject.name]));
  const periodName = new Map(periods.map((period) => [period.id, period.name]));
  const subjects = summary.bySubject.map((subject) => ({
    id: subject.subjectId,
    name: subjectName.get(subject.subjectId) ?? "Disciplina",
    accumulated: subject.average,
    pending: subject.pending,
    periods: subject.periods
      .filter((result) => periods.some((period) => period.id === result.periodId))
      .map((result) => ({
        id: result.periodId,
        name: periodName.get(result.periodId) ?? "Período",
        base: result.base,
        recovery: result.recovery,
        final: result.final,
        pending: result.pending,
        needed: neededGrade(
          items.filter((item) => item.subjectId === subject.subjectId),
          result.periodId,
          input.policy,
        ),
      })),
  }));
  const comparisons: string[] = [];
  for (const subject of subjects) {
    const defined = subject.periods.filter((period) => period.final != null);
    for (let i = 1; i < defined.length; i += 1) {
      const prev = defined[i - 1];
      const next = defined[i];
      const delta = roundGrade((next.final ?? 0) - (prev.final ?? 0));
      const sign = delta > 0 ? "+" : "";
      comparisons.push(
        `Em ${subject.name}, o próprio resultado passou de ${fmtGrade(prev.final)} em ${prev.name} para ${fmtGrade(next.final)} em ${next.name} (${sign}${fmtGrade(delta)}).`,
      );
    }
  }
  if (!comparisons.length) {
    comparisons.push("Ainda não há dois períodos com nota para comparar a evolução deste estudante consigo mesmo.");
  }
  const evolution = periods.map((period) => ({
    period: period.name,
    average: summarizeItems(
      items.filter((item) => item.periodId === period.id),
      [period],
      input.policy,
    ).average,
  }));
  return {
    situation,
    average: summary.average,
    passing,
    frequency: frequency
      ? {
          percent: frequency.percent,
          absences: frequency.absences,
          considered: frequency.considered,
          minimum: input.freq.minimum,
        }
      : null,
    evolution,
    subjects,
    assessments: applicable
      .map((assessment) => {
        const item = toItem(assessment, scoreMap.get(assessment.id));
        return {
          id: assessment.id,
          name: assessment.name,
          subject: subjectName.get(assessment.subjectId) ?? "Disciplina",
          period: assessment.periodId ? (periodName.get(assessment.periodId) ?? "—") : "—",
          date: assessment.date,
          kind: assessment.kind,
          maxScore: assessment.maxScore,
          weight: assessment.weight,
          isRecovery: assessment.isRecovery,
          value: item.value,
          status: item.status,
        };
      })
      .sort((a, b) => a.subject.localeCompare(b.subject, "pt-BR") || a.period.localeCompare(b.period, "pt-BR")),
    qualitative: input.qualLabels ?? [],
    comparisons,
    rules: rulesText(input.policy),
  };
}

export function periodFinals(
  items: GradeItem[],
  periodId: string,
  policy: CalcPolicy,
): ReturnType<typeof periodResult> {
  return periodResult(items, periodId, policy);
}

export function meanOf(values: number[]): number | null {
  if (!values.length) return null;
  return roundGrade(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export { accumulate };
