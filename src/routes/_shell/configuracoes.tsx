import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, Field, controlClass, errText } from "@/components/ui";
import {
  activateYear,
  deleteCourse,
  deleteStaff,
  deleteSubject,
  exportBackup,
  joinSchool,
  listAudit,
  regenerateInvite,
  removeMember,
  renamePeriod,
  saveCourse,
  saveStaff,
  saveSubject,
  saveYear,
  updateMember,
  updateMyName,
  updateSettings,
} from "@/lib/school/api";
import { downloadBlob } from "@/lib/school/files";

export const Route = createFileRoute("/_shell/configuracoes")({ component: SettingsPage });

function SettingsPage() {
  const { workspace, yearId, refresh, setSchoolId } = useSchool();
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const audit = useQuery({
    queryKey: ["audit", workspace?.school.id],
    enabled: Boolean(workspace && (workspace.role === "admin" || workspace.role === "coordenacao")),
    queryFn: () => listAudit({ data: { schoolId: workspace!.school.id } }),
  });
  if (!workspace) return <p className="text-sm text-muted">Carregando…</p>;
  const canSettings = workspace.role === "admin" || workspace.role === "coordenacao";
  const isAdmin = workspace.role === "admin";
  const periods = workspace.periods.filter((period) => period.yearId === yearId);
  const school = workspace.school;

  async function run(work: () => Promise<unknown>, ok: string) {
    try {
      await work();
      await refresh();
      await client.invalidateQueries({ queryKey: ["audit"] });
      toast.success(ok);
    } catch (error) {
      toast.error(errText(error));
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-3xl">Configurações</h1>
        <p className="text-sm text-muted">
          Você está como {roleLabel(workspace.role)} em {school.name}. Cada professor só acessa as escolas em que foi autorizado.
        </p>
      </div>

      {workspace.memberships.length > 1 ? (
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="text-xl">Escola ativa</h2>
          <select className={`${controlClass} mt-3`} aria-label="Escola" value={school.id} onChange={(event) => setSchoolId(event.target.value)}>
            {workspace.memberships.map((item) => <option key={item.schoolId} value={item.schoolId}>{item.schoolName}</option>)}
          </select>
        </section>
      ) : null}

      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Seu nome nesta escola</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("name") ?? "");
            void run(() => updateMyName({ data: { schoolId: school.id, name } }), "Nome atualizado.");
          }}
        >
          <input name="name" defaultValue={workspace.myName} className={`${controlClass} max-w-sm`} aria-label="Seu nome" />
          <Button type="submit" variant="soft">Salvar nome</Button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Critérios de cálculo e frequência</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted">
          {workspace.rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
        {canSettings ? (
          <form
            className="mt-4 grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void run(
                () =>
                  updateSettings({
                    data: {
                      schoolId: school.id,
                      name: String(form.get("name") ?? ""),
                      gradeScaleMax: Number(String(form.get("scale") ?? "").replace(",", ".")),
                      passingAverage: Number(String(form.get("passing") ?? "").replace(",", ".")),
                      periodModel: String(form.get("periodModel") ?? "bimestre"),
                      calculationMode: String(form.get("mode") ?? "weighted"),
                      recoveryPolicy: String(form.get("recovery") ?? "replace_if_higher"),
                      absenceCountsAsZero: form.get("absence") === "on",
                      justifiedRule: String(form.get("justified") ?? "presence"),
                      lateRule: String(form.get("late") ?? "presence"),
                      frequencyMinPercent: Number(String(form.get("freq") ?? "75").replace(",", ".")),
                    },
                  }),
                "Configurações salvas.",
              );
            }}
          >
            <Field label="Nome da escola"><input name="name" defaultValue={school.name} className={controlClass} required /></Field>
            <Field label="Escala máxima" hint="0 até este valor. Aceita 10 ou 100."><input name="scale" defaultValue={school.gradeScaleMax} className={controlClass} /></Field>
            <Field label="Média mínima"><input name="passing" defaultValue={school.passingAverage} className={controlClass} /></Field>
            <Field label="Períodos" hint="Só muda se ainda não houver avaliação ligada a um período.">
              <select name="periodModel" defaultValue={school.periodModel} className={controlClass}>
                <option value="bimestre">Bimestres</option>
                <option value="trimestre">Trimestres</option>
                <option value="semestre">Semestres</option>
              </select>
            </Field>
            <Field label="Modo da média">
              <select name="mode" defaultValue={school.calculationMode} className={controlClass}>
                <option value="weighted">Ponderada</option>
                <option value="simple">Simples</option>
              </select>
            </Field>
            <Field label="Recuperação">
              <select name="recovery" defaultValue={school.recoveryPolicy} className={controlClass}>
                <option value="replace_if_higher">Substitui o período só se for maior</option>
                <option value="average_with_original">Média com a nota original</option>
                <option value="keep_both">Registra sem alterar o período</option>
              </select>
            </Field>
            <Field label="Falta justificada conta como">
              <select name="justified" defaultValue={school.justifiedRule} className={controlClass}>
                <option value="presence">Presença</option>
                <option value="absence">Falta</option>
                <option value="ignore">Não entra no percentual</option>
              </select>
            </Field>
            <Field label="Atraso conta como">
              <select name="late" defaultValue={school.lateRule} className={controlClass}>
                <option value="presence">Presença</option>
                <option value="absence">Falta</option>
                <option value="ignore">Não entra no percentual</option>
              </select>
            </Field>
            <Field label="Frequência mínima (%)"><input name="freq" defaultValue={school.frequencyMinPercent} className={controlClass} /></Field>
            <label className="flex min-h-11 items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" name="absence" defaultChecked={school.absenceCountsAsZero} />
              Ausência na avaliação entra como zero. Desligado, ela fica de fora da média.
            </label>
            <div><Button type="submit">Salvar critérios</Button></div>
          </form>
        ) : (
          <p className="mt-3 text-sm text-muted">A coordenação define a escala, a média e a recuperação. Você usa essas regras nos lançamentos.</p>
        )}
      </section>

      {canSettings ? (
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="text-xl">Ano letivo e períodos</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {workspace.years.map((year) => (
              <li key={year.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
                <span>{year.label}{year.active ? " · ativo" : ""}</span>
                {!year.active ? (
                  <Button type="button" variant="soft" onClick={() => void run(() => activateYear({ data: { schoolId: school.id, yearId: year.id } }), "Ano ativado.")}>Ativar</Button>
                ) : null}
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const label = String(new FormData(event.currentTarget).get("label") ?? "");
              void run(() => saveYear({ data: { schoolId: school.id, label } }), "Ano criado.");
              event.currentTarget.reset();
            }}
          >
            <input name="label" placeholder="2027" className={`${controlClass} max-w-40`} aria-label="Novo ano letivo" />
            <Button type="submit" variant="soft">Criar ano</Button>
          </form>
          <div className="mt-4 flex flex-col gap-2">
            {periods.map((period) => (
              <form
                key={period.id}
                className="flex flex-wrap gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const name = String(new FormData(event.currentTarget).get("name") ?? "");
                  void run(() => renamePeriod({ data: { schoolId: school.id, periodId: period.id, name } }), "Período renomeado.");
                }}
              >
                <input name="name" defaultValue={period.name} className={`${controlClass} max-w-xs`} aria-label={`Nome de ${period.name}`} />
                <Button type="submit" variant="ghost">Renomear</Button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Disciplinas</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {workspace.subjects.map((subject) => (
            <li key={subject.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2">
              <span>{subject.name}{subject.code ? ` · ${subject.code}` : ""}{subject.teacherName ? ` · ${subject.teacherName}` : ""}</span>
              {isAdmin ? (
                <button type="button" className="h-11 text-danger" onClick={() => {
                  if (!window.confirm(`Excluir a disciplina ${subject.name}? Só é possível se não houver avaliações.`)) return;
                  void run(() => deleteSubject({ data: { schoolId: school.id, id: subject.id } }), "Disciplina excluída.");
                }}>Excluir</button>
              ) : null}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 grid gap-2 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void run(
              () => saveSubject({ data: { schoolId: school.id, id: null, name: String(form.get("name") ?? ""), code: String(form.get("code") ?? ""), teacherName: String(form.get("teacher") ?? "") } }),
              "Disciplina salva.",
            );
            event.currentTarget.reset();
          }}
        >
          <input name="name" required placeholder="Nome" className={controlClass} aria-label="Nome da disciplina" />
          <input name="code" placeholder="Código" className={controlClass} aria-label="Código" />
          <input name="teacher" placeholder="Professor" className={controlClass} aria-label="Professor da disciplina" />
          <Button type="submit">Adicionar</Button>
        </form>
      </section>

      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Cursos técnicos</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {workspace.courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between border-t border-line pt-2">
              <span>{course.name}</span>
              {canSettings ? (
                <button type="button" className="h-11 text-danger" onClick={() => {
                  if (!window.confirm(`Excluir o curso ${course.name}? As turmas ficam sem curso, o histórico de notas permanece.`)) return;
                  void run(() => deleteCourse({ data: { schoolId: school.id, id: course.id } }), "Curso excluído.");
                }}>Excluir</button>
              ) : null}
            </li>
          ))}
        </ul>
        {canSettings ? (
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const name = String(new FormData(event.currentTarget).get("name") ?? "");
              void run(() => saveCourse({ data: { schoolId: school.id, id: null, name } }), "Curso salvo.");
              event.currentTarget.reset();
            }}
          >
            <input name="name" placeholder="Novo curso" className={`${controlClass} max-w-sm`} aria-label="Novo curso" />
            <Button type="submit" variant="soft">Adicionar</Button>
          </form>
        ) : null}
      </section>

      {canSettings ? (
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="text-xl">Professores responsáveis</h2>
          <p className="text-sm text-muted">Lista de nomes para organizar as turmas. Não cria login.</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {workspace.staff.map((person) => (
              <li key={person.id} className="flex items-center justify-between border-t border-line pt-2">
                <span>{person.name} · {person.roleLabel}</span>
                <button type="button" className="h-11 text-danger" onClick={() => void run(() => deleteStaff({ data: { schoolId: school.id, id: person.id } }), "Professor removido da lista.")}>Remover</button>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void run(() => saveStaff({ data: { schoolId: school.id, id: null, name: String(form.get("name") ?? ""), roleLabel: String(form.get("role") ?? "Professor") } }), "Professor incluído.");
              event.currentTarget.reset();
            }}
          >
            <input name="name" placeholder="Nome" className={`${controlClass} max-w-sm`} aria-label="Nome do professor" />
            <input name="role" placeholder="Função" className={`${controlClass} max-w-48`} aria-label="Função" />
            <Button type="submit" variant="soft">Adicionar</Button>
          </form>
        </section>
      ) : null}

      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">Acesso de outras pessoas</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              const joined = await joinSchool({ data: { code } });
              setSchoolId(joined.schoolId);
              setCode("");
            }, "Você entrou na escola.");
          }}
        >
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código de convite" className={`${controlClass} max-w-xs uppercase`} aria-label="Código de convite" />
          <Button type="submit" variant="soft">Entrar em outra escola</Button>
        </form>
        {isAdmin && school.inviteCode ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span>Convite desta escola: <strong className="font-mono">{school.inviteCode}</strong></span>
            <Button type="button" variant="ghost" onClick={() => {
              if (!window.confirm("Gerar outro código? O atual deixa de funcionar.")) return;
              void run(() => regenerateInvite({ data: { schoolId: school.id } }), "Novo código gerado.");
            }}>Gerar outro</Button>
          </div>
        ) : null}
        {isAdmin ? (
          <ul className="mt-4 flex flex-col gap-3">
            {workspace.members.map((member) => (
              <li key={member.userId} className="grid gap-2 border-t border-line pt-3 md:grid-cols-[1fr_160px_auto]">
                <div>
                  <p className="font-medium">{member.displayName}</p>
                  <p className="text-sm text-muted">{member.email || "Sem e-mail"}</p>
                </div>
                <select
                  className={controlClass}
                  aria-label={`Papel de ${member.displayName}`}
                  value={member.role}
                  onChange={(event) => void run(() => updateMember({ data: { schoolId: school.id, memberId: member.userId, role: event.target.value as "admin" | "coordenacao" | "professor", subjectScope: member.subjectScope } }), "Papel atualizado.")}
                >
                  <option value="admin">Administração</option>
                  <option value="coordenacao">Coordenação</option>
                  <option value="professor">Professor</option>
                </select>
                <Button type="button" variant="danger" onClick={() => {
                  if (!window.confirm(`Remover o acesso de ${member.displayName}?`)) return;
                  void run(() => removeMember({ data: { schoolId: school.id, memberId: member.userId } }), "Acesso removido.");
                }}>Remover</Button>
                <fieldset className="md:col-span-3">
                  <legend className="text-xs text-muted">Disciplinas permitidas. Nenhuma marcada = todas.</legend>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {workspace.subjects.map((subject) => {
                      const checked = member.subjectScope?.includes(subject.id) ?? false;
                      return (
                        <label key={subject.id} className="flex h-11 items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const current = new Set(member.subjectScope ?? []);
                              if (event.target.checked) current.add(subject.id);
                              else current.delete(subject.id);
                              const subjectScope = [...current];
                              void run(
                                () => updateMember({ data: { schoolId: school.id, memberId: member.userId, role: member.role as "admin" | "coordenacao" | "professor", subjectScope: subjectScope.length ? subjectScope : null } }),
                                "Disciplinas do acesso atualizadas.",
                              );
                            }}
                          />
                          {subject.name}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {canSettings ? (
        <section className="rounded-card border border-line bg-card p-4">
          <h2 className="text-xl">Cópia dos dados</h2>
          <p className="mt-1 text-sm text-pretty text-muted">
            Este arquivo é uma exportação integral autorizada, feita quando você pede. Não há cópia automática rodando em segundo plano.
          </p>
          <Button
            type="button"
            className="mt-3"
            variant="soft"
            onClick={() => {
              void run(async () => {
                const dump = await exportBackup({ data: { schoolId: school.id } });
                downloadBlob(`copia-${school.name.slice(0, 24).replace(/\s+/g, "-")}.json`, new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" }));
              }, "Cópia baixada.");
            }}
          >
            Baixar cópia integral
          </Button>
          <h3 className="mt-5 text-lg">Registro de operações</h3>
          <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-auto text-sm">
            {audit.data?.map((item) => <li key={item.id}>{item.created_at.slice(0, 16).replace("T", " ")} · {item.summary}</li>)}
            {audit.data?.length === 0 ? <li className="text-muted">Nenhuma operação registrada.</li> : null}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function roleLabel(role: string) {
  if (role === "admin") return "administração";
  if (role === "coordenacao") return "coordenação";
  return "professor";
}
