import { o as __toESM } from "../_runtime.mjs";
import { s as todayBR } from "./format-DUutiuuN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, c as controlClass, l as errText, n as Button } from "./ui-ByRUqWcZ.mjs";
import { N as saveQual, S as listStudents, U as useSchool, j as saveCriterion, l as deleteQual, x as listQual } from "./school-context-MF74zmn4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qualitativa-Eu9z1WAW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function QualPage() {
	const { workspace, yearId, refresh } = useSchool();
	const client = useQueryClient();
	const [classId, setClassId] = (0, import_react.useState)("");
	const [criterionId, setCriterionId] = (0, import_react.useState)("");
	const [periodId, setPeriodId] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(todayBR());
	const students = useQuery({
		queryKey: [
			"qual-students",
			workspace?.school.id,
			classId,
			yearId
		],
		enabled: Boolean(workspace && classId),
		queryFn: () => listStudents({ data: {
			schoolId: workspace.school.id,
			classId,
			yearId,
			page: 1,
			pageSize: 200,
			archived: false
		} })
	});
	const history = useQuery({
		queryKey: [
			"qual",
			workspace?.school.id,
			classId,
			criterionId
		],
		enabled: Boolean(workspace),
		queryFn: () => listQual({ data: {
			schoolId: workspace.school.id,
			classId: classId || null,
			studentId: null,
			criterionId: criterionId || null
		} })
	});
	const criterion = workspace?.criteria.find((item) => item.id === criterionId);
	const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
	const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
	if (!workspace) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl",
				children: "Avaliação qualitativa"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-pretty text-muted",
				children: "Registre comportamentos observáveis. Estes níveis não viram nota numérica."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Critérios"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-col gap-2 text-sm",
						children: workspace.criteria.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-card bg-soft px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold",
									children: [item.name, item.active ? "" : " · inativo"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: item.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: item.scale.join(" · ") })
							]
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							try {
								await saveCriterion({ data: {
									schoolId: workspace.school.id,
									id: null,
									name: String(form.get("name") ?? ""),
									description: String(form.get("description") ?? ""),
									scale: String(form.get("scale") ?? "").split(",").map((item) => item.trim()).filter(Boolean)
								} });
								event.currentTarget.reset();
								await refresh();
								toast.success("Critério salvo.");
							} catch (error) {
								toast.error(errText(error));
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Novo critério",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "name",
									className: controlClass,
									required: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Níveis, separados por vírgula",
								hint: "Do mais desenvolvido ao que pede mais acompanhamento.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "scale",
									className: controlClass,
									placeholder: "Excelente, Bom, Em desenvolvimento, Necessita de acompanhamento"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Descrição observável",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "description",
									className: controlClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									children: "Adicionar critério"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Lançar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 md:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: controlClass,
								value: classId,
								onChange: (event) => setClassId(event.target.value),
								"aria-label": "Turma",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Turma"
								}), classes.map((klass) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: klass.id,
									children: [
										klass.series,
										"º ",
										klass.name
									]
								}, klass.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: controlClass,
								value: criterionId,
								onChange: (event) => setCriterionId(event.target.value),
								"aria-label": "Critério",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Critério"
								}), workspace.criteria.filter((item) => item.active).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: item.name
								}, item.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: controlClass,
								value: periodId,
								onChange: (event) => setPeriodId(event.target.value),
								"aria-label": "Período",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Período"
								}), periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: period.id,
									children: period.name
								}, period.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								className: controlClass,
								value: date,
								onChange: (event) => setDate(event.target.value),
								"aria-label": "Data"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-col gap-3",
						children: students.data?.rows.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "grid gap-2 border-t border-line pt-3 md:grid-cols-[1fr_180px_1fr_auto]",
							onSubmit: async (event) => {
								event.preventDefault();
								if (!criterionId) return toast.error("Escolha o critério.");
								const form = new FormData(event.currentTarget);
								try {
									await saveQual({ data: {
										schoolId: workspace.school.id,
										studentId: student.id,
										criterionId,
										periodId: periodId || null,
										date,
										level: String(form.get("level") ?? ""),
										comment: String(form.get("comment") ?? "")
									} });
									await client.invalidateQueries({ queryKey: ["qual"] });
									toast.success(`Registro de ${student.fullName} salvo.`);
								} catch (error) {
									toast.error(errText(error));
								}
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "self-center font-medium",
									children: student.fullName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									name: "level",
									className: controlClass,
									defaultValue: criterion?.scale[1] ?? criterion?.scale[0] ?? "",
									"aria-label": `Nível de ${student.fullName}`,
									children: (criterion?.scale ?? []).map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: level }, level))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "comment",
									className: controlClass,
									placeholder: "Comentário opcional, sem diagnóstico",
									"aria-label": `Comentário de ${student.fullName}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "soft",
									children: "Salvar"
								})
							]
						}, student.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Histórico"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 flex flex-col gap-2 text-sm",
					children: [history.data?.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "Nenhum registro neste filtro."
					}) : null, history.data?.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-start justify-between gap-2 border-t border-line pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								record.date,
								" · ",
								record.studentName,
								" · ",
								record.level
							]
						}), record.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-pretty text-muted",
							children: record.comment
						}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-11 text-danger",
							onClick: async () => {
								if (!window.confirm("Excluir este registro qualitativo?")) return;
								try {
									await deleteQual({ data: {
										schoolId: workspace.school.id,
										id: record.id
									} });
									await client.invalidateQueries({ queryKey: ["qual"] });
								} catch (error) {
									toast.error(errText(error));
								}
							},
							children: "Excluir"
						})]
					}, record.id))]
				})]
			})
		]
	});
}
//#endregion
export { QualPage as component };
