import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, d as errText, n as Button, o as Notice, s as PageHeader, u as controlClass } from "./ui-FQ-oeRrS.mjs";
import { A as saveCourse, B as updateMember, E as renamePeriod, H as updateSettings, I as saveStaff, R as saveSubject, T as removeMember, U as useSchool, V as updateMyName, b as listAudit, c as deleteCourse, d as deleteStaff, m as exportBackup, n as activateYear, p as deleteSubject, w as regenerateInvite, y as joinSchool, z as saveYear } from "./school-context-BQIuyGAS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as downloadBlob } from "./files-BTo9JlNV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/configuracoes-DVdLhi5P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { workspace, yearId, refresh, setSchoolId } = useSchool();
	const client = useQueryClient();
	const [code, setCode] = (0, import_react.useState)("");
	const audit = useQuery({
		queryKey: ["audit", workspace?.school.id],
		enabled: Boolean(workspace && (workspace.role === "admin" || workspace.role === "coordenacao")),
		queryFn: () => listAudit({ data: { schoolId: workspace.school.id } })
	});
	if (!workspace) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: "Carregando…" });
	const canSettings = workspace.role === "admin" || workspace.role === "coordenacao";
	const isAdmin = workspace.role === "admin";
	const periods = workspace.periods.filter((period) => period.yearId === yearId);
	const school = workspace.school;
	async function run(work, ok) {
		try {
			await work();
			await refresh();
			await client.invalidateQueries({ queryKey: ["audit"] });
			toast.success(ok);
		} catch (error) {
			toast.error(errText(error));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-4xl flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Configurações",
				description: `Você está como ${roleLabel(workspace.role)} em ${school.name}. Cada professor só acessa as escolas em que foi autorizado.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-pine/30 bg-pine-soft p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-wide text-pine uppercase",
						children: "Contexto ativo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-lg font-semibold",
						children: school.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Ano letivo ",
							workspace.years.find((year) => year.id === yearId)?.label ?? "não selecionado",
							" · papel ",
							roleLabel(workspace.role)
						]
					})
				]
			}),
			workspace.memberships.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Escola ativa"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: `${controlClass} mt-3`,
					"aria-label": "Escola",
					value: school.id,
					onChange: (event) => setSchoolId(event.target.value),
					children: workspace.memberships.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item.schoolId,
						children: item.schoolName
					}, item.schoolId))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Seu nome nesta escola"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex flex-wrap gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						const name = String(new FormData(event.currentTarget).get("name") ?? "");
						run(() => updateMyName({ data: {
							schoolId: school.id,
							name
						} }), "Nome atualizado.");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "name",
						defaultValue: workspace.myName,
						className: `${controlClass} max-w-sm`,
						"aria-label": "Seu nome"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "soft",
						children: "Salvar nome"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Critérios de cálculo e frequência" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Estas regras alimentam médias, recuperação e frequência. Alterá-las muda o cálculo dali em diante, não o histórico já exportado."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 list-disc pl-5 text-sm text-muted",
						children: workspace.rules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: rule }, rule))
					}),
					canSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						onSubmit: (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							run(() => updateSettings({ data: {
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
								frequencyMinPercent: Number(String(form.get("freq") ?? "75").replace(",", "."))
							} }), "Configurações salvas.");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Nome da escola",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "name",
									defaultValue: school.name,
									className: controlClass,
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Escala máxima",
								hint: "0 até este valor. Aceita 10 ou 100.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "scale",
									defaultValue: school.gradeScaleMax,
									className: controlClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Média mínima",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "passing",
									defaultValue: school.passingAverage,
									className: controlClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Períodos",
								hint: "Só muda se ainda não houver avaliação ligada a um período.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									name: "periodModel",
									defaultValue: school.periodModel,
									className: controlClass,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "bimestre",
											children: "Bimestres"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "trimestre",
											children: "Trimestres"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "semestre",
											children: "Semestres"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Modo da média",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									name: "mode",
									defaultValue: school.calculationMode,
									className: controlClass,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "weighted",
										children: "Ponderada"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "simple",
										children: "Simples"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Recuperação",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									name: "recovery",
									defaultValue: school.recoveryPolicy,
									className: controlClass,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "replace_if_higher",
											children: "Substitui o período só se for maior"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "average_with_original",
											children: "Média com a nota original"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "keep_both",
											children: "Registra sem alterar o período"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Falta justificada conta como",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									name: "justified",
									defaultValue: school.justifiedRule,
									className: controlClass,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "presence",
											children: "Presença"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "absence",
											children: "Falta"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "ignore",
											children: "Não entra no percentual"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Atraso conta como",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									name: "late",
									defaultValue: school.lateRule,
									className: controlClass,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "presence",
											children: "Presença"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "absence",
											children: "Falta"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "ignore",
											children: "Não entra no percentual"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Frequência mínima (%)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "freq",
									defaultValue: school.frequencyMinPercent,
									className: controlClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-2 text-sm md:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									name: "absence",
									defaultChecked: school.absenceCountsAsZero
								}), "Ausência na avaliação entra como zero. Desligado, ela fica de fora da média."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Salvar critérios"
							}) })
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "A coordenação define a escala, a média e a recuperação. Você usa essas regras nos lançamentos."
					})
				]
			}),
			canSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Ano letivo e períodos" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "O ano ativo aparece no topo da aplicação. Renomear um período não altera notas já lançadas."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: workspace.years.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [year.label, year.active ? " · ativo" : ""] }), !year.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "soft",
								onClick: () => void run(() => activateYear({ data: {
									schoolId: school.id,
									yearId: year.id
								} }), "Ano ativado."),
								children: "Ativar"
							}) : null]
						}, year.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-wrap gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							const label = String(new FormData(event.currentTarget).get("label") ?? "");
							run(() => saveYear({ data: {
								schoolId: school.id,
								label
							} }), "Ano criado.");
							event.currentTarget.reset();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "label",
							placeholder: "2027",
							className: `${controlClass} max-w-40`,
							"aria-label": "Novo ano letivo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "soft",
							children: "Criar ano"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-col gap-2",
						children: periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex flex-wrap gap-2",
							onSubmit: (event) => {
								event.preventDefault();
								const name = String(new FormData(event.currentTarget).get("name") ?? "");
								run(() => renamePeriod({ data: {
									schoolId: school.id,
									periodId: period.id,
									name
								} }), "Período renomeado.");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								defaultValue: period.name,
								className: `${controlClass} max-w-xs`,
								"aria-label": `Nome de ${period.name}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "ghost",
								children: "Renomear"
							})]
						}, period.id))
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Disciplinas" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Excluir só é possível quando não há avaliações vinculadas."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: workspace.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								subject.name,
								subject.code ? ` · ${subject.code}` : "",
								subject.teacherName ? ` · ${subject.teacherName}` : ""
							] }), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 text-danger",
								onClick: () => {
									if (!window.confirm(`Excluir a disciplina ${subject.name}? Só é possível se não houver avaliações.`)) return;
									run(() => deleteSubject({ data: {
										schoolId: school.id,
										id: subject.id
									} }), "Disciplina excluída.");
								},
								children: "Excluir"
							}) : null]
						}, subject.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 grid gap-2 md:grid-cols-4",
						onSubmit: (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							run(() => saveSubject({ data: {
								schoolId: school.id,
								id: null,
								name: String(form.get("name") ?? ""),
								code: String(form.get("code") ?? ""),
								teacherName: String(form.get("teacher") ?? "")
							} }), "Disciplina salva.");
							event.currentTarget.reset();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								required: true,
								placeholder: "Nome",
								className: controlClass,
								"aria-label": "Nome da disciplina"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "code",
								placeholder: "Código",
								className: controlClass,
								"aria-label": "Código"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "teacher",
								placeholder: "Professor",
								className: controlClass,
								"aria-label": "Professor da disciplina"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Adicionar"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Cursos técnicos" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Excluir um curso deixa as turmas sem curso. O histórico de notas permanece."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: workspace.courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between border-t border-line pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: course.name }), canSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 text-danger",
								onClick: () => {
									if (!window.confirm(`Excluir o curso ${course.name}? As turmas ficam sem curso, o histórico de notas permanece.`)) return;
									run(() => deleteCourse({ data: {
										schoolId: school.id,
										id: course.id
									} }), "Curso excluído.");
								},
								children: "Excluir"
							}) : null]
						}, course.id))
					}),
					canSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-wrap gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							const name = String(new FormData(event.currentTarget).get("name") ?? "");
							run(() => saveCourse({ data: {
								schoolId: school.id,
								id: null,
								name
							} }), "Curso salvo.");
							event.currentTarget.reset();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "name",
							placeholder: "Novo curso",
							className: `${controlClass} max-w-sm`,
							"aria-label": "Novo curso"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "soft",
							children: "Adicionar"
						})]
					}) : null
				]
			}),
			canSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Equipe" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Lista de nomes para organizar as turmas. Não cria login."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: workspace.staff.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between border-t border-line pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								person.name,
								" · ",
								person.roleLabel
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 text-danger",
								onClick: () => void run(() => deleteStaff({ data: {
									schoolId: school.id,
									id: person.id
								} }), "Professor removido da lista."),
								children: "Remover"
							})]
						}, person.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-wrap gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							run(() => saveStaff({ data: {
								schoolId: school.id,
								id: null,
								name: String(form.get("name") ?? ""),
								roleLabel: String(form.get("role") ?? "Professor")
							} }), "Professor incluído.");
							event.currentTarget.reset();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								placeholder: "Nome",
								className: `${controlClass} max-w-sm`,
								"aria-label": "Nome do professor"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "role",
								placeholder: "Função",
								className: `${controlClass} max-w-48`,
								"aria-label": "Função"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "soft",
								children: "Adicionar"
							})
						]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Acesso de outras pessoas" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Convite, papéis e disciplinas permitidas. Remover acesso é uma ação administrativa e pede confirmação."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 flex flex-wrap gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							run(async () => {
								const joined = await joinSchool({ data: { code } });
								setSchoolId(joined.schoolId);
								setCode("");
							}, "Você entrou na escola.");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: code,
							onChange: (event) => setCode(event.target.value),
							placeholder: "Código de convite",
							className: `${controlClass} max-w-xs uppercase`,
							"aria-label": "Código de convite"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "soft",
							children: "Entrar em outra escola"
						})]
					}),
					isAdmin && school.inviteCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Convite desta escola: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "font-mono",
							children: school.inviteCode
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => {
								if (!window.confirm("Gerar outro código? O atual deixa de funcionar.")) return;
								run(() => regenerateInvite({ data: { schoolId: school.id } }), "Novo código gerado.");
							},
							children: "Gerar outro"
						})]
					}) : null,
					isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-3",
						children: workspace.members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "grid gap-2 border-t border-line pt-3 md:grid-cols-[1fr_160px_auto]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: member.displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: member.email || "Sem e-mail"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: controlClass,
									"aria-label": `Papel de ${member.displayName}`,
									value: member.role,
									onChange: (event) => void run(() => updateMember({ data: {
										schoolId: school.id,
										memberId: member.userId,
										role: event.target.value,
										subjectScope: member.subjectScope
									} }), "Papel atualizado."),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "admin",
											children: "Administração"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "coordenacao",
											children: "Coordenação"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "professor",
											children: "Professor"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "danger",
									onClick: () => {
										if (!window.confirm(`Remover o acesso de ${member.displayName}?`)) return;
										run(() => removeMember({ data: {
											schoolId: school.id,
											memberId: member.userId
										} }), "Acesso removido.");
									},
									children: "Remover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "md:col-span-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
										className: "text-xs text-muted",
										children: "Disciplinas permitidas. Nenhuma marcada = todas."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 flex flex-wrap gap-3",
										children: workspace.subjects.map((subject) => {
											const checked = member.subjectScope?.includes(subject.id) ?? false;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex h-11 items-center gap-2 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked,
													onChange: (event) => {
														const current = new Set(member.subjectScope ?? []);
														if (event.target.checked) current.add(subject.id);
														else current.delete(subject.id);
														const subjectScope = [...current];
														run(() => updateMember({ data: {
															schoolId: school.id,
															memberId: member.userId,
															role: member.role,
															subjectScope: subjectScope.length ? subjectScope : null
														} }), "Disciplinas do acesso atualizadas.");
													}
												}), subject.name]
											}, subject.id);
										})
									})]
								})
							]
						}, member.userId))
					}) : null
				]
			}),
			canSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Cópia e auditoria" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-pretty text-muted",
						children: "A cópia integral só é gerada quando você pede. O registro abaixo lista operações já confirmadas pelo sistema."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						className: "mt-3",
						variant: "soft",
						onClick: () => {
							run(async () => {
								const dump = await exportBackup({ data: { schoolId: school.id } });
								downloadBlob(`copia-${school.name.slice(0, 24).replace(/\s+/g, "-")}.json`, new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" }));
							}, "Cópia baixada.");
						},
						children: "Baixar cópia integral"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-5 text-lg",
						children: "Registro de operações"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-2 flex max-h-64 flex-col gap-1 overflow-auto text-sm",
						children: [audit.data?.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							item.created_at.slice(0, 16).replace("T", " "),
							" · ",
							item.summary
						] }, item.id)), audit.data?.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted",
							children: "Nenhuma operação registrada."
						}) : null]
					})
				]
			}) : null
		]
	});
}
function roleLabel(role) {
	if (role === "admin") return "administração";
	if (role === "coordenacao") return "coordenação";
	return "professor";
}
//#endregion
export { SettingsPage as component };
