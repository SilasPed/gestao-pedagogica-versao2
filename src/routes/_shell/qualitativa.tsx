import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, Field, controlClass, errText } from "@/components/ui";
import { deleteQual, listQual, listStudents, saveCriterion, saveQual } from "@/lib/school/api";
import { todayBR } from "@/lib/school/format";

export const Route = createFileRoute("/_shell/qualitativa")({ component: QualPage });

function QualPage() {
  const { workspace, yearId, refresh } = useSchool();
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [criterionId, setCriterionId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [date, setDate] = useState(todayBR());
  const students = useQuery({
    queryKey: ["qual-students", workspace?.school.id, classId, yearId],
    enabled: Boolean(workspace && classId),
    queryFn: () => listStudents({ data: { schoolId: workspace!.school.id, classId, yearId, page: 1, pageSize: 200, archived: false } }),
  });
  const history = useQuery({
    queryKey: ["qual", workspace?.school.id, classId, criterionId],
    enabled: Boolean(workspace),
    queryFn: () => listQual({ data: { schoolId: workspace!.school.id, classId: classId || null, studentId: null, criterionId: criterionId || null } }),
  });
  const criterion = workspace?.criteria.find((item) => item.id === criterionId);
  const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
  const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
  if (!workspace) return null;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl">Avaliação qualitativa</h1>
        <p className="text-sm text-pretty text-muted">Registre comportamentos observáveis. Estes níveis não viram nota numérica.</p>
      </div>
      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Critérios</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {workspace.criteria.map((item) => (
            <li key={item.id} className="rounded-card bg-soft px-3 py-2">
              <p className="font-semibold">{item.name}{item.active ? "" : " · inativo"}</p>
              <p className="text-muted">{item.description}</p>
              <p>{item.scale.join(" · ")}</p>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              await saveCriterion({
                data: {
                  schoolId: workspace.school.id,
                  id: null,
                  name: String(form.get("name") ?? ""),
                  description: String(form.get("description") ?? ""),
                  scale: String(form.get("scale") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
                },
              });
              event.currentTarget.reset();
              await refresh();
              toast.success("Critério salvo.");
            } catch (error) {
              toast.error(errText(error));
            }
          }}
        >
          <Field label="Novo critério"><input name="name" className={controlClass} required /></Field>
          <Field label="Níveis, separados por vírgula" hint="Do mais desenvolvido ao que pede mais acompanhamento.">
            <input name="scale" className={controlClass} placeholder="Excelente, Bom, Em desenvolvimento, Necessita de acompanhamento" />
          </Field>
          <Field label="Descrição observável"><input name="description" className={controlClass} /></Field>
          <div className="flex items-end"><Button type="submit">Adicionar critério</Button></div>
        </form>
      </section>
      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Lançar</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <select className={controlClass} value={classId} onChange={(event) => setClassId(event.target.value)} aria-label="Turma">
            <option value="">Turma</option>
            {classes.map((klass) => <option key={klass.id} value={klass.id}>{klass.series}º {klass.name}</option>)}
          </select>
          <select className={controlClass} value={criterionId} onChange={(event) => setCriterionId(event.target.value)} aria-label="Critério">
            <option value="">Critério</option>
            {workspace.criteria.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select className={controlClass} value={periodId} onChange={(event) => setPeriodId(event.target.value)} aria-label="Período">
            <option value="">Período</option>
            {periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
          </select>
          <input type="date" className={controlClass} value={date} onChange={(event) => setDate(event.target.value)} aria-label="Data" />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {students.data?.rows.map((student) => (
            <form
              key={student.id}
              className="grid gap-2 border-t border-line pt-3 md:grid-cols-[1fr_180px_1fr_auto]"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!criterionId) return toast.error("Escolha o critério.");
                const form = new FormData(event.currentTarget);
                try {
                  await saveQual({
                    data: {
                      schoolId: workspace.school.id,
                      studentId: student.id,
                      criterionId,
                      periodId: periodId || null,
                      date,
                      level: String(form.get("level") ?? ""),
                      comment: String(form.get("comment") ?? ""),
                    },
                  });
                  await client.invalidateQueries({ queryKey: ["qual"] });
                  toast.success(`Registro de ${student.fullName} salvo.`);
                } catch (error) {
                  toast.error(errText(error));
                }
              }}
            >
              <p className="self-center font-medium">{student.fullName}</p>
              <select name="level" className={controlClass} defaultValue={criterion?.scale[1] ?? criterion?.scale[0] ?? ""} aria-label={`Nível de ${student.fullName}`}>
                {(criterion?.scale ?? []).map((level) => <option key={level}>{level}</option>)}
              </select>
              <input name="comment" className={controlClass} placeholder="Comentário opcional, sem diagnóstico" aria-label={`Comentário de ${student.fullName}`} />
              <Button type="submit" variant="soft">Salvar</Button>
            </form>
          ))}
        </div>
      </section>
      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Histórico</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {history.data?.length === 0 ? <li className="text-muted">Nenhum registro neste filtro.</li> : null}
          {history.data?.map((record) => (
            <li key={record.id} className="flex flex-wrap items-start justify-between gap-2 border-t border-line pt-2">
              <div>
                <p className="font-medium">{record.date} · {record.studentName} · {record.level}</p>
                {record.comment ? <p className="text-pretty text-muted">{record.comment}</p> : null}
              </div>
              <button
                type="button"
                className="h-11 text-danger"
                onClick={async () => {
                  if (!window.confirm("Excluir este registro qualitativo?")) return;
                  try {
                    await deleteQual({ data: { schoolId: workspace.school.id, id: record.id } });
                    await client.invalidateQueries({ queryKey: ["qual"] });
                  } catch (error) {
                    toast.error(errText(error));
                  }
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
