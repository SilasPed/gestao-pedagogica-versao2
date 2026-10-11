import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSchool } from "@/components/school-context";
import { Badge, Button, controlClass } from "@/components/ui";
import { buildExport, deleteStudent, getStudentProfile } from "@/lib/school/api";
import { MARK_STATUSES } from "@/lib/school/constants";
import { fmtGrade, fmtPercent, seriesLabel } from "@/lib/school/format";
import { saveReport } from "@/lib/school/files";
import { toast } from "sonner";
import { errText } from "@/components/ui";

export const Route = createFileRoute("/_shell/alunos/$studentId")({ component: StudentPage });

function StudentPage() {
  const { studentId } = Route.useParams();
  const { workspace, yearId } = useSchool();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [confirmName, setConfirmName] = useState("");
  const profile = useQuery({
    queryKey: ["student", workspace?.school.id, studentId, yearId],
    enabled: Boolean(workspace && studentId),
    queryFn: () => getStudentProfile({ data: { schoolId: workspace!.school.id, studentId, yearId } }),
  });
  const data = profile.data;
  return (
    <div className="flex flex-col gap-5">
      <Link to="/alunos" search={{ q: "" }} className="inline-flex h-11 items-center text-sm font-semibold text-pine">Voltar aos alunos</Link>
      {profile.isLoading ? <p className="text-sm text-muted">Carregando perfil…</p> : null}
      {profile.error instanceof Error ? <p className="text-sm text-danger">{profile.error.message}</p> : null}
      {data ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl">{data.student.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {data.student.enrollment ?? "Sem matrícula"} · {seriesLabel(data.student.series)} · situação {data.student.status}
              </p>
              <div className="mt-2"><Badge tone={data.view.situation.tone}>{data.view.situation.label}</Badge></div>
            </div>
            <Button
              type="button"
              variant="soft"
              onClick={async () => {
                if (!workspace || !yearId) return;
                try {
                  const report = await buildExport({
                    data: {
                      schoolId: workspace.school.id,
                      kind: "report_cards",
                      includeNotes: true,
                      columns: null,
                      filter: { yearId, series: null, classId: data.student.classId, subjectId: null, periodId: null, studentId },
                    },
                  });
                  const mine = { ...report, bulletins: report.bulletins.filter((item) => item.studentId === studentId) };
                  await saveReport("pdf", mine.bulletins.length ? mine : report);
                } catch (error) {
                  toast.error(errText(error));
                }
              }}
            >
              Boletim em PDF
            </Button>
          </div>
          <section className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-card border border-line bg-card p-4">
              <p className="text-xs text-muted uppercase">Média no ano</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{fmtGrade(data.view.average)}</p>
              <p className="text-xs text-muted">Mínima {fmtGrade(data.view.passing)}. Comparação só com a própria evolução.</p>
            </article>
            <article className="rounded-card border border-line bg-card p-4">
              <p className="text-xs text-muted uppercase">Frequência</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{fmtPercent(data.view.frequency?.percent)}</p>
              <p className="text-xs text-muted">{data.view.frequency ? `${data.view.frequency.absences} faltas em ${data.view.frequency.considered} aulas registradas` : "Sem aulas registradas"}</p>
            </article>
            <article className="rounded-card border border-line bg-card p-4">
              <p className="text-xs text-muted uppercase">Pendências</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{data.view.assessments.filter((item) => item.status === "pending").length}</p>
            </article>
          </section>
          <section className="rounded-card border border-line bg-card p-4">
            <h2 className="text-xl">Evolução individual</h2>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.view.evolution}>
                  <XAxis dataKey="period" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <YAxis domain={[0, workspace?.school.gradeScaleMax ?? 10]} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }} />
                  <Line dataKey="average" name="Média" stroke="var(--pine)" strokeWidth={2} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {data.view.comparisons.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </section>
          {data.view.subjects.map((subject) => (
            <section key={subject.id} className="overflow-auto rounded-card border border-line bg-card">
              <h2 className="px-4 pt-4 text-xl">{subject.name}</h2>
              <p className="px-4 text-sm text-muted">Acumulada {fmtGrade(subject.accumulated)}</p>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    {["Período", "Regular", "Recuperação", "Resultado", "Nota necessária"].map((head) => <th key={head} className="px-4 py-2 font-medium">{head}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {subject.periods.map((period) => (
                    <tr key={period.id} className="border-t border-line">
                      <td className="px-4 py-2">{period.name}</td>
                      <td className="px-4 py-2 tabular-nums">{fmtGrade(period.base)}</td>
                      <td className="px-4 py-2 tabular-nums">{fmtGrade(period.recovery)}</td>
                      <td className="px-4 py-2 tabular-nums">{fmtGrade(period.final)}</td>
                      <td className="px-4 py-2">{period.needed.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
          <section className="overflow-auto rounded-card border border-line bg-card">
            <h2 className="px-4 pt-4 text-xl">Lançamentos</h2>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  {["Disciplina", "Avaliação", "Período", "Nota", "Situação"].map((head) => <th key={head} className="px-4 py-2">{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.view.assessments.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-4 py-2">{item.subject}</td>
                    <td className="px-4 py-2">{item.name}{item.isRecovery ? " · recuperação" : ""}</td>
                    <td className="px-4 py-2">{item.period}</td>
                    <td className="px-4 py-2 tabular-nums">{item.status === "graded" ? fmtGrade(item.value) : "—"}</td>
                    <td className="px-4 py-2">{MARK_STATUSES.find((status) => status.id === item.status)?.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="rounded-card border border-line bg-card p-4">
            <h2 className="text-xl">Histórico de turmas</h2>
            <ul className="mt-2 text-sm">
              {data.history.length === 0 ? <li className="text-muted">Sem movimentação registrada.</li> : null}
              {data.history.map((item, index) => (
                <li key={index}>{item.year} · {seriesLabel(item.series)} {item.className} · {item.status} · {item.startedOn ?? "—"} até {item.endedOn ?? "agora"}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-card border border-line bg-card p-4">
            <h2 className="text-xl">Avaliação qualitativa</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {data.view.qualitative.length === 0 ? <li className="text-sm text-muted">Nenhum registro qualitativo.</li> : null}
              {data.view.qualitative.map((item, index) => (
                <li key={index} className="border-t border-line pt-3 text-sm">
                  <p className="font-semibold">{item.date} · {item.criterion} · {item.level}</p>
                  {item.comment ? <p className="text-pretty text-muted">{item.comment}</p> : null}
                </li>
              ))}
            </ul>
          </section>
          {data.student.notes ? (
            <section className="rounded-card border border-line bg-card p-4">
              <h2 className="text-xl">Observações pedagógicas</h2>
              <p className="mt-2 text-sm text-pretty">{data.student.notes}</p>
            </section>
          ) : null}
          <details className="rounded-card border border-line bg-card p-4 text-sm">
            <summary className="cursor-pointer font-semibold">Como a média foi calculada</summary>
            <ul className="mt-2 list-disc pl-5">
              {data.view.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </details>
          {workspace?.role === "admin" ? (
            <section className="rounded-card border border-danger/40 bg-card p-4">
              <h2 className="text-xl">Excluir cadastro</h2>
              <p className="mt-1 text-sm text-muted">A exclusão apaga o histórico deste estudante. Prefira arquivar. Digite o nome completo para confirmar.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input className={`${controlClass} max-w-sm`} value={confirmName} onChange={(event) => setConfirmName(event.target.value)} aria-label="Confirmar nome para excluir" />
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    if (!workspace) return;
                    try {
                      await deleteStudent({ data: { schoolId: workspace.school.id, id: studentId, confirmName } });
                      await client.invalidateQueries({ queryKey: ["students"] });
                      toast.success("Estudante excluído.");
                      void navigate({ to: "/alunos", search: { q: "" } });
                    } catch (error) {
                      toast.error(errText(error));
                    }
                  }}
                >
                  Excluir definitivamente
                </Button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
