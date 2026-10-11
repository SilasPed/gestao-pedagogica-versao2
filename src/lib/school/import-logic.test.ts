import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planScoreImport, planStudentImport, type ExistingStudent } from "./import-logic.ts";

describe("importação de estudantes", () => {
  it("aceita 430 nomes novos sem transformar linha vazia em aluno", () => {
    const records = Array.from({ length: 430 }, (_, index) => ({
      sheetRow: index + 2,
      values: {
        fullName: `Aluno Fictício ${String(index + 1).padStart(3, "0")}`,
        enrollment: `FICTICIO-${String(index + 1).padStart(4, "0")}`,
        series: String((index % 3) + 1),
        className: ["A", "B", "C"][index % 3],
        status: "ativo",
      },
    }));
    records.push({ sheetRow: 999, values: { fullName: "   ", enrollment: "", series: "", className: "", status: "" } });
    const plans = planStudentImport([], records, {
      mode: "add",
      allowNameMatch: false,
      allowSameName: false,
      yearId: "ano",
      yearLabel: "2026",
    });
    assert.equal(plans.filter((plan) => plan.action === "add").length, 430);
    assert.equal(plans.filter((plan) => plan.action === "reject").length, 1);
  });

  it("não atualiza homônimo sem confirmação e não usa a posição da linha", () => {
    const existing: ExistingStudent[] = [
      { id: "s1", name: "Ana Souza", enrollment: "100", classId: "c", yearId: "ano", archived: false },
    ];
    const plans = planStudentImport(existing, [
      { sheetRow: 2, values: { fullName: "Ana Souza", enrollment: "200", series: "1", className: "A" } },
    ], { mode: "merge", allowNameMatch: false, allowSameName: false, yearId: "ano", yearLabel: "2026" });
    assert.equal(plans[0]?.action, "ignore");
    assert.match(plans[0]?.message ?? "", /mesmo nome|já existe/i);
  });

  it("rejeita nota acima da máxima e não trata vazio como zero", () => {
    const plans = planScoreImport(
      [
        { sheetRow: 2, values: { fullName: "Ana Souza", enrollment: "100", className: "A", series: "1", subject: "Física", assessment: "Prova", score: "" } },
        { sheetRow: 3, values: { fullName: "Ana Souza", enrollment: "100", className: "A", series: "1", subject: "Física", assessment: "Prova", score: "11" } },
        { sheetRow: 4, values: { fullName: "Ana Souza", enrollment: "100", className: "A", series: "1", subject: "Física", assessment: "Prova", score: "7,5" } },
      ],
      {
        students: [{ id: "s1", name: "Ana Souza", enrollment: "100", classId: "c", yearId: "ano", archived: false }],
        classes: [{ id: "c", yearId: "ano", series: "1", name: "A", courseId: null }],
        subjects: [{ id: "fis", name: "Física" }],
        periods: [],
        assessments: [],
        yearId: "ano",
        scaleMax: 10,
        mode: "merge",
        allowNameMatch: false,
      },
    );
    assert.equal(plans[0]?.action, "update");
    assert.equal(plans[0]?.payload.markStatus, "pending");
    assert.equal(plans[0]?.payload.value, null);
    assert.equal(plans[1]?.action, "reject");
    assert.equal(plans[2]?.payload.value, 7.5);
  });
});
