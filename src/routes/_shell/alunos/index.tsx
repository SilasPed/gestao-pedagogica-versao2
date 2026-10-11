import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, Dialog, Empty, Field, controlClass, errText } from "@/components/ui";
import { STUDENT_STATUSES } from "@/lib/school/constants";
import { archiveStudent, listStudents, saveStudent } from "@/lib/school/api";
import { seriesLabel } from "@/lib/school/format";

export const Route = createFileRoute("/_shell/alunos/")({
  validateSearch: (search: Record<string, unknown>) => ({ q: typeof search.q === "string" ? search.q : "" }),
  component: StudentsPage,
});

function StudentsPage() {
  const { q } = Route.useSearch();
  const { workspace, yearId } = useSchool();
  const client = useQueryClient();
  const [query, setQuery] = useState(q);
  const [classId, setClassId] = useState("");
  const [series, setSeries] = useState("");
  const [status, setStatus] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  useEffect(() => setQuery(q), [q]);
  useEffect(() => setPage(1), [query, classId, series, status, archived, yearId]);

  const list = useQuery({
    queryKey: ["students", workspace?.school.id, yearId, query, classId, series, status, archived, page],
    enabled: Boolean(workspace),
    queryFn: () =>
      listStudents({
        data: {
          schoolId: workspace!.school.id,
          yearId,
          query,
          classId: classId || null,
          series: series || null,
          status: status || null,
          archived,
          page,
          pageSize: 25,
        },
      }),
  });
  const save = useMutation({
    mutationFn: saveStudent,
    onSuccess: async () => {
      toast.success("Estudante salvo.");
      setOpen(false);
      setConfirmDuplicate(false);
      await client.invalidateQueries({ queryKey: ["students"] });
      await client.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error) => {
      const message = errText(error);
      if (message.includes("duplicidade")) setConfirmDuplicate(true);
      toast.error(message);
    },
  });

  const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
  const current = list.data?.rows.find((row) => row.id === editing);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Alunos</h1>
          <p className="text-sm text-muted">Busca por nome ou matrícula. Arquivar não apaga o histórico de notas.</p>
        </div>
        <Button type="button" onClick={() => { setEditing(null); setConfirmDuplicate(false); setOpen(true); }}>
          Novo estudante
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <input className={controlClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome ou matrícula" aria-label="Buscar" />
        <select className={controlClass} value={series} onChange={(event) => setSeries(event.target.value)} aria-label="Série">
          <option value="">Todas as séries</option>
          <option value="1">1º ano</option>
          <option value="2">2º ano</option>
          <option value="3">3º ano</option>
        </select>
        <select className={controlClass} value={classId} onChange={(event) => setClassId(event.target.value)} aria-label="Turma">
          <option value="">Todas as turmas</option>
          {classes.map((klass) => (
            <option key={klass.id} value={klass.id}>{seriesLabel(klass.series)} {klass.name}</option>
          ))}
        </select>
        <select className={controlClass} value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Situação">
          <option value="">Todas as situações</option>
          {STUDENT_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>
      <label className="flex h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} />
        Mostrar arquivados
      </label>
      {list.isLoading ? <p className="text-sm text-muted">Buscando…</p> : null}
      {list.data && list.data.total === 0 ? <Empty title="Nenhum estudante neste filtro" text="Cadastre alguém ou importe uma planilha. A lista não traz nomes de demonstração." /> : null}
      {list.data && list.data.total > 0 ? (
        <div className="overflow-auto rounded-card border border-line bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-soft text-left">
              <tr>
                {["Nome", "Matrícula", "Série", "Turma", "Curso", "Situação", ""].map((head) => (
                  <th key={head} className="px-3 py-3 font-medium">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.data.rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-3 py-2 font-medium">
                    <Link to="/alunos/$studentId" params={{ studentId: row.id }} className="underline-offset-2 hover:underline">{row.fullName}</Link>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{row.enrollment ?? "—"}</td>
                  <td className="px-3 py-2">{seriesLabel(row.series)}</td>
                  <td className="px-3 py-2">{row.className ?? "—"}</td>
                  <td className="px-3 py-2">{row.courseName ?? "—"}</td>
                  <td className="px-3 py-2">{STUDENT_STATUSES.find((item) => item.id === row.status)?.label ?? row.status}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="h-11 px-2 text-pine" onClick={() => { setEditing(row.id); setConfirmDuplicate(false); setOpen(true); }}>Editar</button>
                    <button
                      type="button"
                      className="h-11 px-2 text-muted"
                      onClick={async () => {
                        if (!workspace) return;
                        if (!window.confirm(row.archived ? "Reativar este estudante?" : "Arquivar este estudante? As notas permanecem.")) return;
                        try {
                          await archiveStudent({ data: { schoolId: workspace.school.id, id: row.id, archived: !row.archived } });
                          await client.invalidateQueries({ queryKey: ["students"] });
                        } catch (error) {
                          toast.error(errText(error));
                        }
                      }}
                    >
                      {row.archived ? "Reativar" : "Arquivar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {list.data && list.data.total > list.data.pageSize ? (
        <div className="flex items-center gap-2 text-sm">
          <Button type="button" variant="soft" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</Button>
          <span className="tabular-nums">Página {page} de {Math.ceil(list.data.total / list.data.pageSize)}</span>
          <Button type="button" variant="soft" disabled={page * list.data.pageSize >= list.data.total} onClick={() => setPage((value) => value + 1)}>Próxima</Button>
        </div>
      ) : null}
      <Dialog open={open} title={editing ? "Editar estudante" : "Novo estudante"} onClose={() => setOpen(false)}>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!workspace || !yearId) return;
            const form = new FormData(event.currentTarget);
            save.mutate({
              data: {
                schoolId: workspace.school.id,
                id: editing,
                fullName: String(form.get("fullName") ?? ""),
                enrollment: String(form.get("enrollment") ?? ""),
                yearId,
                classId: String(form.get("classId") ?? "") || null,
                courseId: String(form.get("courseId") ?? "") || null,
                series: String(form.get("series") ?? "") || null,
                status: String(form.get("status") ?? "ativo"),
                notes: String(form.get("notes") ?? ""),
                confirmDuplicate,
              },
            });
          }}
        >
          <Field label="Nome completo"><input name="fullName" required defaultValue={current?.fullName ?? ""} className={controlClass} /></Field>
          <Field label="Matrícula" hint="Opcional, mas é a chave mais segura na importação."><input name="enrollment" defaultValue={current?.enrollment ?? ""} className={controlClass} /></Field>
          <Field label="Série">
            <select name="series" defaultValue={current?.series ?? "1"} className={controlClass}>
              <option value="1">1º ano</option>
              <option value="2">2º ano</option>
              <option value="3">3º ano</option>
            </select>
          </Field>
          <Field label="Turma">
            <select name="classId" defaultValue={current?.classId ?? ""} className={controlClass}>
              <option value="">Sem turma</option>
              {classes.map((klass) => <option key={klass.id} value={klass.id}>{seriesLabel(klass.series)} {klass.name}</option>)}
            </select>
          </Field>
          <Field label="Curso técnico">
            <select name="courseId" defaultValue={current?.courseId ?? ""} className={controlClass}>
              <option value="">Herdar da turma ou deixar em branco</option>
              {workspace?.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </Field>
          <Field label="Situação">
            <select name="status" defaultValue={current?.status ?? "ativo"} className={controlClass}>
              {STUDENT_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Observações pedagógicas">
            <textarea name="notes" defaultValue={current?.notes ?? ""} className="min-h-24 w-full rounded-card border border-line bg-card p-3 text-sm" />
          </Field>
          {confirmDuplicate ? <p className="text-sm text-warn">Há um cadastro parecido. Envie de novo para confirmar que não é duplicidade acidental.</p> : null}
          <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando…" : confirmDuplicate ? "Confirmar e salvar" : "Salvar"}</Button>
        </form>
      </Dialog>
    </div>
  );
}
