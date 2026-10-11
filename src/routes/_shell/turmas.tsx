import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, Dialog, Empty, Field, Notice, PageHeader, controlClass, errText } from "@/components/ui";
import { archiveClass, saveClass, saveClassSubjects, saveCourse } from "@/lib/school/api";
import { seriesLabel } from "@/lib/school/format";

export const Route = createFileRoute("/_shell/turmas")({ component: ClassesPage });

function ClassesPage() {
  const { workspace, yearId, refresh } = useSchool();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [linksFor, setLinksFor] = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const classes = (workspace?.classes ?? []).filter((klass) => klass.yearId === yearId);
  const save = useMutation({
    mutationFn: saveClass,
    onSuccess: async () => {
      toast.success("Turma salva.");
      setOpen(false);
      await refresh();
      await client.invalidateQueries();
    },
    onError: (error) => toast.error(errText(error)),
  });
  if (!workspace) return <Notice>Carregando…</Notice>;
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Turmas"
        description="Série, curso técnico e professores da turma. Arquivar não reescreve notas antigas."
        actions={<Button type="button" onClick={() => { setEditing(null); setOpen(true); }}>Nova turma</Button>}
      />
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await saveCourse({ data: { schoolId: workspace.school.id, id: null, name: courseName } });
            setCourseName("");
            await refresh();
            toast.success("Curso salvo.");
          } catch (error) {
            toast.error(errText(error));
          }
        }}
      >
        <input value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Novo curso técnico" className={`${controlClass} max-w-sm`} aria-label="Curso técnico" />
        <Button type="submit" variant="soft">Adicionar curso</Button>
      </form>
      {classes.length === 0 ? <Empty title="Nenhuma turma neste ano" text="Crie a primeira turma para lançar notas." /> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {classes.map((klass) => (
          <article key={klass.id} className="rounded-card border border-line bg-card p-4">
            <h2 className="text-xl">{seriesLabel(klass.series)} {klass.name}</h2>
            <p className="text-sm text-muted">
              {workspace.courses.find((course) => course.id === klass.courseId)?.name ?? "Sem curso"} · {klass.studentCount} ativos
              {klass.teacherName ? ` · ${klass.teacherName}` : ""}
              {klass.archived ? " · arquivada" : ""}
            </p>
            <p className="mt-2 text-sm">
              Disciplinas: {workspace.classSubjects.filter((link) => link.classId === klass.id).map((link) => workspace.subjects.find((subject) => subject.id === link.subjectId)?.name).filter(Boolean).join(", ") || "nenhuma vinculada"}
            </p>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="ghost" onClick={() => { setEditing(klass.id); setOpen(true); }}>Editar</Button>
              <Button type="button" variant="soft" onClick={() => setLinksFor(klass.id)}>Disciplinas</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={async () => {
                  if (!window.confirm(klass.archived ? "Reativar a turma?" : "Arquivar a turma? O histórico de notas permanece.")) return;
                  try {
                    await archiveClass({ data: { schoolId: workspace.school.id, id: klass.id, archived: !klass.archived } });
                    await refresh();
                  } catch (error) {
                    toast.error(errText(error));
                  }
                }}
              >
                {klass.archived ? "Reativar" : "Arquivar"}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <Dialog open={open} title={editing ? "Editar turma" : "Nova turma"} onClose={() => setOpen(false)}>
        <form
          key={editing ?? "nova"}
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            save.mutate({
              data: {
                schoolId: workspace.school.id,
                id: editing,
                yearId,
                name: String(form.get("name") ?? ""),
                series: String(form.get("series") ?? "1"),
                courseId: String(form.get("courseId") ?? "") || null,
                teacherName: String(form.get("teacherName") ?? ""),
                passingAverage: String(form.get("passing") ?? "") || null,
              },
            });
          }}
        >
          <Field label="Nome"><input name="name" required className={controlClass} placeholder="A" defaultValue={classes.find((klass) => klass.id === editing)?.name ?? ""} /></Field>
          <Field label="Série">
            <select name="series" className={controlClass} defaultValue={classes.find((klass) => klass.id === editing)?.series ?? "1"}><option value="1">1º ano</option><option value="2">2º ano</option><option value="3">3º ano</option></select>
          </Field>
          <Field label="Curso técnico">
            <select name="courseId" className={controlClass} defaultValue={classes.find((klass) => klass.id === editing)?.courseId ?? ""}><option value="">Não informado</option>{workspace.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select>
          </Field>
          <Field label="Professor responsável"><input name="teacherName" className={controlClass} defaultValue={classes.find((klass) => klass.id === editing)?.teacherName ?? ""} /></Field>
          <Field label="Média mínima da turma" hint="Em branco usa a média da escola."><input name="passing" className={controlClass} defaultValue={classes.find((klass) => klass.id === editing)?.passingAverage ?? ""} /></Field>
          <Button type="submit" disabled={save.isPending}>Salvar turma</Button>
        </form>
      </Dialog>
      <Dialog open={Boolean(linksFor)} title="Disciplinas da turma" onClose={() => setLinksFor(null)}>
        {linksFor ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const links = workspace.subjects.flatMap((subject) => {
                if (!form.get(`sub-${subject.id}`)) return [];
                return [{ subjectId: subject.id, teacherName: String(form.get(`teacher-${subject.id}`) ?? "") }];
              });
              try {
                await saveClassSubjects({ data: { schoolId: workspace.school.id, classId: linksFor, links } });
                await refresh();
                setLinksFor(null);
                toast.success("Disciplinas atualizadas.");
              } catch (error) {
                toast.error(errText(error));
              }
            }}
          >
            {workspace.subjects.map((subject) => {
              const current = workspace.classSubjects.find((link) => link.classId === linksFor && link.subjectId === subject.id);
              return (
                <label key={subject.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`sub-${subject.id}`} defaultChecked={Boolean(current)} />
                  <span className="w-28">{subject.name}</span>
                  <input name={`teacher-${subject.id}`} defaultValue={current?.teacherName ?? subject.teacherName} placeholder="Professor" className={controlClass} />
                </label>
              );
            })}
            <Button type="submit">Salvar vínculos</Button>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
