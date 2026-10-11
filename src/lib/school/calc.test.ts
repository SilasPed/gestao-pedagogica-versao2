import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDashboard } from "./analytics.ts";
import {
  academicSituation,
  averageOf,
  effectiveValue,
  frequencyOf,
  neededGrade,
  periodResult,
  rulesText,
  type CalcPolicy,
  type GradeItem,
} from "./calc.ts";

const policy: CalcPolicy = {
  mode: "weighted",
  passing: 6,
  scaleMax: 10,
  recovery: "replace_if_higher",
  absenceCountsAsZero: false,
};

function item(partial: Partial<GradeItem> & Pick<GradeItem, "value" | "status" | "weight">): GradeItem {
  return {
    assessmentId: partial.assessmentId ?? "a",
    name: partial.name ?? "Prova",
    periodId: partial.periodId ?? "p1",
    subjectId: partial.subjectId ?? "fis",
    classId: partial.classId ?? "c",
    maxScore: partial.maxScore ?? 10,
    isRecovery: partial.isRecovery ?? false,
    value: partial.value,
    status: partial.status,
    weight: partial.weight,
  };
}

describe("médias", () => {
  it("pondera nota vezes peso e ignora pendência", () => {
    const items = [
      item({ assessmentId: "1", value: 8, status: "graded", weight: 2 }),
      item({ assessmentId: "2", name: "Trabalho", value: 6, status: "graded", weight: 1 }),
      item({ assessmentId: "3", name: "Lista", value: null, status: "pending", weight: 4 }),
    ];
    const result = periodResult(items, "p1", policy);
    assert.equal(result.base, 7.33);
    assert.equal(result.final, 7.33);
    assert.equal(result.pending, true);
    assert.equal(effectiveValue(items[2], policy), null);
  });

  it("não transforma vazio em zero e distingue zero lançado", () => {
    const empty = item({ value: null, status: "pending", weight: 1 });
    const zero = item({ value: 0, status: "graded", weight: 1 });
    assert.equal(effectiveValue(empty, policy), null);
    assert.equal(effectiveValue(zero, policy), 0);
    const result = periodResult(
      [zero, item({ assessmentId: "2", value: 10, status: "graded", weight: 1 })],
      "p1",
      policy,
    );
    assert.equal(result.base, 5);
  });

  it("normaliza máximos diferentes antes de ponderar", () => {
    const items = [
      item({ assessmentId: "1", value: 5, status: "graded", weight: 1, maxScore: 5 }),
      item({ assessmentId: "2", value: 8, status: "graded", weight: 1, maxScore: 10 }),
    ];
    assert.equal(periodResult(items, "p1", { ...policy, mode: "simple" }).base, 9);
  });

  it("média simples ignora peso", () => {
    const values = [
      { n: 8, w: 2 },
      { n: 6, w: 1 },
    ];
    assert.equal(averageOf(values, "simple"), 7);
    assert.equal(averageOf(values, "weighted"), 7.33);
  });

  it("recuperação não apaga a média original", () => {
    const items = [
      item({ value: 4, status: "graded", weight: 1 }),
      item({ assessmentId: "r", name: "Recuperação", value: 8, status: "graded", weight: 1, isRecovery: true }),
    ];
    const replaced = periodResult(items, "p1", policy);
    assert.equal(replaced.base, 4);
    assert.equal(replaced.recovery, 8);
    assert.equal(replaced.final, 8);
    const averaged = periodResult(items, "p1", { ...policy, recovery: "average_with_original" });
    assert.equal(averaged.base, 4);
    assert.equal(averaged.final, 6);
    const kept = periodResult(items, "p1", { ...policy, recovery: "keep_both" });
    assert.equal(kept.final, 4);
    assert.equal(kept.recovery, 8);
  });

  it("calcula a nota necessária e recusa média acima da escala", () => {
    const items = [
      item({ value: 5, status: "graded", weight: 1 }),
      item({ assessmentId: "2", name: "Prova 2", value: null, status: "pending", weight: 1 }),
    ];
    const needed = neededGrade(items, "p1", policy);
    assert.equal(needed.neededOnScale, 7);
    assert.equal(needed.feasible, true);
    const impossible = neededGrade(
      [item({ value: 0, status: "graded", weight: 1 }), item({ assessmentId: "2", value: null, status: "pending", weight: 1 })],
      "p1",
      { ...policy, passing: 6 },
    );
    assert.equal(impossible.neededOnScale, 12);
    assert.equal(impossible.feasible, false);
  });

  it("ausência só vira zero quando a regra pede", () => {
    const absent = item({ value: null, status: "absent", weight: 1 });
    assert.equal(effectiveValue(absent, policy), null);
    assert.equal(effectiveValue(absent, { ...policy, absenceCountsAsZero: true }), 0);
  });

  it("frequência ignora aula sem registro e separa falta justificada", () => {
    const stats = frequencyOf(["present", "absent", "justified", "pending", "late"], {
      justifiedRule: "presence",
      lateRule: "presence",
      minimum: 75,
    });
    assert.equal(stats.considered, 4);
    assert.equal(stats.present, 3);
    assert.equal(stats.absences, 1);
    assert.equal(stats.percent, 75);
  });

  it("situação não chama o estudante de reprovado", () => {
    const label = academicSituation({
      average: 5,
      pending: false,
      passing: 6,
      closed: true,
      frequencyPercent: null,
      frequencyMin: 75,
    });
    assert.equal(label.label, "Abaixo da média");
    assert.equal(rulesText(policy).some((line) => line.includes("não viram zero")), true);
  });
});

describe("painel com muitos estudantes", () => {
  it("calcula 430 alunos sem tratar pendência como zero", () => {
    const students = Array.from({ length: 430 }, (_, index) => ({
      id: `s${index}`,
      name: `Aluno ${index}`,
      enrollment: `M${index}`,
      classId: "c1",
      status: "ativo",
      archived: false,
    }));
    const scores = students.slice(0, 215).map((student) => ({
      assessmentId: "av1",
      studentId: student.id,
      value: 8,
      status: "graded" as const,
    }));
    const dash = buildDashboard({
      policy,
      freq: { justifiedRule: "presence", lateRule: "presence", minimum: 75 },
      students,
      classes: [{ id: "c1", yearId: "y", series: "2", name: "A", courseId: null, passing: null, teacherName: "" }],
      periods: [{ id: "p1", yearId: "y", ord: 1, name: "1º bimestre" }],
      subjects: [{ id: "fis", name: "Física" }],
      assessments: [
        {
          id: "av1",
          classId: "c1",
          subjectId: "fis",
          periodId: "p1",
          name: "Prova",
          date: null,
          kind: "prova",
          maxScore: 10,
          weight: 1,
          isRecovery: false,
        },
      ],
      scores,
      enrollments: students.map((student) => ({
        studentId: student.id,
        classId: "c1",
        yearId: "y",
        status: "ativo",
        endedOn: null,
      })),
      marks: [],
      qualitative: [],
      criteria: [],
      courses: [],
      filter: { yearId: "y", series: null, classId: null, subjectId: null, periodId: null, studentId: null },
    });
    assert.equal(dash.studentCount, 430);
    assert.equal(dash.pendingStudents, 215);
    assert.equal(dash.generalAverage, 8);
    assert.equal(dash.belowCount, 0);
    assert.equal(dash.gradedStudents, 215);
  });
});
