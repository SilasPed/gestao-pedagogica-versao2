import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, controlClass, errText } from "@/components/ui";
import { deleteSession, getAttendance, saveMarks, saveSession } from "@/lib/school/api";
import { FREQ_MARKS } from "@/lib/school/constants";
import { frequencyOf } from "@/lib/school/calc";
import { fmtPercent, seriesLabel, todayBR } from "@/lib/school/format";

export const Route = createFileRoute("/_shell/frequencia")({ component: AttendancePage });

function AttendancePage() {
  const { workspace, yearId } = useSchool();
  const client = useQueryClient();
  const [classId, setClassId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [date, setDate] = useState(todayBR());
  const [subjectId, setSubjectId] = useState("");
  const [label, setLabel] = useState("Aula");
  const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
  const board = useQuery({
    queryKey: ["attendance", workspace?.school.id, classId],
    enabled: Boolean(workspace && classId),
    queryFn: () => getAttendance({ data: { schoolId: workspace!.school.id, classId } }),
  });
  const session = board.data?.sessions.find((item) => item.id === sessionId) ?? board.data?.sessions[0];
  const policy = workspace
    ? { justifiedRule: workspace.school.justifiedRule, lateRule: workspace.school.lateRule, minimum: workspace.school.frequencyMinPercent }
    : null;
  if (!workspace) return null;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl">Frequência</h1>
        <p className="text-sm text-muted">Aula sem registro não conta como falta. Pendente fica de fora do percentual.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <select className={controlClass} value={classId} onChange={(event) => { setClassId(event.target.value); setSessionId(""); }} aria-label="Turma">
          <option value="">Turma</option>
          {classes.map((klass) => <option key={klass.id} value={klass.id}>{seriesLabel(klass.series)} {klass.name}</option>)}
        </select>
        <select className={controlClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Disciplina">
          <option value="">Disciplina opcional</option>
          {workspace.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <input type="date" className={controlClass} value={date} onChange={(event) => setDate(event.target.value)} aria-label="Data" />
        <input className={controlClass} value={label} onChange={(event) => setLabel(event.target.value)} aria-label="Nome da aula" />
      </div>
      <Button
        type="button"
        disabled={!classId}
        onClick={async () => {
          try {
            const created = await saveSession({ data: { schoolId: workspace.school.id, classId, subjectId: subjectId || null, periodId: null, date, label } });
            setSessionId(created.id);
            await client.invalidateQueries({ queryKey: ["attendance"] });
            toast.success("Aula aberta com registros pendentes.");
          } catch (error) {
            toast.error(errText(error));
          }
        }}
      >
        Abrir aula
      </Button>
      {board.data ? (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <ul className="flex flex-col gap-2">
            {board.data.sessions.map((item) => (
              <li key={item.id}>
                <button type="button" className="h-11 w-full rounded-card border border-line bg-card px-3 text-left text-sm" onClick={() => setSessionId(item.id)}>
                  {item.date} · {item.label || "Aula"}
                </button>
              </li>
            ))}
          </ul>
          {session && policy ? (
            <section className="rounded-card border border-line bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl">{session.date} · {session.label || "Aula"}</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="soft"
                    onClick={async () => {
                      if (!window.confirm("Marcar todos os estudantes desta aula como presentes?")) return;
                      try {
                        await saveMarks({
                          data: {
                            schoolId: workspace.school.id,
                            items: board.data!.students.map((student) => ({ sessionId: session.id, studentId: student.id, status: "present" })),
                          },
                        });
                        await client.invalidateQueries({ queryKey: ["attendance"] });
                      } catch (error) {
                        toast.error(errText(error));
                      }
                    }}
                  >
                    Todos presentes
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={async () => {
                      if (!window.confirm("Excluir esta aula e os registros dela?")) return;
                      await deleteSession({ data: { schoolId: workspace.school.id, id: session.id } });
                      setSessionId("");
                      await client.invalidateQueries({ queryKey: ["attendance"] });
                    }}
                  >
                    Excluir aula
                  </Button>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {board.data.students.map((student) => {
                  const mark = board.data!.marks.find((item) => item.sessionId === session.id && item.studentId === student.id)?.status ?? "pending";
                  const personal = frequencyOf(
                    board.data!.marks.filter((item) => item.studentId === student.id).map((item) => item.status as "present"),
                    policy,
                  );
                  return (
                    <li key={student.id} className="grid items-center gap-2 border-t border-line py-2 md:grid-cols-[1fr_180px_120px]">
                      <span>{student.name}</span>
                      <select
                        className={controlClass}
                        value={mark}
                        aria-label={`Frequência de ${student.name}`}
                        onChange={async (event) => {
                          try {
                            await saveMarks({ data: { schoolId: workspace.school.id, items: [{ sessionId: session.id, studentId: student.id, status: event.target.value }] } });
                            await client.invalidateQueries({ queryKey: ["attendance"] });
                          } catch (error) {
                            toast.error(errText(error));
                          }
                        }}
                      >
                        {FREQ_MARKS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                      </select>
                      <span className="text-sm tabular-nums text-muted">{fmtPercent(personal.percent)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : <p className="text-sm text-muted">Nenhuma aula registrada nesta turma.</p>}
        </div>
      ) : null}
    </div>
  );
}
