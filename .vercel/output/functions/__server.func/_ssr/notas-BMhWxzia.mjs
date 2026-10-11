import { o as __toESM } from "../_runtime.mjs";
import { o as seriesLabel, r as fmtGrade } from "./format-DUutiuuN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, c as controlClass, i as Empty, l as errText, n as Button, r as Dialog, t as Badge } from "./ui-ByRUqWcZ.mjs";
import { D as saveAssessment, P as saveScores, U as useSchool, _ as getGradebook, s as deleteAssessment } from "./school-context-MF74zmn4.mjs";
import { t as ASSESSMENT_KINDS } from "./constants-DSm8IPDq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as summarizeItems, i as neededGrade, t as academicSituation } from "./calc-DZI8ZCH7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notas-BMhWxzia.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GradesPage() {
	const { workspace, yearId } = useSchool();
	const client = useQueryClient();
	const [classId, setClassId] = (0, import_react.useState)("");
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [periodId, setPeriodId] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [drafts, setDrafts] = (0, import_react.useState)({});
	const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
	const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
	const book = useQuery({
		queryKey: [
			"gradebook",
			workspace?.school.id,
			classId,
			subjectId,
			periodId
		],
		enabled: Boolean(workspace && classId && subjectId),
		queryFn: () => getGradebook({ data: {
			schoolId: workspace.school.id,
			classId,
			subjectId,
			periodId: periodId || null
		} })
	});
	(0, import_react.useEffect)(() => {
		setDrafts({});
	}, [book.dataUpdatedAt]);
	const save = useMutation({
		mutationFn: saveScores,
		onError: (error) => toast.error(errText(error))
	});
	const rows = (0, import_react.useMemo)(() => {
		if (!book.data) return [];
		return book.data.students.map((student) => {
			const items = book.data.assessments.map((assessment) => {
				const key = `${assessment.id}:${student.id}`;
				const stored = book.data.scores.find((score) => score.assessmentId === assessment.id && score.studentId === student.id);
				const draft = drafts[key];
				const status = draft?.status ?? (stored?.status || "pending");
				const parsed = draft ? Number(draft.text.replace(",", ".")) : stored?.value;
				const value = status === "graded" && parsed != null && !Number.isNaN(parsed) ? parsed : null;
				return {
					assessmentId: assessment.id,
					name: assessment.name,
					periodId: assessment.periodId,
					subjectId,
					classId,
					weight: assessment.weight,
					maxScore: assessment.maxScore,
					isRecovery: assessment.isRecovery,
					value,
					status: status === "graded" && value == null ? "pending" : status
				};
			});
			const summary = summarizeItems(items, book.data.periods, book.data.policy);
			const focus = periodId || book.data.periods[0]?.id || "";
			return {
				student,
				items,
				summary,
				needed: focus ? neededGrade(items, focus, book.data.policy) : null,
				situation: academicSituation({
					average: summary.average,
					pending: summary.pending,
					passing: book.data.passing,
					closed: summary.closed,
					frequencyPercent: null,
					frequencyMin: 75
				})
			};
		});
	}, [
		book.data,
		drafts,
		subjectId,
		classId,
		periodId
	]);
	async function commit(key, assessmentId, studentId, draft) {
		if (!workspace) return;
		const value = draft.status === "graded" ? Number(draft.text.replace(",", ".")) : null;
		if (draft.status === "graded" && (draft.text.trim() === "" || Number.isNaN(value))) {
			toast.error("Informe a nota ou mude a situação. Vazio não vira zero.");
			return;
		}
		try {
			await save.mutateAsync({ data: {
				schoolId: workspace.school.id,
				items: [{
					assessmentId,
					studentId,
					value: draft.status === "graded" ? value : null,
					status: draft.status
				}]
			} });
			await client.invalidateQueries({ queryKey: ["gradebook"] });
		} catch (error) {
			toast.error(errText(error));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl",
					children: "Diário de notas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Edição direta na tabela. A média aparece ao lado e segue a regra das configurações."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: !classId || !subjectId,
					onClick: () => setOpen(true),
					children: "Nova avaliação"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: classId,
						onChange: (event) => setClassId(event.target.value),
						"aria-label": "Turma",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Escolha a turma"
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
							children: "Escolha a disciplina"
						}), workspace?.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
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
							children: "Todos os períodos"
						}), periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: period.id,
							children: period.name
						}, period.id))]
					})
				]
			}),
			!classId || !subjectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "Escolha turma e disciplina",
				text: "O diário abre só com dados dessa combinação."
			}) : null,
			book.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Carregando diário…"
			}) : null,
			book.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "rounded-card border border-line bg-card p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-semibold",
						children: "Critério de cálculo desta turma"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 list-disc pl-5",
						children: book.data.rules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: rule }, rule))
					})]
				}),
				book.data.students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "Turma sem estudantes ativos",
					text: "Cadastre os alunos nessa turma antes de lançar notas."
				}) : null,
				book.data.students.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-h-[70vh] overflow-auto rounded-card border border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "sheet min-w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "min-w-48 px-3 py-2 text-left",
								children: "Estudante"
							}),
							book.data.assessments.map((assessment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
								className: "min-w-40 px-2 py-2 text-left font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block",
										children: assessment.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block text-xs font-normal text-muted",
										children: [
											assessment.periodName,
											" · peso ",
											assessment.weight,
											" · máx. ",
											assessment.maxScore
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "text-xs text-danger",
										onClick: async () => {
											if (!workspace || !window.confirm(`Excluir ${assessment.name}? As notas desta coluna saem juntas. As outras avaliações ficam.`)) return;
											try {
												await deleteAssessment({ data: {
													schoolId: workspace.school.id,
													id: assessment.id
												} });
												await client.invalidateQueries({ queryKey: ["gradebook"] });
											} catch (error) {
												toast.error(errText(error));
											}
										},
										children: "Excluir"
									})
								]
							}, assessment.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-left",
								children: "Resultado"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 align-top",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: row.student.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: row.student.enrollment ?? "Sem matrícula"
									})]
								}),
								book.data.assessments.map((assessment, index) => {
									const key = `${assessment.id}:${row.student.id}`;
									const item = row.items[index];
									const draft = drafts[key] ?? {
										text: item.status === "graded" && item.value != null ? String(item.value).replace(".", ",") : "",
										status: item.status
									};
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-2 py-2 align-top",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											"aria-label": `Nota de ${row.student.name} em ${assessment.name}`,
											className: "h-11 w-full rounded-card border border-line bg-card px-2 text-center tabular-nums",
											value: draft.text,
											disabled: draft.status !== "graded" && draft.status !== "pending",
											onChange: (event) => setDrafts((current) => ({
												...current,
												[key]: {
													text: event.target.value,
													status: "graded"
												}
											})),
											onBlur: () => {
												const next = drafts[key];
												if (next) commit(key, assessment.id, row.student.id, next);
											},
											onKeyDown: (event) => {
												if (event.key === "Enter") event.currentTarget.blur();
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											"aria-label": `Situação de ${row.student.name} em ${assessment.name}`,
											className: "mt-1 h-10 w-full rounded-card border border-line bg-card text-xs",
											value: draft.status,
											onChange: (event) => {
												const status = event.target.value;
												const next = {
													text: status === "graded" ? draft.text : "",
													status
												};
												setDrafts((current) => ({
													...current,
													[key]: next
												}));
												commit(key, assessment.id, row.student.id, next);
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "graded",
													children: "Nota"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "pending",
													children: "Pendente"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "absent",
													children: "Ausência"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "excused",
													children: "Dispensa"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "na",
													children: "Não aplicável"
												})
											]
										})]
									}, assessment.id);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 align-top",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold tabular-nums",
											children: fmtGrade(row.summary.average)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: row.situation.tone,
											children: row.situation.label
										}),
										row.needed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 max-w-56 text-xs text-pretty text-muted",
											children: row.needed.explanation
										}) : null
									]
								})
							]
						}, row.student.id)) })]
					})
				}) : null
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				title: "Nova avaliação",
				onClose: () => setOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3",
					onSubmit: async (event) => {
						event.preventDefault();
						if (!workspace) return;
						const form = new FormData(event.currentTarget);
						try {
							await saveAssessment({ data: {
								schoolId: workspace.school.id,
								classId,
								subjectId,
								name: String(form.get("name") ?? ""),
								kind: String(form.get("kind") ?? "prova"),
								date: String(form.get("date") ?? "") || null,
								periodId: String(form.get("periodId") ?? "") || null,
								maxScore: Number(String(form.get("maxScore") ?? workspace.school.gradeScaleMax).replace(",", ".")),
								weight: Number(String(form.get("weight") ?? "1").replace(",", ".")),
								notes: String(form.get("notes") ?? ""),
								isRecovery: form.get("recovery") === "on"
							} });
							setOpen(false);
							await client.invalidateQueries({ queryKey: ["gradebook"] });
							toast.success("Avaliação criada.");
						} catch (error) {
							toast.error(errText(error));
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nome",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								required: true,
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tipo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								name: "kind",
								className: controlClass,
								children: ASSESSMENT_KINDS.map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: kind.id,
									children: kind.label
								}, kind.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Período",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "periodId",
								className: controlClass,
								defaultValue: periodId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sem período"
								}), periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: period.id,
									children: period.name
								}, period.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Data",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "date",
								type: "date",
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nota máxima",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "maxScore",
								defaultValue: workspace?.school.gradeScaleMax ?? 10,
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Peso",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "weight",
								defaultValue: "1",
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								name: "recovery"
							}), " Esta coluna é recuperação e não apaga as notas originais"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Observação",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "notes",
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Criar avaliação"
						})
					]
				})
			})
		]
	});
}
//#endregion
export { GradesPage as component };
