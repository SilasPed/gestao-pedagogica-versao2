import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Badge, Button, Dialog, Empty, Field, Notice, PageHeader, controlClass, errText } from "@/components/ui";
import { deleteAssessment, getGradebook, saveAssessment, saveScores } from "@/lib/school/api";
import { ASSESSMENT_KINDS } from "@/lib/school/constants";
import { academicSituation, neededGrade, summarizeItems, type GradeItem, type MarkStatus } from "@/lib/school/calc";
import { fmtGrade, seriesLabel } from "@/lib/school/format";

export const Route = createFileRoute("/_shell/notas")({ component: GradesPage });

type Draft = { text: string; status: MarkStatus };

function GradesPage() {
  const { workspace, yearId } = useSchool();
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
  const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
  const book = useQuery({
    queryKey: ["gradebook", workspace?.school.id, classId, subjectId, periodId],
    enabled: Boolean(workspace && classId && subjectId),
    queryFn: () => getGradebook({ data: { schoolId: workspace!.school.id, classId, subjectId, periodId: periodId || null } }),
  });
  useEffect(() => {
    if (!book.data) return;
    setDrafts((current) => {
      const next: Record<string, Draft> = {};
      for (const [key, draft] of Object.entries(current)) {
        const [assessmentId, studentId] = key.split(":");
        const stored = book.data.scores.find((score) => score.assessmentId === assessmentId && score.studentId === studentId);
        const storedStatus = (stored?.status as MarkStatus) || "pending";
        const storedText = storedStatus === "graded" && stored?.value != null ? String(stored.value).replace(".", ",") : "";
        if (!sameDraft(draft, storedText, storedStatus)) next[key] = draft;
      }
      const same =
        Object.keys(current).length === Object.keys(next).length && Object.keys(next).every((key) => next[key] === current[key]);
      return same ? current : next;
    });
  }, [book.data]);
  const save = useMutation({
    mutationFn: saveScores,
    onError: (error) => toast.error(errText(error)),
  });

  const rows = useMemo(() => {
    if (!book.data) return [];
    return book.data.students.map((student) => {
      const items: GradeItem[] = book.data!.assessments.map((assessment) => {
        const key = `${assessment.id}:${student.id}`;
        const stored = book.data!.scores.find((score) => score.assessmentId === assessment.id && score.studentId === student.id);
        const draft = drafts[key];
        const status = draft?.status ?? ((stored?.status as MarkStatus) || "pending");
        const parsed = draft ? Number(draft.text.replace(",", ".")) : stored?.value;
        const value = status === "graded" && parsed != null && !Number.isNaN(parsed) ? parsed : null;
        return {
          assessmentId: assessment.id,
          name: assessment.name,
          periodId: assessment.periodId,
          subjectId,
          classId,
          weight: assessment.weight,
          maxScore: assessment.maxScore,
          isRecovery: assessment.isRecovery,
          value,
          status: status === "graded" && value == null ? "pending" : status,
        };
      });
      const summary = summarizeItems(items, book.data!.periods, book.data!.policy);
      const focus = periodId || book.data!.periods[0]?.id || "";
      const needed = focus ? neededGrade(items, focus, book.data!.policy) : null;
      const situation = academicSituation({
        average: summary.average,
        pending: summary.pending,
        passing: book.data!.passing,
        closed: summary.closed,
        frequencyPercent: null,
        frequencyMin: 75,
      });
      return { student, items, summary, needed, situation };
    });
  }, [book.data, drafts, subjectId, classId, periodId]);

  async function commit(key: string, assessmentId: string, studentId: string, draft: Draft) {
    if (!workspace) return;
    const value = draft.status === "graded" ? Number(draft.text.replace(",", ".")) : null;
    if (draft.status === "graded" && (draft.text.trim() === "" || Number.isNaN(value))) {
      toast.error("Informe a nota ou mude a situação. Vazio não vira zero.");
      return;
    }
    try {
      await save.mutateAsync({
        data: { schoolId: workspace.school.id, items: [{ assessmentId, studentId, value: draft.status === "graded" ? value : null, status: draft.status }] },
      });
      setSaveNote("Lançamento gravado.");
      await client.invalidateQueries({ queryKey: ["gradebook"] });
    } catch (error) {
      setSaveNote(null);
      toast.error(errText(error));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Diário de notas"
        description="Edição direta na tabela. A média aparece ao lado e segue a regra das configurações. Setas movem a célula. Enter grava."
        actions={<Button type="button" disabled={!classId || !subjectId} onClick={() => setOpen(true)}>Nova avaliação</Button>}
      />
      <div className="grid gap-3 rounded-card border border-line bg-card p-3 md:grid-cols-3">
        <select className={controlClass} value={classId} onChange={(event) => setClassId(event.target.value)} aria-label="Turma">
          <option value="">Escolha a turma</option>
          {classes.map((klass) => <option key={klass.id} value={klass.id}>{seriesLabel(klass.series)} {klass.name}</option>)}
        </select>
        <select className={controlClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Disciplina">
          <option value="">Escolha a disciplina</option>
          {workspace?.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <select className={controlClass} value={periodId} onChange={(event) => setPeriodId(event.target.value)} aria-label="Período">
          <option value="">Todos os períodos</option>
          {periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
        </select>
      </div>
      {!classId || !subjectId ? <Empty title="Escolha turma e disciplina" text="O diário abre só com dados dessa combinação." /> : null}
      {book.isLoading ? <Notice>Carregando diário…</Notice> : null}
      {save.isPending ? <Notice>Gravando lançamento… O valor digitado permanece na célula até a confirmação.</Notice> : null}
      {saveNote && !save.isPending ? <Notice tone="ok">{saveNote}</Notice> : null}
      {book.data ? (
        <>
          <details className="rounded-card border border-line bg-card p-4 text-sm">
            <summary className="cursor-pointer font-semibold">Critério de cálculo desta turma</summary>
            <ul className="mt-2 list-disc pl-5">{book.data.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
          </details>
          {book.data.students.length === 0 ? <Empty title="Turma sem estudantes ativos" text="Cadastre os alunos nessa turma antes de lançar notas." /> : null}
          {book.data.students.length > 0 ? (
            <div className="max-h-[70vh] overflow-auto rounded-card border border-line bg-card">
              <table className="sheet min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="min-w-48 px-3 py-2 text-left">Estudante</th>
                    {book.data.assessments.map((assessment) => (
                      <th key={assessment.id} className="min-w-40 px-2 py-2 text-left font-medium">
                        <span className="block text-sm text-ink">{assessment.name}</span>
                        <span className="block text-xs font-normal text-muted">{assessment.periodName} · peso {assessment.weight} · máx. {assessment.maxScore}</span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-danger"
                          onClick={async () => {
                            if (!workspace || !window.confirm(`Excluir ${assessment.name}? As notas desta coluna saem juntas. As outras avaliações ficam.`)) return;
                            try {
                              await deleteAssessment({ data: { schoolId: workspace.school.id, id: assessment.id } });
                              await client.invalidateQueries({ queryKey: ["gradebook"] });
                            } catch (error) {
                              toast.error(errText(error));
                            }
                          }}
                        >
                          Excluir
                        </button>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={row.student.id} className="border-t border-line">
                      <td className="px-3 py-2 align-top">
                        <p className="font-medium">{row.student.name}</p>
                        <p className="text-xs text-muted">{row.student.enrollment ?? "Sem matrícula"}</p>
                      </td>
                      {book.data!.assessments.map((assessment, index) => {
                        const key = `${assessment.id}:${row.student.id}`;
                        const item = row.items[index];
                        const draft = drafts[key] ?? {
                          text: item.status === "graded" && item.value != null ? String(item.value).replace(".", ",") : "",
                          status: item.status,
                        };
                        return (
                          <td key={assessment.id} className={markClass(draft.status)}>
                            <input
                              aria-label={`Nota de ${row.student.name} em ${assessment.name}`}
                              data-grade-row={rowIndex}
                              data-grade-col={index}
                              className="h-11 w-full rounded-lg border border-line bg-card px-2 text-center text-sm font-semibold tabular-nums"
                              value={draft.text}
                              disabled={draft.status !== "graded" && draft.status !== "pending"}
                              onChange={(event) => {
                                setSaveNote(null);
                                setDrafts((current) => ({ ...current, [key]: { text: event.target.value, status: "graded" } }));
                              }}
                              onFocus={(event) => event.currentTarget.select()}
                              onBlur={() => {
                                const next = drafts[key];
                                if (next) void commit(key, assessment.id, row.student.id, next);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  event.currentTarget.blur();
                                  return;
                                }
                                const delta = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowLeft: [0, -1] }[event.key as "ArrowDown" | "ArrowUp" | "ArrowRight" | "ArrowLeft"];
                                if (!delta) return;
                                const next = document.querySelector<HTMLInputElement>(`[data-grade-row="${rowIndex + delta[0]}"][data-grade-col="${index + delta[1]}"]`);
                                if (!next) return;
                                event.preventDefault();
                                next.focus();
                              }}
                            />
                            <select
                              aria-label={`Situação de ${row.student.name} em ${assessment.name}`}
                              className="mt-1 h-10 w-full rounded-lg border border-line bg-card text-xs"
                              value={draft.status}
                              onChange={(event) => {
                                const status = event.target.value as MarkStatus;
                                const next = { text: status === "graded" ? draft.text : "", status };
                                setDrafts((current) => ({ ...current, [key]: next }));
                                void commit(key, assessment.id, row.student.id, next);
                              }}
                            >
                              <option value="graded">Nota</option>
                              <option value="pending">Pendente</option>
                              <option value="absent">Ausência</option>
                              <option value="excused">Dispensa</option>
                              <option value="na">Não aplicável</option>
                            </select>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right align-top">
                        <p className="font-semibold tabular-nums">{fmtGrade(row.summary.average)}</p>
                        <Badge tone={row.situation.tone}>{row.situation.label}</Badge>
                        {row.needed ? <p className="mt-1 max-w-56 text-xs text-pretty text-muted">{row.needed.explanation}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : null}
      <Dialog open={open} title="Nova avaliação" onClose={() => setOpen(false)}>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!workspace) return;
            const form = new FormData(event.currentTarget);
            try {
              await saveAssessment({
                data: {
                  schoolId: workspace.school.id,
                  classId,
                  subjectId,
                  name: String(form.get("name") ?? ""),
                  kind: String(form.get("kind") ?? "prova"),
                  date: String(form.get("date") ?? "") || null,
                  periodId: String(form.get("periodId") ?? "") || null,
                  maxScore: Number(String(form.get("maxScore") ?? workspace.school.gradeScaleMax).replace(",", ".")),
                  weight: Number(String(form.get("weight") ?? "1").replace(",", ".")),
                  notes: String(form.get("notes") ?? ""),
                  isRecovery: form.get("recovery") === "on",
                },
              });
              setOpen(false);
              await client.invalidateQueries({ queryKey: ["gradebook"] });
              toast.success("Avaliação criada.");
            } catch (error) {
              toast.error(errText(error));
            }
          }}
        >
          <Field label="Nome"><input name="name" required className={controlClass} /></Field>
          <Field label="Tipo">
            <select name="kind" className={controlClass}>{ASSESSMENT_KINDS.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}</select>
          </Field>
          <Field label="Período">
            <select name="periodId" className={controlClass} defaultValue={periodId}>
              <option value="">Sem período</option>
              {periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
            </select>
          </Field>
          <Field label="Data"><input name="date" type="date" className={controlClass} /></Field>
          <Field label="Nota máxima"><input name="maxScore" defaultValue={workspace?.school.gradeScaleMax ?? 10} className={controlClass} /></Field>
          <Field label="Peso"><input name="weight" defaultValue="1" className={controlClass} /></Field>
          <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" name="recovery" /> Esta coluna é recuperação e não apaga as notas originais</label>
          <Field label="Observação"><input name="notes" className={controlClass} /></Field>
          <Button type="submit">Criar avaliação</Button>
        </form>
      </Dialog>
    </div>
  );
}

function markClass(status: MarkStatus) {
  if (status === "pending") return "mark-pending px-2 py-2 align-top";
  if (status === "absent") return "mark-bad px-2 py-2 align-top";
  if (status === "excused" || status === "na") return "mark-off px-2 py-2 align-top";
  return "px-2 py-2 align-top";
}

function sameDraft(draft: Draft, storedText: string, storedStatus: string) {
  if (draft.status !== storedStatus) return false;
  const left = draft.text.trim().replace(",", ".");
  const right = storedText.trim().replace(",", ".");
  if (left === "" && right === "") return true;
  const a = Number(left);
  const b = Number(right);
  if (left !== "" && right !== "" && !Number.isNaN(a) && !Number.isNaN(b)) return a === b;
  return left === right;
}
