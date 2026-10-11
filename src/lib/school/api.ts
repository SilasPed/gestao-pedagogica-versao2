import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { UserError } from "./errors.ts";
import type { AnalyticsFilter, DashboardModel } from "./analytics.ts";
import type { MarkStatus } from "./calc.ts";
import type { ImportKind } from "./constants.ts";
import type { ImportMode } from "./import-logic.ts";
import type { ExportKind, ReportBundle } from "./reports.ts";

async function guard<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof UserError) throw error;
    console.error(error);
    throw new UserError("Não foi possível concluir a operação. Verifique a conexão e tente de novo.");
  }
}

export const getWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { getWorkspaceFor } = await import("./db-api.ts");
    return guard(() => getWorkspaceFor(context.userId, data));
  });

export const updateSettings = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { updateSettingsFor } = await import("./db-api.ts");
    return guard(() => updateSettingsFor(context.userId, data));
  });

export const saveYear = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; label: string }) => data)
  .handler(async ({ context, data }) => {
    const { saveYearFor } = await import("./db-api.ts");
    return guard(() => saveYearFor(context.userId, data));
  });

export const activateYear = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; yearId: string }) => data)
  .handler(async ({ context, data }) => {
    const { activateYearFor } = await import("./db-api.ts");
    return guard(() => activateYearFor(context.userId, data));
  });

export const renamePeriod = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; periodId: string; name: string }) => data)
  .handler(async ({ context, data }) => {
    const { renamePeriodFor } = await import("./db-api.ts");
    return guard(() => renamePeriodFor(context.userId, data));
  });

export const saveCourse = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string | null; name: string }) => data)
  .handler(async ({ context, data }) => {
    const { saveCourseFor } = await import("./db-api.ts");
    return guard(() => saveCourseFor(context.userId, data));
  });

export const deleteCourse = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteCourseFor } = await import("./db-api.ts");
    return guard(() => deleteCourseFor(context.userId, data));
  });

export const saveSubject = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string | null; name: string; code: string; teacherName: string }) => data)
  .handler(async ({ context, data }) => {
    const { saveSubjectFor } = await import("./db-api.ts");
    return guard(() => saveSubjectFor(context.userId, data));
  });

export const deleteSubject = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteSubjectFor } = await import("./db-api.ts");
    return guard(() => deleteSubjectFor(context.userId, data));
  });

export const saveClass = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { saveClassFor } = await import("./db-api.ts");
    return guard(() => saveClassFor(context.userId, data));
  });

export const archiveClass = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string; archived: boolean }) => data)
  .handler(async ({ context, data }) => {
    const { archiveClassFor } = await import("./db-api.ts");
    return guard(() => archiveClassFor(context.userId, data));
  });

export const saveClassSubjects = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; classId: string; links: { subjectId: string; teacherName: string }[] }) => data)
  .handler(async ({ context, data }) => {
    const { saveClassSubjectsFor } = await import("./db-api.ts");
    return guard(() => saveClassSubjectsFor(context.userId, data));
  });

export const saveStaff = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string | null; name: string; roleLabel: string }) => data)
  .handler(async ({ context, data }) => {
    const { saveStaffFor } = await import("./db-api.ts");
    return guard(() => saveStaffFor(context.userId, data));
  });

export const deleteStaff = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteStaffFor } = await import("./db-api.ts");
    return guard(() => deleteStaffFor(context.userId, data));
  });

export const listStudents = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { listStudentsFor } = await import("./db-api.ts");
    return guard(() => listStudentsFor(context.userId, data));
  });

export const saveStudent = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { saveStudentFor } = await import("./db-api.ts");
    return guard(() => saveStudentFor(context.userId, data));
  });

export const archiveStudent = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string; archived: boolean }) => data)
  .handler(async ({ context, data }) => {
    const { archiveStudentFor } = await import("./db-api.ts");
    return guard(() => archiveStudentFor(context.userId, data));
  });

export const deleteStudent = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string; confirmName: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteStudentFor } = await import("./db-api.ts");
    return guard(() => deleteStudentFor(context.userId, data));
  });

export const getDashboard = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; filter: AnalyticsFilter }) => data)
  .handler(async ({ context, data }) => {
    const { dashboardFor } = await import("./db-api.ts");
    return guard(() => dashboardFor(context.userId, data));
  });

export const getStudentProfile = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; studentId: string; yearId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { studentProfileFor } = await import("./db-api.ts");
    return guard(() => studentProfileFor(context.userId, data));
  });

export const getGradebook = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; classId: string; subjectId: string; periodId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { gradebookFor } = await import("./db-api.ts");
    return guard(() => gradebookFor(context.userId, data));
  });

export const saveAssessment = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { saveAssessmentFor } = await import("./db-api.ts");
    return guard(() => saveAssessmentFor(context.userId, data));
  });

export const deleteAssessment = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteAssessmentFor } = await import("./db-api.ts");
    return guard(() => deleteAssessmentFor(context.userId, data));
  });

export const saveScores = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; items: { assessmentId: string; studentId: string; value: number | null; status: MarkStatus }[] }) => data)
  .handler(async ({ context, data }) => {
    const { saveScoresFor } = await import("./db-api.ts");
    return guard(() => saveScoresFor(context.userId, data));
  });

export const saveCriterion = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { saveCriterionFor } = await import("./db-api.ts");
    return guard(() => saveCriterionFor(context.userId, data));
  });

export const listQual = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; classId: string | null; studentId: string | null; criterionId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { qualListFor } = await import("./db-api.ts");
    return guard(() => qualListFor(context.userId, data));
  });

export const saveQual = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ context, data }) => {
    const { saveQualFor } = await import("./db-api.ts");
    return guard(() => saveQualFor(context.userId, data));
  });

export const deleteQual = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteQualFor } = await import("./db-api.ts");
    return guard(() => deleteQualFor(context.userId, data));
  });

export const getAttendance = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; classId: string }) => data)
  .handler(async ({ context, data }) => {
    const { attendanceFor } = await import("./db-api.ts");
    return guard(() => attendanceFor(context.userId, data));
  });

export const saveSession = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; classId: string; subjectId: string | null; periodId: string | null; date: string; label: string }) => data)
  .handler(async ({ context, data }) => {
    const { saveSessionFor } = await import("./db-api.ts");
    return guard(() => saveSessionFor(context.userId, data));
  });

export const saveMarks = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; items: { sessionId: string; studentId: string; status: string }[] }) => data)
  .handler(async ({ context, data }) => {
    const { saveMarksFor } = await import("./db-api.ts");
    return guard(() => saveMarksFor(context.userId, data));
  });

export const deleteSession = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; id: string }) => data)
  .handler(async ({ context, data }) => {
    const { deleteSessionFor } = await import("./db-api.ts");
    return guard(() => deleteSessionFor(context.userId, data));
  });

export const buildExport = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; kind: ExportKind; filter: AnalyticsFilter; includeNotes: boolean; columns: string[] | null }) => data)
  .handler(async ({ context, data }) => {
    const { reportFor } = await import("./db-api.ts");
    return guard(() => reportFor(context.userId, data));
  });

export const previewImport = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; kind: ImportKind; mode: ImportMode; allowNameMatch: boolean; allowSameName: boolean; yearId: string; records: { sheetRow: number; values: Record<string, unknown> }[] }) => data)
  .handler(async ({ context, data }) => {
    const { previewImportFor } = await import("./db-api.ts");
    return guard(() => previewImportFor(context.userId, data));
  });

export const commitImport = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; kind: ImportKind; mode: ImportMode; allowNameMatch: boolean; allowSameName: boolean; yearId: string; records: { sheetRow: number; values: Record<string, unknown> }[] }) => data)
  .handler(async ({ context, data }) => {
    const { commitImportFor } = await import("./db-api.ts");
    return guard(() => commitImportFor(context.userId, data));
  });

export const exportBackup = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { backupFor } = await import("./db-api.ts");
    return guard(() => backupFor(context.userId, data));
  });

export const listAudit = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { auditFor } = await import("./db-api.ts");
    return guard(() => auditFor(context.userId, data));
  });

export const joinSchool = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { code: string }) => data)
  .handler(async ({ context, data }) => {
    const { joinSchoolFor } = await import("./db-api.ts");
    return guard(() => joinSchoolFor(context.userId, data));
  });

export const regenerateInvite = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null }) => data)
  .handler(async ({ context, data }) => {
    const { regenerateInviteFor } = await import("./db-api.ts");
    return guard(() => regenerateInviteFor(context.userId, data));
  });

export const updateMember = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; memberId: string; role: "admin" | "coordenacao" | "professor"; subjectScope: string[] | null }) => data)
  .handler(async ({ context, data }) => {
    const { updateMemberFor } = await import("./db-api.ts");
    return guard(() => updateMemberFor(context.userId, data));
  });

export const updateMyName = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; name: string }) => data)
  .handler(async ({ context, data }) => {
    const { updateMyNameFor } = await import("./db-api.ts");
    return guard(() => updateMyNameFor(context.userId, data));
  });

export const removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((data: { schoolId: string | null; memberId: string }) => data)
  .handler(async ({ context, data }) => {
    const { removeMemberFor } = await import("./db-api.ts");
    return guard(() => removeMemberFor(context.userId, data));
  });

export type { Workspace, StudentList } from "./db-api.ts";
export type { DashboardModel, AnalyticsFilter };
export type { ExportKind, ReportBundle };
export type { ImportKind, ImportMode, MarkStatus };
