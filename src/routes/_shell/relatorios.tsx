import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, Notice, PageHeader, controlClass, errText } from "@/components/ui";
import { buildExport, getDashboard } from "@/lib/school/api";
import { EXPORT_COLUMNS, type ExportKind } from "@/lib/school/reports";
import { saveReport } from "@/lib/school/files";
import { seriesLabel } from "@/lib/school/format";

const KINDS: { id: ExportKind; label: string; question: string }[] = [
  { id: "students", label: "Lista de alunos", question: "Quem está em cada turma?" },
  { id: "gradebook", label: "Diário de notas", question: "Qual foi o lançamento de cada avaliação?" },
  { id: "report_cards", label: "Boletins", question: "Como está cada estudante, sem comparar com os outros?" },
  { id: "period_results", label: "Resultados por período", question: "Qual foi o resultado de cada bimestre?" },
  { id: "below_average", label: "Abaixo da média", question: "Quem está abaixo da média configurada?" },
  { id: "recovery", label: "Recuperação", question: "Quem tem recuperação ou ainda precisa dela?" },
  { id: "qualitative", label: "Avaliação qualitativa", question: "Quais critérios pedem mais acompanhamento?" },
  { id: "frequency", label: "Frequência", question: "Como estão as presenças registradas?" },
  { id: "class_overview", label: "Visão da turma", question: "Qual turma evoluiu mais neste recorte?" },
  { id: "annual_history", label: "Histórico anual", question: "Qual é o histórico do ano por estudante?" },
];

const GROUPS: { title: string; ids: ExportKind[] }[] = [
  { title: "Cadastro", ids: ["students"] },
  { title: "Notas e resultados", ids: ["gradebook", "report_cards", "period_results", "below_average", "recovery", "annual_history"] },
  { title: "Acompanhamento", ids: ["qualitative", "frequency", "class_overview"] },
];

export const Route = createFileRoute("/_shell/relatorios")({ component: ReportsPage });

function ReportsPage() {
  const { workspace, yearId } = useSchool();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [kind, setKind] = useState<ExportKind>("below_average");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [columns, setColumns] = useState<string[]>(EXPORT_COLUMNS.below_average);
  const [busy, setBusy] = useState<string | null>(null);
  const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
  const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
  const dash = useQuery({
    queryKey: ["report-dash", workspace?.school.id, yearId, classId, subjectId, periodId],
    enabled: Boolean(workspace && yearId),
    queryFn: () => getDashboard({ data: { schoolId: workspace!.school.id, filter: { yearId, series: null, classId: classId || null, subjectId: subjectId || null, periodId: periodId || null, studentId: null } } }),
  });

  async function download(format: "xlsx" | "csv" | "pdf") {
    if (!workspace || !yearId) return;
    setBusy(format);
    try {
      const report = await buildExport({
        data: {
          schoolId: workspace.school.id,
          kind,
          includeNotes,
          columns,
          filter: { yearId, series: null, classId: classId || null, subjectId: subjectId || null, periodId: periodId || null, studentId: null },
        },
      });
      await saveReport(format, report);
      toast.success("Arquivo gerado.");
    } catch (error) {
      toast.error(errText(error));
    } finally {
      setBusy(null);
    }
  }

  if (!workspace) return null;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Relatórios"
        description="O arquivo usa o filtro atual. Observações qualitativas só entram se você marcar a opção. Nenhum tipo de relatório foi removido."
      />
      <div className="grid gap-3 rounded-card border border-line bg-card p-3 md:grid-cols-3">
        <select className={controlClass} value={classId} onChange={(event) => setClassId(event.target.value)} aria-label="Turma">
          <option value="">Todas as turmas</option>
          {classes.map((klass) => <option key={klass.id} value={klass.id}>{seriesLabel(klass.series)} {klass.name}</option>)}
        </select>
        <select className={controlClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Disciplina">
          <option value="">Todas as disciplinas</option>
          {workspace.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <select className={controlClass} value={periodId} onChange={(event) => setPeriodId(event.target.value)} aria-label="Período">
          <option value="">Ano todo</option>
          {periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-4">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">{group.title}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {KINDS.filter((item) => group.ids.includes(item.id)).map((item) => (
                <button key={item.id} type="button" onClick={() => { setKind(item.id); setColumns(EXPORT_COLUMNS[item.id]); }} className={`rounded-card border p-4 text-left ${kind === item.id ? "border-pine bg-pine-soft" : "border-line bg-card"}`}>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-muted">{item.question}</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <fieldset className="rounded-card border border-line bg-card p-4">
        <legend className="px-1 text-sm font-semibold">Colunas</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {EXPORT_COLUMNS[kind].map((column) => (
            <label key={column} className="flex h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={columns.includes(column)}
                onChange={(event) => setColumns((current) => event.target.checked ? [...current, column] : current.filter((item) => item !== column))}
              />
              {column}
            </label>
          ))}
        </div>
        <label className="mt-2 flex h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={includeNotes} onChange={(event) => setIncludeNotes(event.target.checked)} />
          Incluir observações e comentários pedagógicos
        </label>
      </fieldset>
      <section className="rounded-card border border-line bg-card p-4 text-sm">
        <h2>Resumo antes de exportar</h2>
        <ul className="mt-2 flex flex-col gap-1 text-muted">
          <li>Relatório: {KINDS.find((item) => item.id === kind)?.label}</li>
          <li>Turma: {classes.find((klass) => klass.id === classId) ? `${seriesLabel(classes.find((klass) => klass.id === classId)!.series)} ${classes.find((klass) => klass.id === classId)!.name}` : "Todas"}</li>
          <li>Disciplina: {workspace.subjects.find((subject) => subject.id === subjectId)?.name ?? "Todas"}</li>
          <li>Período: {periods.find((period) => period.id === periodId)?.name ?? "Ano todo"}</li>
          <li>Colunas: {columns.join(", ") || "nenhuma"}</li>
          <li>Observações: {includeNotes ? "incluídas" : "fora do arquivo"}</li>
        </ul>
      </section>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={Boolean(busy)} onClick={() => download("xlsx")}>{busy === "xlsx" ? "Gerando Excel…" : "Excel"}</Button>
        <Button type="button" variant="soft" disabled={Boolean(busy)} onClick={() => download("csv")}>{busy === "csv" ? "Gerando CSV…" : "CSV"}</Button>
        <Button type="button" variant="soft" disabled={Boolean(busy)} onClick={() => download("pdf")}>{busy === "pdf" ? "Gerando PDF…" : "PDF"}</Button>
      </div>
      {busy ? <Notice>Gerando o arquivo {busy.toUpperCase()}. A exportação só conclui quando o download é disparado.</Notice> : null}
      {dash.data ? (
        <section className="rounded-card border border-line bg-card p-4 text-sm">
          <h2 className="text-xl">Leitura deste recorte</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>{dash.data.belowCount} estudantes com média abaixo da mínima, entre {dash.data.gradedStudents} que já têm nota.</li>
            <li>{dash.data.improved.length} variações de melhora e {dash.data.declined.length} de queda entre períodos com pelo menos meio décimo da escala.</li>
            <li>{dash.data.consistentDrops.length} com queda em períodos seguidos.</li>
            <li>{dash.data.pendingStudents} com avaliação pendente.</li>
            <li>{dash.data.qualitativeHotspots.map((item) => `${item.name}: ${item.students}`).join(" · ") || "Nenhum critério no último nível da escala."}</li>
            <li>{dash.data.bestEvolution?.text ?? "Ainda não há dois períodos com média para comparar turmas."}</li>
            <li>Menor média de avaliação: {dash.data.lowestAssessments[0] ? `${dash.data.lowestAssessments[0].name} (${dash.data.lowestAssessments[0].className})` : "sem notas lançadas"}.</li>
          </ul>
        </section>
      ) : null}
    </div>
  );
}
