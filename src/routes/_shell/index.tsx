import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSchool } from "@/components/school-context";
import { Badge, Empty, Stat, controlClass } from "@/components/ui";
import { getDashboard, listStudents } from "@/lib/school/api";
import { fmtGrade, fmtPercent } from "@/lib/school/format";

export const Route = createFileRoute("/_shell/")({ component: DashboardPage });

function DashboardPage() {
  const { workspace, yearId, loading, error } = useSchool();
  const [series, setSeries] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [studentId, setStudentId] = useState("");
  const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId && (!series || klass.series === series));
  const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
  const dash = useQuery({
    queryKey: ["dashboard", workspace?.school.id, yearId, series, classId, subjectId, periodId, studentId],
    enabled: Boolean(workspace && yearId),
    queryFn: () =>
      getDashboard({
        data: {
          schoolId: workspace!.school.id,
          filter: {
            yearId,
            series: series || null,
            classId: classId || null,
            subjectId: subjectId || null,
            periodId: periodId || null,
            studentId: studentId || null,
          },
        },
      }),
  });
  const matches = useQuery({
    queryKey: ["dash-find", workspace?.school.id, yearId, studentQuery],
    enabled: Boolean(workspace && studentQuery.trim().length >= 2 && !studentId),
    queryFn: () => listStudents({ data: { schoolId: workspace!.school.id, yearId, query: studentQuery.trim(), page: 1, pageSize: 8, archived: false } }),
  });

  if (loading) return <p className="text-sm text-muted">Carregando a escola…</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!workspace) return null;
  const data = dash.data;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl">Painel</h1>
        <p className="mt-1 text-sm text-muted">
          {workspace.school.name} · {workspace.counts.students} estudantes · {workspace.counts.classes} turmas · {workspace.counts.subjects} disciplinas · {workspace.counts.assessments} avaliações.
          Célula vazia não entra como zero.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <select className={controlClass} value={series} onChange={(event) => { setSeries(event.target.value); setStudentId(""); }} aria-label="Série">
          <option value="">Todas as séries</option>
          <option value="1">1º ano</option>
          <option value="2">2º ano</option>
          <option value="3">3º ano</option>
        </select>
        <select className={controlClass} value={classId} onChange={(event) => { setClassId(event.target.value); setStudentId(""); }} aria-label="Turma">
          <option value="">Todas as turmas</option>
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>
              {klass.series}º {klass.name}
            </option>
          ))}
        </select>
        <select className={controlClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Disciplina">
          <option value="">Todas as disciplinas</option>
          {workspace.subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <select className={controlClass} value={periodId} onChange={(event) => setPeriodId(event.target.value)} aria-label="Período">
          <option value="">Ano todo</option>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      </div>
      <div className="relative max-w-md">
        <input
          className={controlClass}
          value={studentId ? studentQuery : studentQuery}
          placeholder="Filtrar um estudante"
          aria-label="Estudante"
          onChange={(event) => {
            setStudentQuery(event.target.value);
            setStudentId("");
          }}
        />
        {studentId ? (
          <button type="button" className="mt-1 text-sm text-pine" onClick={() => { setStudentId(""); setStudentQuery(""); }}>
            Limpar estudante
          </button>
        ) : null}
        {!studentId && matches.data && matches.data.rows.length > 0 ? (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-card border border-line bg-card shadow-lg">
            {matches.data.rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="h-11 w-full px-3 text-left text-sm hover:bg-soft"
                  onClick={() => {
                    setStudentId(row.id);
                    setStudentQuery(row.fullName);
                  }}
                >
                  {row.fullName}{row.className ? ` · ${row.className}` : ""}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {dash.isLoading ? <p className="text-sm text-muted">Calculando indicadores…</p> : null}
      {dash.error instanceof Error ? <p className="text-sm text-danger">{dash.error.message}</p> : null}
      {data && data.studentCount === 0 ? (
        <Empty title="Ainda não há turma neste filtro" text="Cadastre estudantes e lançamentos. O painel não mostra números de exemplo no lugar dos dados reais." />
      ) : null}
      {data && data.studentCount > 0 ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Estudantes no filtro" value={String(data.studentCount)} hint={`${data.classCount} turmas · ${data.assessmentCount} avaliações`} />
            <Stat label="Média geral" value={fmtGrade(data.generalAverage)} hint={data.gradedStudents ? `${data.gradedStudents} com nota` : "Sem nota lançada"} />
            <Stat label="Desempenho satisfatório" value={fmtPercent(data.satisfactoryPercent)} hint="Entre quem já tem média" />
            <Stat label="Abaixo da média" value={String(data.belowCount)} hint={`${data.pendingStudents} com nota pendente`} />
            <Stat label="Frequência média" value={fmtPercent(data.frequencyAverage)} hint={data.frequencyAverage == null ? "Sem aulas registradas" : `${data.absenceCount} faltas contadas`} />
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Evolução entre períodos">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.evolution}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <YAxis domain={[0, workspace.school.gradeScaleMax]} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }} />
                  <Line type="monotone" dataKey="average" name="Média" stroke="var(--pine)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Distribuição das médias">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.distribution}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", color: "var(--ink)" }} />
                  <Bar dataKey="count" name="Estudantes" fill="var(--pine)" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>
          <section className="grid gap-4 lg:grid-cols-2">
            <SimpleTable
              title="Média por turma"
              columns={["Turma", "Alunos", "Média", "Abaixo", "Pendências"]}
              rows={data.byClass.map((row) => [row.name, row.students, fmtGrade(row.average), row.below, row.pending])}
            />
            <SimpleTable
              title="Média por disciplina"
              columns={["Disciplina", "Média", "Pendências"]}
              rows={data.bySubject.map((row) => [row.name, fmtGrade(row.average), row.pending])}
            />
          </section>
          <section className="rounded-card border border-line bg-card p-4">
            <h2 className="text-xl">Acompanhamento pedagógico</h2>
            <p className="mt-1 text-sm text-muted">
              Cada nome aparece por uma regra objetiva. {data.watchTotal} estudantes no filtro.
              {data.bestEvolution ? ` Maior evolução de turma: ${data.bestEvolution.text}` : ""}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {data.watchlist.length === 0 ? <li className="text-sm text-muted">Nenhum alerta com os filtros atuais.</li> : null}
              {data.watchlist.map((item) => (
                <li key={item.studentId} className="rounded-card bg-soft px-3 py-3">
                  <p className="font-semibold">
                    {item.name} <span className="font-normal text-muted">· {item.className}</span>
                  </p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {item.reasons.map((reason) => (
                      <li key={reason.code + reason.text} className="text-sm text-pretty">
                        <Badge tone={reason.code === "media" ? "bad" : "warn"}>{reason.code}</Badge> {reason.text}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
          <SimpleTable
            title="Avaliações com menor média"
            columns={["Avaliação", "Disciplina", "Turma", "Média na escala", "Notas lançadas"]}
            rows={data.lowestAssessments.map((row) => [row.name, row.subject, row.className, fmtGrade(row.average), row.count])}
          />
        </>
      ) : null}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-card p-4">
      <h2 className="mb-3 text-xl">{title}</h2>
      {children}
    </section>
  );
}

function SimpleTable({ title, columns, rows }: { title: string; columns: string[]; rows: (string | number)[][] }) {
  return (
    <section className="overflow-auto rounded-card border border-line bg-card">
      <h2 className="px-4 pt-4 text-xl">{title}</h2>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-left text-muted">
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-3 text-muted" colSpan={columns.length}>
                Sem dados neste recorte.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index} className="border-t border-line">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
