import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planStudentImport } from "./import-logic.ts";
import { parseDateCell, parseGradeCell, parseSeries, parseStatus } from "./validate.ts";

describe("validação de planilha", () => {
  it("aceita vírgula decimal, data brasileira e não lê vazio como zero", () => {
    assert.deepEqual(parseGradeCell("7,5", 10), { kind: "graded", value: 7.5 });
    assert.deepEqual(parseGradeCell("0", 10), { kind: "graded", value: 0 });
    assert.deepEqual(parseGradeCell("", 10), { kind: "empty" });
    assert.deepEqual(parseGradeCell("ausente", 10), { kind: "absent" });
    assert.equal(parseGradeCell("12", 10).kind, "invalid");
    assert.equal(parseDateCell("11/10/2026"), "2026-10-11");
    assert.equal(parseDateCell("31/02/2026"), "invalid");
    assert.equal(parseDateCell("2026-10-11"), "2026-10-11");
    assert.equal(parseDateCell("2026-02-31"), "invalid");
    assert.equal(parseDateCell("2026-13-01"), "invalid");
    assert.equal(parseSeries("2º ano"), "2");
    assert.equal(parseStatus("Concluído"), "concluido");
  });

  it("não sobrescreve estudante só pela posição e segura nome repetido", () => {
    const existing = [
      { id: "1", name: "Ana Lima", enrollment: "A1", classId: "c", yearId: "y", archived: false },
      { id: "2", name: "Bruno Souza", enrollment: null, classId: "c", yearId: "y", archived: false },
    ];
    const plans = planStudentImport(
      existing,
      [
        { sheetRow: 2, values: { fullName: "Ana Lima", enrollment: "A1", series: "1", className: "A" } },
        { sheetRow: 3, values: { fullName: "Bruno Souza", series: "1" } },
        { sheetRow: 4, values: { fullName: "Carla Dias", enrollment: "C9", series: "1" } },
        { sheetRow: 5, values: { fullName: "Nota ruim", series: "9" } },
      ],
      { mode: "merge", allowNameMatch: false, allowSameName: false, yearId: "y" },
    );
    assert.equal(plans[0].action, "update");
    assert.equal(plans[1].action, "ignore");
    assert.match(plans[1].message, /nome/i);
    assert.equal(plans[2].action, "add");
    assert.equal(plans[3].action, "reject");
  });

  it("planeja 430 inclusões novas sem colidir", () => {
    const records = Array.from({ length: 430 }, (_, index) => ({
      sheetRow: index + 2,
      values: {
        fullName: `Aluno Fictício ${index + 1}`,
        enrollment: `FICTICIO-${index + 1}`,
        series: String((index % 3) + 1),
        className: "A",
      },
    }));
    const plans = planStudentImport([], records, {
      mode: "add",
      allowNameMatch: false,
      allowSameName: false,
      yearId: "y",
    });
    assert.equal(plans.filter((plan) => plan.action === "add").length, 430);
    assert.equal(plans.some((plan) => plan.action === "reject"), false);
  });
});
