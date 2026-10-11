import { getSql, type Sql } from "@/lib/db";
import { buildDashboard, buildStudentView, type AnalyticsInput } from "./analytics.ts";
import { rulesText, type CalcPolicy, type FreqPolicy, type MarkStatus } from "./calc.ts";
import {
  ASSESSMENT_KINDS,
  DEFAULT_CRITERIA,
  DEFAULT_SCALE,
  FREQ_MARKS,
  STUDENT_STATUSES,
  periodNames,
  type AssessmentKind,
  type ImportKind,
  type PeriodModel,
  type StudentStatus,
} from "./constants.ts";
import { UserError } from "./errors.ts";
import { asNumber, asNumberOrNull, normalizeKey, todayBR } from "./format.ts";
import {
  planAssessmentImport,
  planClassImport,
  planQualImport,
  planScoreImport,
  planStudentImport,
  summarizePlans,
  type ExistingAssessment,
  type ExistingClass,
  type ExistingCourse,
  type ExistingCriterion,
  type ExistingPeriod,
  type ExistingStudent,
  type ExistingSubject,
  type ImportMode,
  type ImportPlan,
} from "./import-logic.ts";
import { buildReport, type ExportKind } from "./reports.ts";
import { cleanEnrollment, cleanName, clip, parseSeries } from "./validate.ts";

type Role = "admin" | "coordenacao" | "professor";
type Membership = { school_id: string; role: string; school_name: string; subject_scope: string | null; display_name: string };

export type Workspace = {
  school: {
    id: string;
    name: string;
    inviteCode: string;
    gradeScaleMax: number;
    passingAverage: number;
    periodModel: PeriodModel;
    calculationMode: "simple" | "weighted";
    recoveryPolicy: "replace_if_higher" | "average_with_original" | "keep_both";
    absenceCountsAsZero: boolean;
    justifiedRule: "presence" | "absence" | "ignore";
    lateRule: "presence" | "absence" | "ignore";
    frequencyMinPercent: number;
  };
  role: Role;
  subjectScope: string[] | null;
  myName: string;
  memberships: { schoolId: string; role: string; schoolName: string }[];
  years: { id: string; label: string; active: boolean }[];
  periods: { id: string; yearId: string; ord: number; name: string; kind: string }[];
  courses: { id: string; name: string }[];
  classes: {
    id: string;
    yearId: string;
    courseId: string | null;
    series: string;
    name: string;
    teacherName: string;
    passingAverage: number | null;
    archived: boolean;
    studentCount: number;
  }[];
  subjects: { id: string; name: string; code: string; teacherName: string }[];
  classSubjects: { id: string; classId: string; subjectId: string; teacherName: string }[];
  criteria: { id: string; name: string; description: string; scale: string[]; active: boolean; ord: number }[];
  staff: { id: string; name: string; roleLabel: string }[];
  members: { userId: string; role: string; displayName: string; email: string; subjectScope: string[] | null }[];
  counts: { students: number; classes: number; subjects: number; assessments: number };
  rules: string[];
};

async function access(userId: string, schoolId: string | null) {
  const sql = await getSql();
  let memberships = await sql<Membership>`
    select m.school_id, m.role, s.name as school_name, m.subject_scope, m.display_name
    from school_members m
    join schools s on s.id = m.school_id
    where m.user_id = ${userId}
    order by m.created_at asc
  `;
  if (!memberships.length) {
    await createSchool(sql, userId);
    memberships = await sql<Membership>`
      select m.school_id, m.role, s.name as school_name, m.subject_scope, m.display_name
      from school_members m
      join schools s on s.id = m.school_id
      where m.user_id = ${userId}
      order by m.created_at asc
    `;
  }
  const chosen = schoolId ? memberships.find((item) => item.school_id === schoolId) : memberships[0];
  if (!chosen) throw new UserError("Sem acesso a esta escola.");
  return { sql, schoolId: chosen.school_id, role: chosen.role as Role, scope: parseScope(chosen.subject_scope), memberships };
}

function parseScope(raw: string | null): string[] | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return null;
    return value.filter((item): item is string => typeof item === "string");
  } catch {
    return null;
  }
}

function assertRole(role: Role, level: "academic" | "settings" | "admin") {
  if (level === "academic") return;
  if (level === "settings" && (role === "admin" || role === "coordenacao")) return;
  if (level === "admin" && role === "admin") return;
  throw new UserError("Sem permissão para esta operação.");
}

function assertSubject(scope: string[] | null, subjectId: string) {
  if (scope && !scope.includes(subjectId)) throw new UserError("Sem permissão para esta disciplina.");
}

function uid(): string {
  return crypto.randomUUID();
}

function inviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function audit(sql: Sql, schoolId: string, userId: string, action: string, entity: string, entityId: string | null, summary: string) {
  await sql`insert into audit_log (id, school_id, user_id, action, entity, entity_id, summary) values (${uid()}, ${schoolId}, ${userId}, ${action}, ${entity}, ${entityId}, ${summary.slice(0, 500)})`;
}

async function createSchool(sql: Sql, userId: string) {
  const id = uid();
  const yearId = uid();
  const year = String(new Date().getFullYear());
  await sql`insert into schools (id, owner_user_id, name, invite_code) values (${id}, ${userId}, ${"Minha escola"}, ${inviteCode()})`;
  await sql`insert into school_members (school_id, user_id, role, display_name) values (${id}, ${userId}, ${"admin"}, ${""})`;
  await sql`insert into school_years (id, school_id, label, active) values (${yearId}, ${id}, ${year}, true)`;
  for (const [index, name] of periodNames("bimestre").entries()) {
    await sql`insert into periods (id, school_id, year_id, ord, name, kind) values (${uid()}, ${id}, ${yearId}, ${index + 1}, ${name}, ${"bimestre"})`;
  }
  await sql`insert into subjects (id, school_id, name, code, teacher_name) values (${uid()}, ${id}, ${"Física"}, ${"FIS"}, ${""})`;
  for (const [index, criterion] of DEFAULT_CRITERIA.entries()) {
    await sql`insert into qual_criteria (id, school_id, name, description, scale, active, ord) values (${uid()}, ${id}, ${criterion.name}, ${criterion.description}, ${JSON.stringify(DEFAULT_SCALE)}, true, ${index})`;
  }
  await audit(sql, id, userId, "criar", "escola", id, "Escola criada com o ano letivo, os bimestres, a disciplina Física e os critérios qualitativos.");
}

function policyOf(row: Record<string, unknown>): CalcPolicy {
  return {
    mode: row.calculation_mode === "simple" ? "simple" : "weighted",
    passing: asNumber(row.passing_average, 6),
    scaleMax: asNumber(row.grade_scale_max, 10),
    recovery:
      row.recovery_policy === "average_with_original" || row.recovery_policy === "keep_both"
        ? row.recovery_policy
        : "replace_if_higher",
    absenceCountsAsZero: row.absence_counts_as_zero === true,
  };
}

function freqOf(row: Record<string, unknown>): FreqPolicy {
  const rule = (value: unknown): FreqPolicy["justifiedRule"] =>
    value === "absence" || value === "ignore" ? value : "presence";
  return {
    justifiedRule: rule(row.justified_rule),
    lateRule: rule(row.late_rule),
    minimum: asNumber(row.frequency_min_percent, 75),
  };
}

export async function getWorkspaceFor(userId: string, data: { schoolId: string | null }): Promise<Workspace> {
  const ctx = await access(userId, data.schoolId);
  const { sql, schoolId, role, scope } = ctx;
  const [schoolRows, years, periods, courses, classes, subjects, links, criteria, staff, counts, classCounts] =
    await Promise.all([
      sql<Record<string, unknown>>`select * from schools where id = ${schoolId}`,
      sql<{ id: string; label: string; active: boolean }>`select id, label, active from school_years where school_id = ${schoolId} order by label desc`,
      sql<{ id: string; year_id: string; ord: number; name: string; kind: string }>`select id, year_id, ord, name, kind from periods where school_id = ${schoolId} order by ord`,
      sql<{ id: string; name: string }>`select id, name from courses where school_id = ${schoolId} order by name`,
      sql<Record<string, unknown>>`select * from classes where school_id = ${schoolId} order by series, name`,
      sql<{ id: string; name: string; code: string; teacher_name: string }>`select id, name, code, teacher_name from subjects where school_id = ${schoolId} order by name`,
      sql<{ id: string; class_id: string; subject_id: string; teacher_name: string }>`select id, class_id, subject_id, teacher_name from class_subjects where school_id = ${schoolId}`,
      sql<{ id: string; name: string; description: string; scale: string; active: boolean; ord: number }>`select id, name, description, scale, active, ord from qual_criteria where school_id = ${schoolId} order by ord, name`,
      sql<{ id: string; name: string; role_label: string }>`select id, name, role_label from staff where school_id = ${schoolId} order by name`,
      sql<{ students: number; classes: number; subjects: number; assessments: number }>`
        select
          (select count(*)::int from students where school_id = ${schoolId} and archived = false) as students,
          (select count(*)::int from classes where school_id = ${schoolId} and archived = false) as classes,
          (select count(*)::int from subjects where school_id = ${schoolId}) as subjects,
          (select count(*)::int from assessments where school_id = ${schoolId}) as assessments
      `,
      sql<{ class_id: string; n: number }>`select class_id, count(*)::int as n from students where school_id = ${schoolId} and archived = false and status = 'ativo' and class_id is not null group by class_id`,
    ]);
  const school = schoolRows[0];
  if (!school) throw new UserError("Escola não encontrada.");
  const countByClass = new Map(classCounts.map((row) => [row.class_id, asNumber(row.n)]));
  let members: Workspace["members"] = [];
  if (role === "admin" || role === "coordenacao") {
    const rows = await sql<{ user_id: string; role: string; display_name: string; email: string | null; name: string | null; subject_scope: string | null }>`
      select m.user_id, m.role, m.display_name, u.email, u.name, m.subject_scope
      from school_members m
      left join "user" u on u.id = m.user_id
      where m.school_id = ${schoolId}
      order by m.created_at asc
    `;
    members = rows.map((row) => ({
      userId: row.user_id,
      role: row.role,
      displayName: row.display_name || row.name || "Sem nome",
      email: row.email ?? "",
      subjectScope: parseScope(row.subject_scope),
    }));
  }
  const me = ctx.memberships.find((item) => item.school_id === schoolId);
  const policy = policyOf(school);
  return {
    school: {
      id: schoolId,
      name: String(school.name),
      inviteCode: role === "admin" ? String(school.invite_code) : "",
      gradeScaleMax: policy.scaleMax,
      passingAverage: policy.passing,
      periodModel: (school.period_model as PeriodModel) ?? "bimestre",
      calculationMode: policy.mode,
      recoveryPolicy: policy.recovery,
      absenceCountsAsZero: policy.absenceCountsAsZero,
      justifiedRule: freqOf(school).justifiedRule,
      lateRule: freqOf(school).lateRule,
      frequencyMinPercent: freqOf(school).minimum,
    },
    role,
    subjectScope: scope,
    myName: me?.display_name ?? "",
    memberships: ctx.memberships.map((item) => ({ schoolId: item.school_id, role: item.role, schoolName: item.school_name })),
    years: years.map((year) => ({ id: year.id, label: year.label, active: year.active === true })),
    periods: periods.map((period) => ({ id: period.id, yearId: period.year_id, ord: asNumber(period.ord), name: period.name, kind: period.kind })),
    courses,
    classes: classes.map((row) => ({
      id: String(row.id),
      yearId: String(row.year_id),
      courseId: row.course_id ? String(row.course_id) : null,
      series: String(row.series),
      name: String(row.name),
      teacherName: String(row.teacher_name ?? ""),
      passingAverage: asNumberOrNull(row.passing_average),
      archived: row.archived === true,
      studentCount: countByClass.get(String(row.id)) ?? 0,
    })),
    subjects: subjects
      .filter((subject) => !scope || scope.includes(subject.id))
      .map((subject) => ({ id: subject.id, name: subject.name, code: subject.code, teacherName: subject.teacher_name })),
    classSubjects: links
      .filter((link) => !scope || scope.includes(link.subject_id))
      .map((link) => ({ id: link.id, classId: link.class_id, subjectId: link.subject_id, teacherName: link.teacher_name })),
    criteria: criteria.map((criterion) => ({
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      scale: parseScale(criterion.scale),
      active: criterion.active === true,
      ord: asNumber(criterion.ord),
    })),
    staff: staff.map((person) => ({ id: person.id, name: person.name, roleLabel: person.role_label })),
    members,
    counts: {
      students: asNumber(counts[0]?.students),
      classes: asNumber(counts[0]?.classes),
      subjects: asNumber(counts[0]?.subjects),
      assessments: asNumber(counts[0]?.assessments),
    },
    rules: rulesText(policy),
  };
}

function parseScale(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (Array.isArray(value) && value.every((item) => typeof item === "string") && value.length) return value;
  } catch {
    /* escala padrão */
  }
  return [...DEFAULT_SCALE];
}

async function schoolRow(sql: Sql, schoolId: string) {
  const rows = await sql<Record<string, unknown>>`select * from schools where id = ${schoolId}`;
  if (!rows[0]) throw new UserError("Escola não encontrada.");
  return rows[0];
}

export async function updateSettingsFor(userId: string, data: Record<string, unknown>) {
  const ctx = await access(userId, strOrNull(data.schoolId));
  assertRole(ctx.role, "settings");
  const scale = asNumber(data.gradeScaleMax, 10);
  const passing = asNumber(data.passingAverage, 6);
  if (!(scale >= 1 && scale <= 100)) throw new UserError("A escala precisa ficar entre 1 e 100.");
  if (!(passing > 0 && passing <= scale)) throw new UserError("A média mínima precisa ser maior que zero e caber na escala.");
  const name = clip(data.name, 120);
  if (name.length < 2) throw new UserError("Informe o nome da escola.");
  const model = data.periodModel;
  if (model !== "bimestre" && model !== "trimestre" && model !== "semestre") throw new UserError("Período letivo inválido.");
  const mode = data.calculationMode === "simple" ? "simple" : "weighted";
  const recovery =
    data.recoveryPolicy === "average_with_original" || data.recoveryPolicy === "keep_both" ? data.recoveryPolicy : "replace_if_higher";
  const justified = data.justifiedRule === "absence" || data.justifiedRule === "ignore" ? data.justifiedRule : "presence";
  const late = data.lateRule === "absence" || data.lateRule === "ignore" ? data.lateRule : "presence";
  const freqMin = asNumber(data.frequencyMinPercent, 75);
  if (freqMin < 0 || freqMin > 100) throw new UserError("A frequência mínima precisa ficar entre 0 e 100.");
  const current = await schoolRow(ctx.sql, ctx.schoolId);
  const maxExisting = await ctx.sql<{ n: number | null }>`select max(max_score) as n from assessments where school_id = ${ctx.schoolId}`;
  if (asNumber(maxExisting[0]?.n) > scale + 1e-9) {
    throw new UserError("Há avaliações com nota máxima acima da nova escala. Ajuste essas avaliações antes.");
  }
  if (String(current.period_model) !== model) {
    const used = await ctx.sql<{ n: number }>`select count(*)::int as n from assessments where school_id = ${ctx.schoolId} and period_id is not null`;
    if (asNumber(used[0]?.n) > 0) {
      throw new UserError("Já existem avaliações ligadas a períodos. Crie outro ano letivo em vez de trocar bimestre, trimestre ou semestre.");
    }
    const years = await ctx.sql<{ id: string }>`select id from school_years where school_id = ${ctx.schoolId}`;
    await ctx.sql`delete from periods where school_id = ${ctx.schoolId}`;
    for (const year of years) {
      for (const [index, periodName] of periodNames(model).entries()) {
        await ctx.sql`insert into periods (id, school_id, year_id, ord, name, kind) values (${uid()}, ${ctx.schoolId}, ${year.id}, ${index + 1}, ${periodName}, ${model})`;
      }
    }
  }
  await ctx.sql`
    update schools set
      name = ${name},
      grade_scale_max = ${scale},
      passing_average = ${passing},
      period_model = ${model},
      calculation_mode = ${mode},
      recovery_policy = ${recovery},
      absence_counts_as_zero = ${data.absenceCountsAsZero === true},
      justified_rule = ${justified},
      late_rule = ${late},
      frequency_min_percent = ${freqMin},
      updated_at = now()
    where id = ${ctx.schoolId}
  `;
  await audit(ctx.sql, ctx.schoolId, userId, "alterar", "configuracao", ctx.schoolId, "Critérios de cálculo e dados da escola atualizados.");
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function saveYearFor(userId: string, data: { schoolId: string | null; label: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  const label = clip(data.label, 20);
  if (!/^\d{4}$/.test(label)) throw new UserError("Use o ano com quatro dígitos, por exemplo 2026.");
  const school = await schoolRow(ctx.sql, ctx.schoolId);
  const model = (school.period_model as PeriodModel) ?? "bimestre";
  const id = uid();
  try {
    await ctx.sql`insert into school_years (id, school_id, label, active) values (${id}, ${ctx.schoolId}, ${label}, false)`;
  } catch (error) {
    if (isUnique(error)) throw new UserError("Esse ano letivo já existe.");
    throw error;
  }
  for (const [index, name] of periodNames(model).entries()) {
    await ctx.sql`insert into periods (id, school_id, year_id, ord, name, kind) values (${uid()}, ${ctx.schoolId}, ${id}, ${index + 1}, ${name}, ${model})`;
  }
  await audit(ctx.sql, ctx.schoolId, userId, "criar", "ano", id, `Ano letivo ${label} criado.`);
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function activateYearFor(userId: string, data: { schoolId: string | null; yearId: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  const rows = await ctx.sql`select id from school_years where id = ${data.yearId} and school_id = ${ctx.schoolId}`;
  if (!rows.length) throw new UserError("Ano letivo não encontrado.");
  await ctx.sql`update school_years set active = (id = ${data.yearId}) where school_id = ${ctx.schoolId}`;
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function renamePeriodFor(userId: string, data: { schoolId: string | null; periodId: string; name: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  const name = clip(data.name, 40);
  if (name.length < 2) throw new UserError("Informe o nome do período.");
  const rows = await ctx.sql`update periods set name = ${name} where id = ${data.periodId} and school_id = ${ctx.schoolId}`;
  if (!rows) throw new UserError("Período não encontrado.");
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function saveCourseFor(userId: string, data: { schoolId: string | null; id: string | null; name: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  const name = clip(data.name, 120);
  if (name.length < 2) throw new UserError("Informe o nome do curso técnico.");
  if (data.id) {
    await ctx.sql`update courses set name = ${name} where id = ${data.id} and school_id = ${ctx.schoolId}`;
  } else {
    try {
      await ctx.sql`insert into courses (id, school_id, name) values (${uid()}, ${ctx.schoolId}, ${name})`;
    } catch (error) {
      if (isUnique(error)) throw new UserError("Esse curso já está cadastrado.");
      throw error;
    }
  }
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function deleteCourseFor(userId: string, data: { schoolId: string | null; id: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "admin");
  await ctx.sql`delete from courses where id = ${data.id} and school_id = ${ctx.schoolId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "excluir", "curso", data.id, "Curso técnico excluído.");
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function saveSubjectFor(
  userId: string,
  data: { schoolId: string | null; id: string | null; name: string; code: string; teacherName: string },
) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  const name = clip(data.name, 120);
  if (name.length < 2) throw new UserError("Informe o nome da disciplina.");
  const code = clip(data.code, 20);
  const teacher = clip(data.teacherName, 120);
  if (data.id) {
    assertSubject(ctx.scope, data.id);
    await ctx.sql`update subjects set name = ${name}, code = ${code}, teacher_name = ${teacher} where id = ${data.id} and school_id = ${ctx.schoolId}`;
  } else {
    if (ctx.scope) throw new UserError("Seu acesso está limitado a disciplinas já atribuídas.");
    try {
      await ctx.sql`insert into subjects (id, school_id, name, code, teacher_name) values (${uid()}, ${ctx.schoolId}, ${name}, ${code}, ${teacher})`;
    } catch (error) {
      if (isUnique(error)) throw new UserError("Essa disciplina já existe.");
      throw error;
    }
  }
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function deleteSubjectFor(userId: string, data: { schoolId: string | null; id: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "admin");
  const used = await ctx.sql<{ n: number }>`select count(*)::int as n from assessments where subject_id = ${data.id} and school_id = ${ctx.schoolId}`;
  if (asNumber(used[0]?.n) > 0) throw new UserError("A disciplina tem avaliações. Arquive a turma ou apague as avaliações antes.");
  await ctx.sql`delete from subjects where id = ${data.id} and school_id = ${ctx.schoolId}`;
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function saveClassFor(userId: string, data: Record<string, unknown>) {
  const ctx = await access(userId, strOrNull(data.schoolId));
  assertRole(ctx.role, "academic");
  const name = clip(data.name, 80);
  const series = parseSeries(data.series);
  const yearId = String(data.yearId ?? "");
  const courseId = strOrNull(data.courseId);
  const teacher = clip(data.teacherName, 120);
  const passing = data.passingAverage == null || data.passingAverage === "" ? null : asNumber(data.passingAverage);
  if (name.length < 1) throw new UserError("Informe o nome da turma.");
  if (series !== "1" && series !== "2" && series !== "3") throw new UserError("A série precisa ser 1º, 2º ou 3º ano.");
  const year = await ctx.sql`select id from school_years where id = ${yearId} and school_id = ${ctx.schoolId}`;
  if (!year.length) throw new UserError("Ano letivo inválido.");
  if (courseId) {
    const course = await ctx.sql`select id from courses where id = ${courseId} and school_id = ${ctx.schoolId}`;
    if (!course.length) throw new UserError("Curso técnico inválido.");
  }
  const school = await schoolRow(ctx.sql, ctx.schoolId);
  if (passing != null && (passing <= 0 || passing > asNumber(school.grade_scale_max, 10))) {
    throw new UserError("A média da turma precisa caber na escala da escola.");
  }
  const id = strOrNull(data.id);
  try {
    if (id) {
      await ctx.sql`
        update classes set name = ${name}, series = ${series}, year_id = ${yearId}, course_id = ${courseId},
          teacher_name = ${teacher}, passing_average = ${passing}, updated_at = now()
        where id = ${id} and school_id = ${ctx.schoolId}
      `;
    } else {
      await ctx.sql`
        insert into classes (id, school_id, year_id, course_id, series, name, teacher_name, passing_average)
        values (${uid()}, ${ctx.schoolId}, ${yearId}, ${courseId}, ${series}, ${name}, ${teacher}, ${passing})
      `;
    }
  } catch (error) {
    if (isUnique(error)) throw new UserError("Já existe uma turma com esse nome na série e no ano.");
    throw error;
  }
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function archiveClassFor(userId: string, data: { schoolId: string | null; id: string; archived: boolean }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  await ctx.sql`update classes set archived = ${data.archived}, updated_at = now() where id = ${data.id} and school_id = ${ctx.schoolId}`;
  await audit(ctx.sql, ctx.schoolId, userId, data.archived ? "arquivar" : "reativar", "turma", data.id, data.archived ? "Turma arquivada." : "Turma reativada.");
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function saveClassSubjectsFor(
  userId: string,
  data: { schoolId: string | null; classId: string; links: { subjectId: string; teacherName: string }[] },
) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  const klass = await ctx.sql`select id from classes where id = ${data.classId} and school_id = ${ctx.schoolId}`;
  if (!klass.length) throw new UserError("Turma não encontrada.");
  await ctx.sql`delete from class_subjects where class_id = ${data.classId} and school_id = ${ctx.schoolId}`;
  for (const link of data.links) {
    assertSubject(ctx.scope, link.subjectId);
    const subject = await ctx.sql`select id from subjects where id = ${link.subjectId} and school_id = ${ctx.schoolId}`;
    if (!subject.length) continue;
    await ctx.sql`insert into class_subjects (id, school_id, class_id, subject_id, teacher_name) values (${uid()}, ${ctx.schoolId}, ${data.classId}, ${link.subjectId}, ${clip(link.teacherName, 120)})`;
  }
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function saveStaffFor(userId: string, data: { schoolId: string | null; id: string | null; name: string; roleLabel: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  const name = clip(data.name, 120);
  if (name.length < 3) throw new UserError("Informe o nome do professor.");
  const roleLabel = clip(data.roleLabel, 60) || "Professor";
  if (data.id) {
    await ctx.sql`update staff set name = ${name}, role_label = ${roleLabel} where id = ${data.id} and school_id = ${ctx.schoolId}`;
  } else {
    try {
      await ctx.sql`insert into staff (id, school_id, name, role_label) values (${uid()}, ${ctx.schoolId}, ${name}, ${roleLabel})`;
    } catch (error) {
      if (isUnique(error)) throw new UserError("Esse nome já está na lista de professores.");
      throw error;
    }
  }
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function deleteStaffFor(userId: string, data: { schoolId: string | null; id: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  await ctx.sql`delete from staff where id = ${data.id} and school_id = ${ctx.schoolId}`;
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export type StudentList = {
  rows: {
    id: string;
    fullName: string;
    enrollment: string | null;
    yearId: string | null;
    classId: string | null;
    className: string | null;
    courseName: string | null;
    courseId: string | null;
    series: string | null;
    status: string;
    notes: string;
    archived: boolean;
  }[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listStudentsFor(userId: string, data: Record<string, unknown>): Promise<StudentList> {
  const ctx = await access(userId, strOrNull(data.schoolId));
  const pageSize = Math.min(200, Math.max(10, asNumber(data.pageSize, 25)));
  const page = Math.max(1, asNumber(data.page, 1));
  const q = clip(data.query, 80);
  const like = q ? `%${q}%` : null;
  const yearId = strOrNull(data.yearId);
  const classId = strOrNull(data.classId);
  const series = strOrNull(data.series);
  const status = strOrNull(data.status);
  const archived = data.archived === true;
  const filters = { schoolId: ctx.schoolId, yearId, classId, series, status, like, archived };
  const totalRows = await ctx.sql<{ n: number }>`
    select count(*)::int as n from students s
    where s.school_id = ${filters.schoolId}
      and (${archived}::boolean = true or s.archived = false)
      and (${yearId}::text is null or s.year_id = ${yearId})
      and (${classId}::text is null or s.class_id = ${classId})
      and (${series}::text is null or s.series = ${series})
      and (${status}::text is null or s.status = ${status})
      and (${like}::text is null or s.full_name ilike ${like} or coalesce(s.enrollment_code, '') ilike ${like})
  `;
  const rows = await ctx.sql<Record<string, unknown>>`
    select s.id, s.full_name, s.enrollment_code, s.year_id, s.class_id, s.course_id, s.series, s.status, s.archived, s.notes,
           c.name as class_name, coalesce(co.name, cc.name) as course_name
    from students s
    left join classes c on c.id = s.class_id
    left join courses co on co.id = s.course_id
    left join courses cc on cc.id = c.course_id
    where s.school_id = ${ctx.schoolId}
      and (${archived}::boolean = true or s.archived = false)
      and (${yearId}::text is null or s.year_id = ${yearId})
      and (${classId}::text is null or s.class_id = ${classId})
      and (${series}::text is null or s.series = ${series})
      and (${status}::text is null or s.status = ${status})
      and (${like}::text is null or s.full_name ilike ${like} or coalesce(s.enrollment_code, '') ilike ${like})
    order by s.full_name asc
    limit ${pageSize} offset ${(page - 1) * pageSize}
  `;
  return {
    total: asNumber(totalRows[0]?.n),
    page,
    pageSize,
    rows: rows.map((row) => ({
      id: String(row.id),
      fullName: String(row.full_name),
      enrollment: row.enrollment_code ? String(row.enrollment_code) : null,
      yearId: row.year_id ? String(row.year_id) : null,
      classId: row.class_id ? String(row.class_id) : null,
      className: row.class_name ? String(row.class_name) : null,
      courseName: row.course_name ? String(row.course_name) : null,
      courseId: row.course_id ? String(row.course_id) : null,
      series: row.series ? String(row.series) : null,
      status: String(row.status),
      notes: String(row.notes ?? ""),
      archived: row.archived === true,
    })),
  };
}

export async function saveStudentFor(userId: string, data: Record<string, unknown>) {
  const ctx = await access(userId, strOrNull(data.schoolId));
  assertRole(ctx.role, "academic");
  const fullName = clip(data.fullName, 160);
  if (fullName.length < 3) throw new UserError("Informe o nome completo.");
  const enrollment = cleanEnrollment(data.enrollment);
  const yearId = String(data.yearId ?? "");
  const classId = strOrNull(data.classId);
  const courseId = strOrNull(data.courseId);
  const status = parseStudentStatus(data.status);
  const notes = clip(data.notes, 4000);
  const year = await ctx.sql`select id from school_years where id = ${yearId} and school_id = ${ctx.schoolId}`;
  if (!year.length) throw new UserError("Ano letivo inválido.");
  let series = parseSeries(data.series);
  if (series === "invalid") throw new UserError("Série inválida.");
  let resolvedCourse = courseId;
  if (classId) {
    const classes = await ctx.sql<{ series: string; course_id: string | null; year_id: string }>`select series, course_id, year_id from classes where id = ${classId} and school_id = ${ctx.schoolId}`;
    if (!classes[0] || classes[0].year_id !== yearId) throw new UserError("A turma não pertence ao ano letivo.");
    series = classes[0].series as "1" | "2" | "3";
    if (!resolvedCourse) resolvedCourse = classes[0].course_id;
  }
  const id = strOrNull(data.id);
  const dupes = await ctx.sql<{ id: string; full_name: string; enrollment_code: string | null }>`
    select id, full_name, enrollment_code from students where school_id = ${ctx.schoolId} and archived = false
  `;
  const conflicts = dupes.filter((student) => {
    if (id && student.id === id) return false;
    if (enrollment && student.enrollment_code && student.enrollment_code.toUpperCase() === enrollment) return true;
    return normalizeKey(student.full_name) === normalizeKey(fullName) && !enrollment && !student.enrollment_code;
  });
  if (conflicts.length && data.confirmDuplicate !== true) {
    throw new UserError(
      `Possível duplicidade com ${conflicts
        .slice(0, 3)
        .map((student) => student.full_name)
        .join(", ")}. Confirme se deseja salvar mesmo assim. Nada foi gravado.`,
    );
  }
  if (id) {
    const current = await ctx.sql<{ class_id: string | null }>`select class_id from students where id = ${id} and school_id = ${ctx.schoolId}`;
    if (!current[0]) throw new UserError("Estudante não encontrado.");
    try {
      await ctx.sql`
        update students set full_name = ${fullName}, enrollment_code = ${enrollment}, year_id = ${yearId}, class_id = ${classId},
          course_id = ${resolvedCourse}, series = ${series}, status = ${status}, notes = ${notes}, updated_at = now()
        where id = ${id} and school_id = ${ctx.schoolId}
      `;
    } catch (error) {
      if (isUnique(error)) throw new UserError("Já existe estudante com esta matrícula.");
      throw error;
    }
    if (current[0].class_id !== classId) {
      await ctx.sql`update student_enrollments set status = 'encerrado', ended_on = ${todayBR()} where student_id = ${id} and school_id = ${ctx.schoolId} and status = 'ativo' and ended_on is null`;
      await ctx.sql`insert into student_enrollments (id, school_id, student_id, year_id, class_id, course_id, series, status, started_on) values (${uid()}, ${ctx.schoolId}, ${id}, ${yearId}, ${classId}, ${resolvedCourse}, ${series}, ${"ativo"}, ${todayBR()})`;
    }
    await audit(ctx.sql, ctx.schoolId, userId, "alterar", "estudante", id, `Cadastro de ${fullName} atualizado.`);
    return { id };
  }
  const newId = uid();
  try {
    await ctx.sql`
      insert into students (id, school_id, full_name, enrollment_code, year_id, class_id, course_id, series, status, notes)
      values (${newId}, ${ctx.schoolId}, ${fullName}, ${enrollment}, ${yearId}, ${classId}, ${resolvedCourse}, ${series}, ${status}, ${notes})
    `;
  } catch (error) {
    if (isUnique(error)) throw new UserError("Já existe estudante com esta matrícula.");
    throw error;
  }
  await ctx.sql`insert into student_enrollments (id, school_id, student_id, year_id, class_id, course_id, series, status, started_on) values (${uid()}, ${ctx.schoolId}, ${newId}, ${yearId}, ${classId}, ${resolvedCourse}, ${series}, ${"ativo"}, ${todayBR()})`;
  await audit(ctx.sql, ctx.schoolId, userId, "criar", "estudante", newId, `Estudante ${fullName} cadastrado.`);
  return { id: newId };
}

function parseStudentStatus(value: unknown): StudentStatus {
  const hit = STUDENT_STATUSES.find((status) => status.id === value);
  if (!hit) throw new UserError("Situação do estudante inválida.");
  return hit.id;
}

export async function archiveStudentFor(userId: string, data: { schoolId: string | null; id: string; archived: boolean }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  const rows = await ctx.sql<{ full_name: string }>`update students set archived = ${data.archived}, updated_at = now() where id = ${data.id} and school_id = ${ctx.schoolId} returning full_name`;
  if (!rows[0]) throw new UserError("Estudante não encontrado.");
  if (data.archived) {
    await ctx.sql`update student_enrollments set status = 'encerrado', ended_on = ${todayBR()} where student_id = ${data.id} and status = 'ativo' and ended_on is null`;
  }
  await audit(ctx.sql, ctx.schoolId, userId, data.archived ? "arquivar" : "reativar", "estudante", data.id, `${rows[0].full_name} ${data.archived ? "arquivado" : "reativado"}.`);
  return { ok: true };
}

export async function deleteStudentFor(userId: string, data: { schoolId: string | null; id: string; confirmName: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "admin");
  const rows = await ctx.sql<{ full_name: string }>`select full_name from students where id = ${data.id} and school_id = ${ctx.schoolId}`;
  if (!rows[0]) throw new UserError("Estudante não encontrado.");
  if (normalizeKey(data.confirmName) !== normalizeKey(rows[0].full_name)) {
    throw new UserError("Digite o nome completo do estudante para confirmar a exclusão.");
  }
  await ctx.sql`delete from students where id = ${data.id} and school_id = ${ctx.schoolId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "excluir", "estudante", data.id, `Estudante ${rows[0].full_name} excluído com o histórico vinculado.`);
  return { ok: true };
}

function isUnique(error: unknown): boolean {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : "";
  const message = error instanceof Error ? error.message : String(error);
  return code === "23505" || /unique|duplicate key/i.test(message);
}

function strOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function analyticsInputFor(userId: string, schoolId: string | null, filter: AnalyticsInput["filter"]): Promise<{ input: AnalyticsInput; ctx: Awaited<ReturnType<typeof access>>; yearLabel: string; schoolName: string; notes: Record<string, string>; courseName: Record<string, string> }> {
  const ctx = await access(userId, schoolId);
  const { sql } = ctx;
  const school = await schoolRow(sql, ctx.schoolId);
  const [students, classes, periods, subjects, assessments, scores, enrollments, sessions, marks, criteria, quals, courses, years] =
    await Promise.all([
      sql<Record<string, unknown>>`select id, full_name, enrollment_code, class_id, status, archived, notes, year_id from students where school_id = ${ctx.schoolId}`,
      sql<Record<string, unknown>>`select id, year_id, series, name, course_id, passing_average, teacher_name, archived from classes where school_id = ${ctx.schoolId} and archived = false`,
      sql<Record<string, unknown>>`select id, year_id, ord, name from periods where school_id = ${ctx.schoolId}`,
      sql<{ id: string; name: string }>`select id, name from subjects where school_id = ${ctx.schoolId}`,
      sql<Record<string, unknown>>`select id, class_id, subject_id, period_id, name, assessed_on::text as assessed_on, kind, max_score, weight, is_recovery from assessments where school_id = ${ctx.schoolId}`,
      sql<Record<string, unknown>>`select assessment_id, student_id, value, mark_status from scores where school_id = ${ctx.schoolId}`,
      sql<Record<string, unknown>>`select student_id, class_id, year_id, status, ended_on::text as ended_on from student_enrollments where school_id = ${ctx.schoolId}`,
      sql<Record<string, unknown>>`select id, class_id, subject_id, session_date::text as session_date, label from attendance_sessions where school_id = ${ctx.schoolId}`,
      sql<{ session_id: string; student_id: string; mark: string }>`select session_id, student_id, mark from attendance_marks where school_id = ${ctx.schoolId}`,
      sql<{ id: string; name: string; scale: string; description: string }>`select id, name, scale, description from qual_criteria where school_id = ${ctx.schoolId} and active = true`,
      sql<Record<string, unknown>>`select id, student_id, criterion_id, period_id, recorded_on::text as recorded_on, level, comment from qual_records where school_id = ${ctx.schoolId}`,
      sql<{ id: string; name: string }>`select id, name from courses where school_id = ${ctx.schoolId}`,
      sql<{ id: string; label: string }>`select id, label from school_years where school_id = ${ctx.schoolId}`,
    ]);
  const scopedSubjects = ctx.scope ? subjects.filter((subject) => ctx.scope?.includes(subject.id)) : subjects;
  const subjectIds = new Set(scopedSubjects.map((subject) => subject.id));
  const sessionClass = new Map(sessions.map((session) => [String(session.id), session]));
  const input: AnalyticsInput = {
    policy: policyOf(school),
    freq: freqOf(school),
    students: students.map((row) => ({
      id: String(row.id),
      name: String(row.full_name),
      enrollment: row.enrollment_code ? String(row.enrollment_code) : null,
      classId: row.class_id ? String(row.class_id) : null,
      status: String(row.status),
      archived: row.archived === true,
    })),
    classes: classes.map((row) => ({
      id: String(row.id),
      yearId: String(row.year_id),
      series: String(row.series),
      name: String(row.name),
      courseId: row.course_id ? String(row.course_id) : null,
      passing: asNumberOrNull(row.passing_average),
      teacherName: String(row.teacher_name ?? ""),
    })),
    periods: periods.map((row) => ({ id: String(row.id), yearId: String(row.year_id), ord: asNumber(row.ord), name: String(row.name) })),
    subjects: scopedSubjects,
    assessments: assessments
      .filter((row) => subjectIds.has(String(row.subject_id)))
      .map((row) => ({
        id: String(row.id),
        classId: String(row.class_id),
        subjectId: String(row.subject_id),
        periodId: row.period_id ? String(row.period_id) : null,
        name: String(row.name),
        date: row.assessed_on ? String(row.assessed_on) : null,
        kind: String(row.kind),
        maxScore: asNumber(row.max_score, 10),
        weight: asNumber(row.weight, 1),
        isRecovery: row.is_recovery === true,
      })),
    scores: scores.map((row) => ({
      assessmentId: String(row.assessment_id),
      studentId: String(row.student_id),
      value: asNumberOrNull(row.value),
      status: (row.mark_status as MarkStatus) ?? "pending",
    })),
    enrollments: enrollments.map((row) => ({
      studentId: String(row.student_id),
      classId: row.class_id ? String(row.class_id) : null,
      yearId: String(row.year_id),
      status: String(row.status),
      endedOn: row.ended_on ? String(row.ended_on) : null,
    })),
    marks: marks.flatMap((mark) => {
      const session = sessionClass.get(mark.session_id);
      if (!session) return [];
      const subjectId = session.subject_id ? String(session.subject_id) : null;
      if (ctx.scope && subjectId && !ctx.scope.includes(subjectId)) return [];
      return [{ studentId: mark.student_id, classId: String(session.class_id), subjectId, status: mark.mark as AnalyticsInput["marks"][number]["status"] }];
    }),
    qualitative: quals.map((row) => ({
      studentId: String(row.student_id),
      criterionId: String(row.criterion_id),
      level: String(row.level),
      date: String(row.recorded_on ?? ""),
      comment: String(row.comment ?? ""),
      periodId: row.period_id ? String(row.period_id) : null,
    })),
    criteria: criteria.map((row) => ({ id: row.id, name: row.name, scale: parseScale(row.scale), description: row.description })),
    courses,
    filter,
  };
  const notes: Record<string, string> = {};
  for (const row of students) notes[String(row.id)] = String(row.notes ?? "");
  const courseName: Record<string, string> = {};
  for (const course of courses) courseName[course.id] = course.name;
  const yearLabel = years.find((year) => year.id === filter.yearId)?.label ?? "";
  return { input, ctx, yearLabel, schoolName: String(school.name), notes, courseName };
}

export async function dashboardFor(userId: string, data: { schoolId: string | null; filter: AnalyticsInput["filter"] }) {
  const loaded = await analyticsInputFor(userId, data.schoolId, data.filter);
  return buildDashboard(loaded.input);
}

export async function studentProfileFor(userId: string, data: { schoolId: string | null; studentId: string; yearId: string | null }) {
  const loaded = await analyticsInputFor(userId, data.schoolId, {
    yearId: data.yearId,
    series: null,
    classId: null,
    subjectId: null,
    periodId: null,
    studentId: data.studentId,
  });
  const student = loaded.input.students.find((item) => item.id === data.studentId);
  if (!student) throw new UserError("Estudante não encontrado.");
  const historyRows = await loaded.ctx.sql<Record<string, unknown>>`
    select e.status, e.started_on::text as started_on, e.ended_on::text as ended_on, e.series, y.label as year_label, c.name as class_name
    from student_enrollments e
    left join school_years y on y.id = e.year_id
    left join classes c on c.id = e.class_id
    where e.student_id = ${data.studentId} and e.school_id = ${loaded.ctx.schoolId}
    order by e.started_on asc nulls last, e.created_at asc
  `;
  const qualLabels = loaded.input.qualitative
    .filter((record) => record.studentId === data.studentId)
    .map((record) => ({
      date: record.date,
      criterion: loaded.input.criteria.find((criterion) => criterion.id === record.criterionId)?.name ?? "Critério",
      level: record.level,
      comment: record.comment,
      period: loaded.input.periods.find((period) => period.id === record.periodId)?.name ?? null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const view = buildStudentView({ ...loaded.input, studentId: data.studentId, qualLabels });
  if (!view) throw new UserError("Não foi possível montar o perfil.");
  const detail = await loaded.ctx.sql<Record<string, unknown>>`select notes, status, enrollment_code, series, class_id, course_id, year_id from students where id = ${data.studentId} and school_id = ${loaded.ctx.schoolId}`;
  return {
    student: {
      ...student,
      notes: String(detail[0]?.notes ?? ""),
      status: String(detail[0]?.status ?? student.status),
      series: detail[0]?.series ? String(detail[0].series) : null,
      classId: detail[0]?.class_id ? String(detail[0].class_id) : student.classId,
      courseId: detail[0]?.course_id ? String(detail[0].course_id) : null,
      yearId: detail[0]?.year_id ? String(detail[0].year_id) : null,
    },
    history: historyRows.map((row) => ({
      year: String(row.year_label ?? ""),
      className: String(row.class_name ?? "Sem turma"),
      series: String(row.series ?? ""),
      status: String(row.status),
      startedOn: row.started_on ? String(row.started_on) : null,
      endedOn: row.ended_on ? String(row.ended_on) : null,
    })),
    view,
    schoolName: loaded.schoolName,
    yearLabel: loaded.yearLabel,
  };
}

export async function gradebookFor(userId: string, data: { schoolId: string | null; classId: string; subjectId: string; periodId: string | null }) {
  const ctx = await access(userId, data.schoolId);
  assertSubject(ctx.scope, data.subjectId);
  const school = await schoolRow(ctx.sql, ctx.schoolId);
  const classes = await ctx.sql<Record<string, unknown>>`select id, passing_average, year_id, name from classes where id = ${data.classId} and school_id = ${ctx.schoolId}`;
  if (!classes[0]) throw new UserError("Turma não encontrada.");
  const students = await ctx.sql<{ id: string; full_name: string; enrollment_code: string | null }>`
    select id, full_name, enrollment_code from students
    where school_id = ${ctx.schoolId} and class_id = ${data.classId} and archived = false and status = 'ativo'
    order by full_name
  `;
  const assessments = await ctx.sql<Record<string, unknown>>`
    select a.id, a.name, a.assessed_on::text as assessed_on, a.kind, a.max_score, a.weight, a.is_recovery, a.period_id, a.notes, p.name as period_name, p.ord
    from assessments a
    left join periods p on p.id = a.period_id
    where a.school_id = ${ctx.schoolId} and a.class_id = ${data.classId} and a.subject_id = ${data.subjectId}
      and (${data.periodId}::text is null or a.period_id = ${data.periodId})
    order by p.ord nulls last, a.assessed_on nulls last, a.created_at
  `;
  const ids = assessments.map((row) => String(row.id));
  const scores = ids.length
    ? await ctx.sql.query<Record<string, unknown>>(
        `select assessment_id, student_id, value, mark_status from scores where school_id = $1 and assessment_id = any($2::text[])`,
        [ctx.schoolId, ids],
      )
    : [];
  const periods = await ctx.sql<{ id: string; name: string; ord: number }>`
    select id, name, ord from periods where school_id = ${ctx.schoolId} and year_id = ${String(classes[0].year_id)} order by ord
  `;
  return {
    students: students.map((student) => ({ id: student.id, name: student.full_name, enrollment: student.enrollment_code })),
    assessments: assessments.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      date: row.assessed_on ? String(row.assessed_on) : null,
      kind: String(row.kind),
      maxScore: asNumber(row.max_score, 10),
      weight: asNumber(row.weight, 1),
      isRecovery: row.is_recovery === true,
      periodId: row.period_id ? String(row.period_id) : null,
      periodName: row.period_name ? String(row.period_name) : "Sem período",
      notes: String(row.notes ?? ""),
    })),
    scores: scores.map((row) => ({
      assessmentId: String(row.assessment_id),
      studentId: String(row.student_id),
      value: asNumberOrNull(row.value),
      status: String(row.mark_status),
    })),
    policy: policyOf(school),
    passing: asNumberOrNull(classes[0].passing_average) ?? policyOf(school).passing,
    periods: periods.map((period) => ({ id: period.id, name: period.name, ord: asNumber(period.ord) })),
    rules: rulesText(policyOf(school)),
    className: String(classes[0].name),
  };
}

export async function saveAssessmentFor(userId: string, data: Record<string, unknown>) {
  const ctx = await access(userId, strOrNull(data.schoolId));
  assertRole(ctx.role, "academic");
  const classId = String(data.classId ?? "");
  const subjectId = String(data.subjectId ?? "");
  assertSubject(ctx.scope, subjectId);
  const name = clip(data.name, 120);
  if (name.length < 2) throw new UserError("Informe o nome da avaliação.");
  const kind = ASSESSMENT_KINDS.find((item) => item.id === data.kind)?.id as AssessmentKind | undefined;
  if (!kind) throw new UserError("Tipo de avaliação inválido.");
  const school = await schoolRow(ctx.sql, ctx.schoolId);
  const scale = asNumber(school.grade_scale_max, 10);
  const maxScore = asNumber(data.maxScore, scale);
  const weight = asNumber(data.weight, 1);
  if (!(maxScore > 0) || maxScore > scale + 1e-9) throw new UserError(`A nota máxima precisa ser maior que zero e no máximo ${scale}.`);
  if (!(weight > 0) || weight > 100) throw new UserError("O peso precisa ser maior que zero.");
  const periodId = strOrNull(data.periodId);
  if (periodId) {
    const period = await ctx.sql`select id from periods where id = ${periodId} and school_id = ${ctx.schoolId}`;
    if (!period.length) throw new UserError("Período inválido.");
  }
  const klass = await ctx.sql`select id from classes where id = ${classId} and school_id = ${ctx.schoolId}`;
  const subject = await ctx.sql`select id from subjects where id = ${subjectId} and school_id = ${ctx.schoolId}`;
  if (!klass.length || !subject.length) throw new UserError("Turma ou disciplina inválida.");
  const date = strOrNull(data.date);
  const notes = clip(data.notes, 2000);
  const isRecovery = data.isRecovery === true || kind === "recuperacao";
  const id = strOrNull(data.id);
  if (id) {
    await ctx.sql`
      update assessments set name = ${name}, assessed_on = ${date}, kind = ${kind}, max_score = ${maxScore}, weight = ${weight},
        notes = ${notes}, is_recovery = ${isRecovery}, period_id = ${periodId}, updated_at = now()
      where id = ${id} and school_id = ${ctx.schoolId}
    `;
    await audit(ctx.sql, ctx.schoolId, userId, "alterar", "avaliacao", id, `Avaliação ${name} alterada. As notas lançadas foram mantidas.`);
    return { id };
  }
  const newId = uid();
  await ctx.sql`
    insert into assessments (id, school_id, class_id, subject_id, period_id, name, assessed_on, kind, max_score, weight, notes, is_recovery)
    values (${newId}, ${ctx.schoolId}, ${classId}, ${subjectId}, ${periodId}, ${name}, ${date}, ${kind}, ${maxScore}, ${weight}, ${notes}, ${isRecovery})
  `;
  await audit(ctx.sql, ctx.schoolId, userId, "criar", "avaliacao", newId, `Avaliação ${name} criada.`);
  return { id: newId };
}

export async function deleteAssessmentFor(userId: string, data: { schoolId: string | null; id: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  const rows = await ctx.sql<{ name: string; subject_id: string }>`select name, subject_id from assessments where id = ${data.id} and school_id = ${ctx.schoolId}`;
  if (!rows[0]) throw new UserError("Avaliação não encontrada.");
  assertSubject(ctx.scope, rows[0].subject_id);
  await ctx.sql`delete from assessments where id = ${data.id} and school_id = ${ctx.schoolId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "excluir", "avaliacao", data.id, `Avaliação ${rows[0].name} excluída com as notas vinculadas.`);
  return { ok: true };
}

export async function saveScoresFor(
  userId: string,
  data: { schoolId: string | null; items: { assessmentId: string; studentId: string; value: number | null; status: MarkStatus }[] },
) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 300) {
    throw new UserError("Envie entre 1 e 300 lançamentos por vez.");
  }
  const assessmentIds = [...new Set(data.items.map((item) => item.assessmentId))];
  const assessments = await ctx.sql.query<{ id: string; max_score: number; subject_id: string; school_id: string }>(
    `select id, max_score, subject_id, school_id from assessments where school_id = $1 and id = any($2::text[])`,
    [ctx.schoolId, assessmentIds],
  );
  const byId = new Map(assessments.map((row) => [row.id, row]));
  const studentIds = [...new Set(data.items.map((item) => item.studentId))];
  const knownStudents = await ctx.sql.query<{ id: string }>(
    `select id from students where school_id = $1 and id = any($2::text[])`,
    [ctx.schoolId, studentIds],
  );
  if (knownStudents.length !== studentIds.length) throw new UserError("Há estudante fora desta escola no lançamento.");
  for (const item of data.items) {
    const assessment = byId.get(item.assessmentId);
    if (!assessment) throw new UserError("Avaliação não encontrada.");
    assertSubject(ctx.scope, assessment.subject_id);
    const maxScore = asNumber(assessment.max_score, 10);
    if (item.status === "graded") {
      if (item.value == null || Number.isNaN(item.value)) throw new UserError("Informe a nota ou marque como pendente. Vazio não vira zero.");
      if (item.value < 0 || item.value > maxScore + 1e-9) throw new UserError(`A nota precisa estar entre 0 e ${maxScore}.`);
    } else if (item.value != null) {
      throw new UserError("Ausência, dispensa, pendência e não aplicável não guardam número.");
    }
    if (!["graded", "pending", "absent", "excused", "na"].includes(item.status)) throw new UserError("Situação da nota inválida.");
  }
  for (const item of data.items) {
    const value = item.status === "graded" ? item.value : null;
    await ctx.sql`
      insert into scores (id, school_id, assessment_id, student_id, value, mark_status, updated_at)
      values (${uid()}, ${ctx.schoolId}, ${item.assessmentId}, ${item.studentId}, ${value}, ${item.status}, now())
      on conflict (assessment_id, student_id) do update set value = excluded.value, mark_status = excluded.mark_status, updated_at = now()
    `;
  }
  return { saved: data.items.length };
}

export async function saveCriterionFor(userId: string, data: Record<string, unknown>) {
  const ctx = await access(userId, strOrNull(data.schoolId));
  assertRole(ctx.role, "academic");
  const name = clip(data.name, 120);
  const description = clip(data.description, 500);
  const scale = Array.isArray(data.scale) ? data.scale.map((item) => clip(item, 80)).filter(Boolean) : [];
  if (name.length < 3) throw new UserError("Informe o critério.");
  if (scale.length < 2) throw new UserError("A escala precisa ter pelo menos dois níveis.");
  const id = strOrNull(data.id);
  if (id) {
    await ctx.sql`update qual_criteria set name = ${name}, description = ${description}, scale = ${JSON.stringify(scale)}, active = ${data.active !== false} where id = ${id} and school_id = ${ctx.schoolId}`;
  } else {
    const ordRows = await ctx.sql<{ n: number }>`select coalesce(max(ord), 0)::int as n from qual_criteria where school_id = ${ctx.schoolId}`;
    try {
      await ctx.sql`insert into qual_criteria (id, school_id, name, description, scale, active, ord) values (${uid()}, ${ctx.schoolId}, ${name}, ${description}, ${JSON.stringify(scale)}, true, ${asNumber(ordRows[0]?.n) + 1})`;
    } catch (error) {
      if (isUnique(error)) throw new UserError("Já existe um critério com esse nome.");
      throw error;
    }
  }
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function qualListFor(userId: string, data: { schoolId: string | null; classId: string | null; studentId: string | null; criterionId: string | null }) {
  const ctx = await access(userId, data.schoolId);
  const rows = await ctx.sql<Record<string, unknown>>`
    select q.id, q.student_id, q.criterion_id, q.period_id, q.recorded_on::text as recorded_on, q.level, q.comment, s.full_name, s.class_id
    from qual_records q
    join students s on s.id = q.student_id
    where q.school_id = ${ctx.schoolId}
      and (${data.classId}::text is null or s.class_id = ${data.classId})
      and (${data.studentId}::text is null or q.student_id = ${data.studentId})
      and (${data.criterionId}::text is null or q.criterion_id = ${data.criterionId})
    order by q.recorded_on desc, s.full_name
    limit 500
  `;
  return rows.map((row) => ({
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: String(row.full_name),
    classId: row.class_id ? String(row.class_id) : null,
    criterionId: String(row.criterion_id),
    periodId: row.period_id ? String(row.period_id) : null,
    date: String(row.recorded_on),
    level: String(row.level),
    comment: String(row.comment ?? ""),
  }));
}

export async function saveQualFor(userId: string, data: Record<string, unknown>) {
  const ctx = await access(userId, strOrNull(data.schoolId));
  assertRole(ctx.role, "academic");
  const studentId = String(data.studentId ?? "");
  const criterionId = String(data.criterionId ?? "");
  const level = clip(data.level, 80);
  const comment = clip(data.comment, 2000);
  const date = strOrNull(data.date) ?? todayBR();
  const periodId = strOrNull(data.periodId);
  const student = await ctx.sql`select id from students where id = ${studentId} and school_id = ${ctx.schoolId}`;
  const criteria = await ctx.sql<{ scale: string }>`select scale from qual_criteria where id = ${criterionId} and school_id = ${ctx.schoolId}`;
  if (!student.length || !criteria[0]) throw new UserError("Estudante ou critério inválido.");
  const scale = parseScale(criteria[0].scale);
  if (!scale.some((item) => normalizeKey(item) === normalizeKey(level))) {
    throw new UserError("O nível precisa ser um dos descritores configurados no critério.");
  }
  const canonical = scale.find((item) => normalizeKey(item) === normalizeKey(level)) ?? level;
  const id = strOrNull(data.id);
  if (id) {
    await ctx.sql`update qual_records set level = ${canonical}, comment = ${comment}, recorded_on = ${date}, period_id = ${periodId}, updated_at = now() where id = ${id} and school_id = ${ctx.schoolId}`;
    return { id };
  }
  const newId = uid();
  await ctx.sql`insert into qual_records (id, school_id, student_id, criterion_id, period_id, recorded_on, level, comment) values (${newId}, ${ctx.schoolId}, ${studentId}, ${criterionId}, ${periodId}, ${date}, ${canonical}, ${comment})`;
  return { id: newId };
}

export async function deleteQualFor(userId: string, data: { schoolId: string | null; id: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  await ctx.sql`delete from qual_records where id = ${data.id} and school_id = ${ctx.schoolId}`;
  return { ok: true };
}

export async function attendanceFor(userId: string, data: { schoolId: string | null; classId: string }) {
  const ctx = await access(userId, data.schoolId);
  const sessions = await ctx.sql<Record<string, unknown>>`
    select id, subject_id, period_id, session_date::text as session_date, label
    from attendance_sessions where school_id = ${ctx.schoolId} and class_id = ${data.classId}
    order by session_date desc, created_at desc
  `;
  const visible = sessions.filter((session) => !ctx.scope || !session.subject_id || ctx.scope.includes(String(session.subject_id)));
  const ids = visible.map((session) => String(session.id));
  const marks = ids.length
    ? await ctx.sql.query<{ session_id: string; student_id: string; mark: string }>(
        `select session_id, student_id, mark from attendance_marks where school_id = $1 and session_id = any($2::text[])`,
        [ctx.schoolId, ids],
      )
    : [];
  const students = await ctx.sql<{ id: string; full_name: string }>`
    select id, full_name from students where school_id = ${ctx.schoolId} and class_id = ${data.classId} and archived = false and status = 'ativo' order by full_name
  `;
  return {
    sessions: visible.map((session) => ({
      id: String(session.id),
      subjectId: session.subject_id ? String(session.subject_id) : null,
      periodId: session.period_id ? String(session.period_id) : null,
      date: String(session.session_date),
      label: String(session.label ?? ""),
    })),
    marks: marks.map((mark) => ({ sessionId: mark.session_id, studentId: mark.student_id, status: mark.mark })),
    students: students.map((student) => ({ id: student.id, name: student.full_name })),
  };
}

export async function saveSessionFor(userId: string, data: { schoolId: string | null; classId: string; subjectId: string | null; periodId: string | null; date: string; label: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  if (data.subjectId) assertSubject(ctx.scope, data.subjectId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new UserError("Data da aula inválida.");
  const klass = await ctx.sql`select id from classes where id = ${data.classId} and school_id = ${ctx.schoolId}`;
  if (!klass.length) throw new UserError("Turma não encontrada.");
  const id = uid();
  await ctx.sql`insert into attendance_sessions (id, school_id, class_id, subject_id, period_id, session_date, label) values (${id}, ${ctx.schoolId}, ${data.classId}, ${data.subjectId}, ${data.periodId}, ${data.date}, ${clip(data.label, 80)})`;
  const students = await ctx.sql<{ id: string }>`select id from students where school_id = ${ctx.schoolId} and class_id = ${data.classId} and archived = false and status = 'ativo'`;
  for (const student of students) {
    await ctx.sql`insert into attendance_marks (id, school_id, session_id, student_id, mark) values (${uid()}, ${ctx.schoolId}, ${id}, ${student.id}, ${"pending"})`;
  }
  return { id };
}

export async function saveMarksFor(userId: string, data: { schoolId: string | null; items: { sessionId: string; studentId: string; status: string }[] }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  const sessionIds = [...new Set(data.items.map((item) => item.sessionId))];
  const known = await ctx.sql.query<{ id: string }>(
    `select id from attendance_sessions where school_id = $1 and id = any($2::text[])`,
    [ctx.schoolId, sessionIds],
  );
  if (known.length !== sessionIds.length) throw new UserError("Há aula fora desta escola no registro.");
  const studentIds = [...new Set(data.items.map((item) => item.studentId))];
  const knownStudents = await ctx.sql.query<{ id: string }>(
    `select id from students where school_id = $1 and id = any($2::text[])`,
    [ctx.schoolId, studentIds],
  );
  if (knownStudents.length !== studentIds.length) throw new UserError("Há estudante fora desta escola na frequência.");
  for (const item of data.items) {
    if (!FREQ_MARKS.some((mark) => mark.id === item.status)) throw new UserError("Situação de frequência inválida.");
    await ctx.sql`
      insert into attendance_marks (id, school_id, session_id, student_id, mark)
      values (${uid()}, ${ctx.schoolId}, ${item.sessionId}, ${item.studentId}, ${item.status})
      on conflict (session_id, student_id) do update set mark = excluded.mark
    `;
  }
  return { saved: data.items.length };
}

export async function deleteSessionFor(userId: string, data: { schoolId: string | null; id: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  await ctx.sql`delete from attendance_sessions where id = ${data.id} and school_id = ${ctx.schoolId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "excluir", "frequencia", data.id, "Aula de frequência excluída.");
  return { ok: true };
}

export async function reportFor(
  userId: string,
  data: { schoolId: string | null; kind: ExportKind; filter: AnalyticsInput["filter"]; includeNotes: boolean; columns: string[] | null },
) {
  const loaded = await analyticsInputFor(userId, data.schoolId, data.filter);
  const sessions = await loaded.ctx.sql<Record<string, unknown>>`
    select s.id, s.class_id, s.subject_id, s.session_date::text as session_date, s.label, m.student_id, m.mark
    from attendance_sessions s
    join attendance_marks m on m.session_id = s.id
    where s.school_id = ${loaded.ctx.schoolId}
  `;
  const criterionName = new Map(loaded.input.criteria.map((criterion) => [criterion.id, criterion.name]));
  const periodName = new Map(loaded.input.periods.map((period) => [period.id, period.name]));
  return buildReport({
    ...loaded.input,
    kind: data.kind,
    includeNotes: data.includeNotes === true,
    columns: data.columns,
    schoolName: loaded.schoolName,
    yearLabel: loaded.yearLabel,
    notes: data.includeNotes ? loaded.notes : {},
    courseName: loaded.courseName,
    sessions: sessions.map((row) => ({
      id: String(row.id),
      classId: String(row.class_id),
      subjectId: row.subject_id ? String(row.subject_id) : null,
      date: String(row.session_date),
      label: String(row.label ?? ""),
      studentId: String(row.student_id),
      status: String(row.mark),
    })),
    qualRecords: loaded.input.qualitative.map((record) => ({
      studentId: record.studentId,
      criterion: criterionName.get(record.criterionId) ?? "",
      period: record.periodId ? (periodName.get(record.periodId) ?? null) : null,
      date: record.date,
      level: record.level,
      comment: data.includeNotes ? record.comment : "",
    })),
  });
}

export async function previewImportFor(userId: string, data: ImportRequest) {
  const planned = await planImport(userId, data);
  const summary = summarizePlans(planned.plans);
  const notable = planned.plans.filter((plan) => plan.action !== "add");
  const sampleAdds = planned.plans.filter((plan) => plan.action === "add").slice(0, 15);
  const visible = [...notable.slice(0, 300), ...sampleAdds].map((plan) => ({
    row: plan.row,
    action: plan.action,
    message: plan.message,
  }));
  return { summary, plans: visible, totalPlans: planned.plans.length };
}

export async function commitImportFor(userId: string, data: ImportRequest) {
  const planned = await planImport(userId, data);
  const summary = { added: 0, updated: 0, ignored: 0, rejected: 0 };
  const issues: { row: number; message: string }[] = [];
  for (const plan of planned.plans) {
    if (plan.action === "ignore" || plan.action === "reject") {
      summary[plan.action === "ignore" ? "ignored" : "rejected"] += 1;
      if (plan.action === "reject" || plan.action === "ignore") issues.push({ row: plan.row, message: plan.message });
      continue;
    }
    try {
      const wrote = await applyPlan(planned, plan);
      summary[wrote] += 1;
    } catch (error) {
      summary.rejected += 1;
      issues.push({ row: plan.row, message: error instanceof UserError ? error.message : "Falha ao gravar a linha." });
    }
  }
  await audit(
    planned.ctx.sql,
    planned.ctx.schoolId,
    userId,
    "importar",
    data.kind,
    null,
    `Importação ${data.kind}: ${summary.added} novos, ${summary.updated} atualizados, ${summary.ignored} ignorados, ${summary.rejected} rejeitados.`,
  );
  return { summary, issues: issues.slice(0, 200) };
}

type ImportRequest = {
  schoolId: string | null;
  kind: ImportKind;
  mode: ImportMode;
  allowNameMatch: boolean;
  allowSameName: boolean;
  yearId: string;
  records: { sheetRow: number; values: Record<string, unknown> }[];
};

async function planImport(userId: string, data: ImportRequest) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "academic");
  if (!Array.isArray(data.records) || data.records.length > 1500) {
    throw new UserError("Envie no máximo 1500 linhas por lote. Arquivos maiores são gravados em partes.");
  }
  const yearRows = await ctx.sql<{ id: string; label: string }>`select id, label from school_years where id = ${data.yearId} and school_id = ${ctx.schoolId}`;
  if (!yearRows[0]) throw new UserError("Escolha o ano letivo de destino.");
  const school = await schoolRow(ctx.sql, ctx.schoolId);
  const [studentRows, classRows, subjectRows, periodRows, assessmentRows, criteriaRows] = await Promise.all([
    ctx.sql<{ id: string; full_name: string; enrollment_code: string | null; class_id: string | null; year_id: string | null; archived: boolean }>`select id, full_name, enrollment_code, class_id, year_id, archived from students where school_id = ${ctx.schoolId}`,
    ctx.sql<{ id: string; year_id: string; series: string; name: string; course_id: string | null }>`select id, year_id, series, name, course_id from classes where school_id = ${ctx.schoolId} and archived = false`,
    ctx.sql<{ id: string; name: string }>`select id, name from subjects where school_id = ${ctx.schoolId}`,
    ctx.sql<{ id: string; year_id: string; ord: number; name: string; kind: string }>`select id, year_id, ord, name, kind from periods where school_id = ${ctx.schoolId}`,
    ctx.sql<{ id: string; class_id: string; subject_id: string; period_id: string | null; name: string; is_recovery: boolean }>`select id, class_id, subject_id, period_id, name, is_recovery from assessments where school_id = ${ctx.schoolId}`,
    ctx.sql<{ id: string; name: string; scale: string }>`select id, name, scale from qual_criteria where school_id = ${ctx.schoolId}`,
  ]);
  const existingStudents: ExistingStudent[] = studentRows.map((student) => ({
    id: student.id,
    name: student.full_name,
    enrollment: student.enrollment_code,
    classId: student.class_id,
    yearId: student.year_id,
    archived: student.archived === true,
  }));
  const mappedClasses: ExistingClass[] = classRows.map((klass) => ({
    id: klass.id,
    yearId: klass.year_id,
    series: klass.series,
    name: klass.name,
    courseId: klass.course_id,
  }));
  const mappedSubjects: ExistingSubject[] = subjectRows;
  const mappedPeriods: ExistingPeriod[] = periodRows.map((period) => ({
    id: period.id,
    yearId: period.year_id,
    ord: asNumber(period.ord),
    name: period.name,
    kind: period.kind,
  }));
  const mappedAssessments: ExistingAssessment[] = assessmentRows.map((assessment) => ({
    id: assessment.id,
    classId: assessment.class_id,
    subjectId: assessment.subject_id,
    periodId: assessment.period_id,
    name: assessment.name,
    isRecovery: assessment.is_recovery === true,
  }));
  const mappedCriteria: ExistingCriterion[] = criteriaRows.map((criterion) => ({
    id: criterion.id,
    name: criterion.name,
    scale: parseScale(criterion.scale),
  }));
  const courses = await ctx.sql<ExistingCourse>`select id, name from courses where school_id = ${ctx.schoolId}`;
  let plans: ImportPlan[] = [];
  if (data.kind === "students") {
    plans = planStudentImport(existingStudents, data.records, {
      mode: data.mode,
      allowNameMatch: data.allowNameMatch,
      allowSameName: data.allowSameName,
      yearId: data.yearId,
      yearLabel: yearRows[0].label,
    });
  } else if (data.kind === "classes") {
    plans = planClassImport(data.records, mappedClasses, data.yearId, data.mode);
  } else if (data.kind === "scores") {
    plans = planScoreImport(data.records, {
      students: existingStudents,
      classes: mappedClasses,
      subjects: mappedSubjects,
      periods: mappedPeriods,
      assessments: mappedAssessments,
      yearId: data.yearId,
      scaleMax: asNumber(school.grade_scale_max, 10),
      mode: data.mode,
      allowNameMatch: data.allowNameMatch,
    });
  } else if (data.kind === "assessments") {
    plans = planAssessmentImport(data.records, {
      classes: mappedClasses,
      subjects: mappedSubjects,
      periods: mappedPeriods,
      assessments: mappedAssessments,
      yearId: data.yearId,
      scaleMax: asNumber(school.grade_scale_max, 10),
      mode: data.mode,
    });
  } else {
    plans = planQualImport(data.records, {
      students: existingStudents,
      criteria: mappedCriteria,
      periods: mappedPeriods,
      yearId: data.yearId,
      mode: data.mode,
      allowNameMatch: data.allowNameMatch,
    });
  }
  return { plans, ctx, yearId: data.yearId, courses, mappedClasses, mappedSubjects, mappedPeriods, mappedAssessments, scaleMax: asNumber(school.grade_scale_max, 10) };
}

async function applyPlan(
  planned: Awaited<ReturnType<typeof planImport>>,
  plan: ImportPlan,
): Promise<"added" | "updated"> {
  const payload = plan.payload;
  const { ctx } = planned;
  if (payload.fullName && payload.className && !payload.assessmentName && !payload.studentId && plan.action === "add" && payload.series && !payload.subjectName) {
    await insertStudent(ctx, planned.yearId, planned.courses, payload);
    return "added";
  }
  if (payload.fullName && !payload.subjectName && !payload.assessmentName && (plan.action === "add" || plan.action === "update") && "status" in payload && !("markStatus" in payload)) {
    if (plan.action === "add") {
      await insertStudent(ctx, planned.yearId, planned.courses, payload);
      return "added";
    }
    await updateImportedStudent(ctx, planned.yearId, planned.courses, payload);
    return "updated";
  }
  if (payload.className && payload.series && payload.teacher !== undefined && !payload.subjectName) {
    await upsertClass(ctx, planned.yearId, planned.courses, payload);
    return plan.action === "add" ? "added" : "updated";
  }
  if (payload.markStatus || payload.createStudent || payload.assessmentName && payload.fullName) {
    await upsertScore(ctx, planned, payload);
    return payload.createStudent ? "added" : "updated";
  }
  if (payload.assessmentName && !payload.fullName) {
    await upsertAssessment(ctx, planned, payload);
    return plan.action === "add" ? "added" : "updated";
  }
  if (payload.criterionId && payload.studentId) {
    await ctx.sql`insert into qual_records (id, school_id, student_id, criterion_id, period_id, recorded_on, level, comment) values (${uid()}, ${ctx.schoolId}, ${String(payload.studentId)}, ${String(payload.criterionId)}, ${strOrNull(payload.periodId)}, ${strOrNull(payload.date) ?? todayBR()}, ${String(payload.level)}, ${String(payload.comment ?? "")})`;
    return "added";
  }
  throw new UserError("Linha não reconhecida.");
}

async function ensureCourse(ctx: Awaited<ReturnType<typeof access>>, courses: ExistingCourse[], name: string) {
  if (!name) return null;
  const found = courses.find((course) => normalizeKey(course.name) === normalizeKey(name));
  if (found) return found.id;
  const id = uid();
  await ctx.sql`insert into courses (id, school_id, name) values (${id}, ${ctx.schoolId}, ${name})`;
  courses.push({ id, name });
  return id;
}

async function ensureClass(
  ctx: Awaited<ReturnType<typeof access>>,
  yearId: string,
  courses: ExistingCourse[],
  className: string,
  series: string,
  courseName: string,
  teacher = "",
) {
  const existing = await ctx.sql<{ id: string }>`
    select id from classes where school_id = ${ctx.schoolId} and year_id = ${yearId} and series = ${series} and lower(name) = lower(${className}) and archived = false
  `;
  if (existing[0]) return existing[0].id;
  if (series !== "1" && series !== "2" && series !== "3") throw new UserError("Série obrigatória para criar a turma.");
  const courseId = await ensureCourse(ctx, courses, courseName);
  const id = uid();
  await ctx.sql`insert into classes (id, school_id, year_id, course_id, series, name, teacher_name) values (${id}, ${ctx.schoolId}, ${yearId}, ${courseId}, ${series}, ${className}, ${teacher})`;
  return id;
}

async function insertStudent(ctx: Awaited<ReturnType<typeof access>>, yearId: string, courses: ExistingCourse[], payload: Record<string, unknown>) {
  const series = payload.series ? String(payload.series) : null;
  const className = payload.className ? String(payload.className) : "";
  let classId: string | null = null;
  let courseId: string | null = null;
  if (className) {
    if (!series) throw new UserError("Informe a série para criar ou achar a turma.");
    classId = await ensureClass(ctx, yearId, courses, className, series, String(payload.courseName ?? ""));
  } else if (payload.courseName) {
    courseId = await ensureCourse(ctx, courses, String(payload.courseName));
  }
  const id = uid();
  await ctx.sql`
    insert into students (id, school_id, full_name, enrollment_code, year_id, class_id, course_id, series, status, notes)
    values (${id}, ${ctx.schoolId}, ${String(payload.fullName)}, ${strOrNull(payload.enrollment)}, ${yearId}, ${classId}, ${courseId}, ${series}, ${String(payload.status ?? "ativo")}, ${String(payload.notes ?? "")})
  `;
  await ctx.sql`insert into student_enrollments (id, school_id, student_id, year_id, class_id, course_id, series, status, started_on) values (${uid()}, ${ctx.schoolId}, ${id}, ${yearId}, ${classId}, ${courseId}, ${series}, ${"ativo"}, ${todayBR()})`;
}

async function updateImportedStudent(ctx: Awaited<ReturnType<typeof access>>, yearId: string, courses: ExistingCourse[], payload: Record<string, unknown>) {
  const id = String(payload.studentId ?? "");
  if (!id || id.startsWith("new:")) throw new UserError("Estudante de atualização não identificado.");
  const series = payload.series ? String(payload.series) : null;
  let classId: string | null = null;
  if (payload.className && series) classId = await ensureClass(ctx, yearId, courses, String(payload.className), series, String(payload.courseName ?? ""));
  const current = await ctx.sql<{ class_id: string | null }>`select class_id from students where id = ${id} and school_id = ${ctx.schoolId}`;
  if (!current[0]) throw new UserError("Estudante não encontrado na atualização.");
  await ctx.sql`
    update students set full_name = ${String(payload.fullName)}, enrollment_code = ${strOrNull(payload.enrollment)},
      year_id = ${yearId}, class_id = coalesce(${classId}, class_id), series = coalesce(${series}, series),
      status = ${String(payload.status ?? "ativo")}, notes = case when ${String(payload.notes ?? "")} = '' then notes else ${String(payload.notes ?? "")} end,
      archived = false, updated_at = now()
    where id = ${id} and school_id = ${ctx.schoolId}
  `;
  if (classId && current[0].class_id !== classId) {
    await ctx.sql`update student_enrollments set status = 'encerrado', ended_on = ${todayBR()} where student_id = ${id} and status = 'ativo' and ended_on is null`;
    await ctx.sql`insert into student_enrollments (id, school_id, student_id, year_id, class_id, series, status, started_on) values (${uid()}, ${ctx.schoolId}, ${id}, ${yearId}, ${classId}, ${series}, ${"ativo"}, ${todayBR()})`;
  }
}

async function upsertClass(ctx: Awaited<ReturnType<typeof access>>, yearId: string, courses: ExistingCourse[], payload: Record<string, unknown>) {
  const classId = await ensureClass(ctx, yearId, courses, String(payload.className), String(payload.series), String(payload.courseName ?? ""), String(payload.teacher ?? ""));
  if (payload.teacher) {
    await ctx.sql`update classes set teacher_name = ${String(payload.teacher)}, updated_at = now() where id = ${classId}`;
  }
}

async function ensureSubject(ctx: Awaited<ReturnType<typeof access>>, name: string, known: ExistingSubject[]) {
  const found = known.find((subject) => normalizeKey(subject.name) === normalizeKey(name));
  if (found) {
    assertSubject(ctx.scope, found.id);
    return found.id;
  }
  if (ctx.scope) throw new UserError(`Sem permissão para criar a disciplina ${name}.`);
  const id = uid();
  await ctx.sql`insert into subjects (id, school_id, name) values (${id}, ${ctx.schoolId}, ${name})`;
  known.push({ id, name });
  return id;
}

async function upsertAssessment(
  ctx: Awaited<ReturnType<typeof access>>,
  planned: Awaited<ReturnType<typeof planImport>>,
  payload: Record<string, unknown>,
) {
  const series = payload.series ? String(payload.series) : "1";
  const classId = payload.classId
    ? String(payload.classId)
    : await ensureClass(ctx, planned.yearId, planned.courses, String(payload.className), series, "");
  const subjectId = payload.subjectId
    ? String(payload.subjectId)
    : await ensureSubject(ctx, String(payload.subjectName), planned.mappedSubjects);
  assertSubject(ctx.scope, subjectId);
  if (payload.assessmentId) {
    await ctx.sql`
      update assessments set name = ${String(payload.assessmentName)}, kind = ${String(payload.kind)}, weight = ${asNumber(payload.weight, 1)},
        max_score = ${asNumber(payload.maxScore, planned.scaleMax)}, assessed_on = ${strOrNull(payload.date)}, is_recovery = ${payload.isRecovery === true},
        period_id = ${strOrNull(payload.periodId)}, updated_at = now()
      where id = ${String(payload.assessmentId)} and school_id = ${ctx.schoolId}
    `;
    return String(payload.assessmentId);
  }
  const existing = planned.mappedAssessments.find(
    (assessment) =>
      assessment.classId === classId &&
      assessment.subjectId === subjectId &&
      assessment.periodId === (strOrNull(payload.periodId)) &&
      normalizeKey(assessment.name) === normalizeKey(String(payload.assessmentName)),
  );
  if (existing) return existing.id;
  const id = uid();
  await ctx.sql`
    insert into assessments (id, school_id, class_id, subject_id, period_id, name, assessed_on, kind, max_score, weight, is_recovery)
    values (${id}, ${ctx.schoolId}, ${classId}, ${subjectId}, ${strOrNull(payload.periodId)}, ${String(payload.assessmentName)}, ${strOrNull(payload.date)}, ${String(payload.kind ?? "prova")}, ${asNumber(payload.maxScore, planned.scaleMax)}, ${asNumber(payload.weight, 1)}, ${payload.isRecovery === true})
  `;
  planned.mappedAssessments.push({
    id,
    classId,
    subjectId,
    periodId: strOrNull(payload.periodId),
    name: String(payload.assessmentName),
    isRecovery: payload.isRecovery === true,
  });
  return id;
}

async function upsertScore(ctx: Awaited<ReturnType<typeof access>>, planned: Awaited<ReturnType<typeof planImport>>, payload: Record<string, unknown>) {
  let studentId = strOrNull(payload.studentId);
  if (!studentId) {
    await insertStudent(ctx, planned.yearId, planned.courses, {
      fullName: payload.fullName,
      enrollment: payload.enrollment,
      series: payload.series,
      className: payload.className,
      courseName: "",
      status: "ativo",
      notes: "",
    });
    const created = await ctx.sql<{ id: string }>`
      select id from students where school_id = ${ctx.schoolId} and enrollment_code = ${strOrNull(payload.enrollment)} order by created_at desc limit 1
    `;
    studentId = created[0]?.id ?? null;
    if (!studentId && payload.fullName) {
      const byName = await ctx.sql<{ id: string }>`select id from students where school_id = ${ctx.schoolId} and full_name = ${String(payload.fullName)} order by created_at desc limit 1`;
      studentId = byName[0]?.id ?? null;
    }
  }
  if (!studentId) throw new UserError("Não foi possível identificar o estudante da nota.");
  const assessmentId = await upsertAssessment(ctx, planned, payload);
  const status = String(payload.markStatus ?? "pending");
  const value = status === "graded" ? asNumberOrNull(payload.value) : null;
  await ctx.sql`
    insert into scores (id, school_id, assessment_id, student_id, value, mark_status, updated_at)
    values (${uid()}, ${ctx.schoolId}, ${assessmentId}, ${studentId}, ${value}, ${status}, now())
    on conflict (assessment_id, student_id) do update set value = excluded.value, mark_status = excluded.mark_status, updated_at = now()
  `;
}

export async function backupFor(userId: string, data: { schoolId: string | null }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  const { sql, schoolId } = ctx;
  const [school, years, periods, courses, subjects, classes, links, students, enrollments, assessments, scores, criteria, quals, sessions, marks, staff] =
    await Promise.all([
      sql`select id, name, grade_scale_max, passing_average, period_model, calculation_mode, recovery_policy, absence_counts_as_zero, justified_rule, late_rule, frequency_min_percent from schools where id = ${schoolId}`,
      sql`select * from school_years where school_id = ${schoolId}`,
      sql`select * from periods where school_id = ${schoolId}`,
      sql`select * from courses where school_id = ${schoolId}`,
      sql`select * from subjects where school_id = ${schoolId}`,
      sql`select * from classes where school_id = ${schoolId}`,
      sql`select * from class_subjects where school_id = ${schoolId}`,
      sql`select * from students where school_id = ${schoolId}`,
      sql`select * from student_enrollments where school_id = ${schoolId}`,
      sql`select * from assessments where school_id = ${schoolId}`,
      sql`select * from scores where school_id = ${schoolId}`,
      sql`select * from qual_criteria where school_id = ${schoolId}`,
      sql`select * from qual_records where school_id = ${schoolId}`,
      sql`select * from attendance_sessions where school_id = ${schoolId}`,
      sql`select * from attendance_marks where school_id = ${schoolId}`,
      sql`select * from staff where school_id = ${schoolId}`,
    ]);
  const dump = {
    version: 1,
    exportedAt: new Date().toISOString(),
    notice: "Cópia integral autorizada desta escola. Não inclui senhas nem chaves. Não é um backup automático.",
    school: school[0] ?? null,
    years,
    periods,
    courses,
    subjects,
    classes,
    classSubjects: links,
    students,
    enrollments,
    assessments,
    scores,
    criteria,
    qualitative: quals,
    sessions,
    marks,
    staff,
  };
  return JSON.parse(JSON.stringify(dump)) as {
    version: number;
    exportedAt: string;
    notice: string;
    school: Record<string, string | number | boolean | null> | null;
    years: Record<string, string | number | boolean | null>[];
    periods: Record<string, string | number | boolean | null>[];
    courses: Record<string, string | number | boolean | null>[];
    subjects: Record<string, string | number | boolean | null>[];
    classes: Record<string, string | number | boolean | null>[];
    classSubjects: Record<string, string | number | boolean | null>[];
    students: Record<string, string | number | boolean | null>[];
    enrollments: Record<string, string | number | boolean | null>[];
    assessments: Record<string, string | number | boolean | null>[];
    scores: Record<string, string | number | boolean | null>[];
    criteria: Record<string, string | number | boolean | null>[];
    qualitative: Record<string, string | number | boolean | null>[];
    sessions: Record<string, string | number | boolean | null>[];
    marks: Record<string, string | number | boolean | null>[];
    staff: Record<string, string | number | boolean | null>[];
  };
}

export async function auditFor(userId: string, data: { schoolId: string | null }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "settings");
  const rows = await ctx.sql<{ id: string; action: string; entity: string; summary: string; created_at: string }>`
    select id, action, entity, summary, created_at::text as created_at from audit_log
    where school_id = ${ctx.schoolId} order by created_at desc limit 80
  `;
  return rows;
}

export async function joinSchoolFor(userId: string, data: { code: string }) {
  const sql = await getSql();
  const code = cleanName(data.code).toUpperCase();
  const schools = await sql<{ id: string; name: string }>`select id, name from schools where invite_code = ${code}`;
  if (!schools[0]) throw new UserError("Código de convite não encontrado.");
  const existing = await sql`select school_id from school_members where school_id = ${schools[0].id} and user_id = ${userId}`;
  if (existing.length) throw new UserError("Você já participa desta escola.");
  await sql`insert into school_members (school_id, user_id, role, display_name) values (${schools[0].id}, ${userId}, ${"professor"}, ${""})`;
  await audit(sql, schools[0].id, userId, "entrar", "membro", userId, "Novo professor entrou pelo código de convite.");
  return { schoolId: schools[0].id, name: schools[0].name };
}

export async function regenerateInviteFor(userId: string, data: { schoolId: string | null }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "admin");
  const code = inviteCode();
  await ctx.sql`update schools set invite_code = ${code}, updated_at = now() where id = ${ctx.schoolId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "alterar", "convite", ctx.schoolId, "Código de convite regenerado. O anterior deixou de valer.");
  return { code };
}

export async function updateMemberFor(userId: string, data: { schoolId: string | null; memberId: string; role: Role; subjectScope: string[] | null }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "admin");
  if (!["admin", "coordenacao", "professor"].includes(data.role)) throw new UserError("Papel inválido.");
  if (data.memberId === userId && data.role !== "admin") {
    const admins = await ctx.sql<{ n: number }>`select count(*)::int as n from school_members where school_id = ${ctx.schoolId} and role = 'admin'`;
    if (asNumber(admins[0]?.n) <= 1) throw new UserError("A escola precisa manter pelo menos um administrador.");
  }
  const scope = data.subjectScope && data.subjectScope.length ? JSON.stringify(data.subjectScope) : null;
  await ctx.sql`update school_members set role = ${data.role}, subject_scope = ${scope} where school_id = ${ctx.schoolId} and user_id = ${data.memberId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "alterar", "membro", data.memberId, "Papel ou disciplinas do membro atualizados.");
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function updateMyNameFor(userId: string, data: { schoolId: string | null; name: string }) {
  const ctx = await access(userId, data.schoolId);
  await ctx.sql`update school_members set display_name = ${clip(data.name, 120)} where school_id = ${ctx.schoolId} and user_id = ${userId}`;
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}

export async function removeMemberFor(userId: string, data: { schoolId: string | null; memberId: string }) {
  const ctx = await access(userId, data.schoolId);
  assertRole(ctx.role, "admin");
  if (data.memberId === userId) throw new UserError("Peça a outro administrador para remover a sua participação.");
  const target = await ctx.sql<{ role: string }>`select role from school_members where school_id = ${ctx.schoolId} and user_id = ${data.memberId}`;
  if (target[0]?.role === "admin") {
    const admins = await ctx.sql<{ n: number }>`select count(*)::int as n from school_members where school_id = ${ctx.schoolId} and role = 'admin'`;
    if (asNumber(admins[0]?.n) <= 1) throw new UserError("Não é possível remover o único administrador.");
  }
  await ctx.sql`delete from school_members where school_id = ${ctx.schoolId} and user_id = ${data.memberId}`;
  await audit(ctx.sql, ctx.schoolId, userId, "remover", "membro", data.memberId, "Acesso de um membro removido.");
  return getWorkspaceFor(userId, { schoolId: ctx.schoolId });
}
