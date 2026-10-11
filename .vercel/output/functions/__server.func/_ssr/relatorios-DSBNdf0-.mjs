import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { d as errText, n as Button, o as Notice, s as PageHeader, u as controlClass } from "./ui-FQ-oeRrS.mjs";
import { U as useSchool, a as buildExport, g as getDashboard } from "./school-context-BQIuyGAS.mjs";
import { o as seriesLabel } from "./format-DUutiuuN.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as saveReport } from "./files-BTo9JlNV.mjs";
import { t as EXPORT_COLUMNS } from "./reports-Ci5vaxxa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/relatorios-DSBNdf0-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	{
		id: "students",
		label: "Lista de alunos",
		question: "Quem está em cada turma?"
	},
	{
		id: "gradebook",
		label: "Diário de notas",
		question: "Qual foi o lançamento de cada avaliação?"
	},
	{
		id: "report_cards",
		label: "Boletins",
		question: "Como está cada estudante, sem comparar com os outros?"
	},
	{
		id: "period_results",
		label: "Resultados por período",
		question: "Qual foi o resultado de cada bimestre?"
	},
	{
		id: "below_average",
		label: "Abaixo da média",
		question: "Quem está abaixo da média configurada?"
	},
	{
		id: "recovery",
		label: "Recuperação",
		question: "Quem tem recuperação ou ainda precisa dela?"
	},
	{
		id: "qualitative",
		label: "Avaliação qualitativa",
		question: "Quais critérios pedem mais acompanhamento?"
	},
	{
		id: "frequency",
		label: "Frequência",
		question: "Como estão as presenças registradas?"
	},
	{
		id: "class_overview",
		label: "Visão da turma",
		question: "Qual turma evoluiu mais neste recorte?"
	},
	{
		id: "annual_history",
		label: "Histórico anual",
		question: "Qual é o histórico do ano por estudante?"
	}
];
var GROUPS = [
	{
		title: "Cadastro",
		ids: ["students"]
	},
	{
		title: "Notas e resultados",
		ids: [
			"gradebook",
			"report_cards",
			"period_results",
			"below_average",
			"recovery",
			"annual_history"
		]
	},
	{
		title: "Acompanhamento",
		ids: [
			"qualitative",
			"frequency",
			"class_overview"
		]
	}
];
function ReportsPage() {
	const { workspace, yearId } = useSchool();
	const [classId, setClassId] = (0, import_react.useState)("");
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [periodId, setPeriodId] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("below_average");
	const [includeNotes, setIncludeNotes] = (0, import_react.useState)(false);
	const [columns, setColumns] = (0, import_react.useState)(EXPORT_COLUMNS.below_average);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
	const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
	const dash = useQuery({
		queryKey: [
			"report-dash",
			workspace?.school.id,
			yearId,
			classId,
			subjectId,
			periodId
		],
		enabled: Boolean(workspace && yearId),
		queryFn: () => getDashboard({ data: {
			schoolId: workspace.school.id,
			filter: {
				yearId,
				series: null,
				classId: classId || null,
				subjectId: subjectId || null,
				periodId: periodId || null,
				studentId: null
			}
		} })
	});
	async function download(format) {
		if (!workspace || !yearId) return;
		setBusy(format);
		try {
			const report = await buildExport({ data: {
				schoolId: workspace.school.id,
				kind,
				includeNotes,
				columns,
				filter: {
					yearId,
					series: null,
					classId: classId || null,
					subjectId: subjectId || null,
					periodId: periodId || null,
					studentId: null
				}
			} });
			await saveReport(format, report);
			toast.success("Arquivo gerado.");
		} catch (error) {
			toast.error(errText(error));
		} finally {
			setBusy(null);
		}
	}
	if (!workspace) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Relatórios",
				description: "O arquivo usa o filtro atual. Observações qualitativas só entram se você marcar a opção. Nenhum tipo de relatório foi removido."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-card border border-line bg-card p-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: classId,
						onChange: (event) => setClassId(event.target.value),
						"aria-label": "Turma",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as turmas"
						}), classes.map((klass) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: klass.id,
							children: [
								seriesLabel(klass.series),
								" ",
								klass.name
							]
						}, klass.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: subjectId,
						onChange: (event) => setSubjectId(event.target.value),
						"aria-label": "Disciplina",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as disciplinas"
						}), workspace.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: subject.id,
							children: subject.name
						}, subject.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: periodId,
						onChange: (event) => setPeriodId(event.target.value),
						"aria-label": "Período",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Ano todo"
						}), periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: period.id,
							children: period.name
						}, period.id))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-4",
				children: GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-sm font-semibold tracking-wide text-muted uppercase",
					children: group.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: KINDS.filter((item) => group.ids.includes(item.id)).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setKind(item.id);
							setColumns(EXPORT_COLUMNS[item.id]);
						},
						className: `rounded-card border p-4 text-left ${kind === item.id ? "border-pine bg-pine-soft" : "border-line bg-card"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: item.question
						})]
					}, item.id))
				})] }, group.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "px-1 text-sm font-semibold",
						children: "Colunas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-3",
						children: EXPORT_COLUMNS[kind].map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: columns.includes(column),
								onChange: (event) => setColumns((current) => event.target.checked ? [...current, column] : current.filter((item) => item !== column))
							}), column]
						}, column))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-2 flex h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: includeNotes,
							onChange: (event) => setIncludeNotes(event.target.checked)
						}), "Incluir observações e comentários pedagógicos"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Resumo antes de exportar" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 flex flex-col gap-1 text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Relatório: ", KINDS.find((item) => item.id === kind)?.label] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Turma: ", classes.find((klass) => klass.id === classId) ? `${seriesLabel(classes.find((klass) => klass.id === classId).series)} ${classes.find((klass) => klass.id === classId).name}` : "Todas"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Disciplina: ", workspace.subjects.find((subject) => subject.id === subjectId)?.name ?? "Todas"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Período: ", periods.find((period) => period.id === periodId)?.name ?? "Ano todo"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Colunas: ", columns.join(", ") || "nenhuma"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Observações: ", includeNotes ? "incluídas" : "fora do arquivo"] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						disabled: Boolean(busy),
						onClick: () => download("xlsx"),
						children: busy === "xlsx" ? "Gerando Excel…" : "Excel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						disabled: Boolean(busy),
						onClick: () => download("csv"),
						children: busy === "csv" ? "Gerando CSV…" : "CSV"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						disabled: Boolean(busy),
						onClick: () => download("pdf"),
						children: busy === "pdf" ? "Gerando PDF…" : "PDF"
					})
				]
			}),
			busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, { children: [
				"Gerando o arquivo ",
				busy.toUpperCase(),
				". A exportação só conclui quando o download é disparado."
			] }) : null,
			dash.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Leitura deste recorte"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 list-disc pl-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							dash.data.belowCount,
							" estudantes com média abaixo da mínima, entre ",
							dash.data.gradedStudents,
							" que já têm nota."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							dash.data.improved.length,
							" variações de melhora e ",
							dash.data.declined.length,
							" de queda entre períodos com pelo menos meio décimo da escala."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [dash.data.consistentDrops.length, " com queda em períodos seguidos."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [dash.data.pendingStudents, " com avaliação pendente."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: dash.data.qualitativeHotspots.map((item) => `${item.name}: ${item.students}`).join(" · ") || "Nenhum critério no último nível da escala." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: dash.data.bestEvolution?.text ?? "Ainda não há dois períodos com média para comparar turmas." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Menor média de avaliação: ",
							dash.data.lowestAssessments[0] ? `${dash.data.lowestAssessments[0].name} (${dash.data.lowestAssessments[0].className})` : "sem notas lançadas",
							"."
						] })
					]
				})]
			}) : null
		]
	});
}
//#endregion
export { ReportsPage as component };
