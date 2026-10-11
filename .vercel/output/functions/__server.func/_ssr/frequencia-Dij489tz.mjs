import { o as __toESM } from "../_runtime.mjs";
import { i as fmtPercent, o as seriesLabel, s as todayBR } from "./format-DUutiuuN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { c as controlClass, l as errText, n as Button } from "./ui-ByRUqWcZ.mjs";
import { F as saveSession, M as saveMarks, U as useSchool, h as getAttendance, u as deleteSession } from "./school-context-MF74zmn4.mjs";
import { a as FREQ_MARKS } from "./constants-DSm8IPDq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as frequencyOf } from "./calc-DZI8ZCH7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/frequencia-Dij489tz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AttendancePage() {
	const { workspace, yearId } = useSchool();
	const client = useQueryClient();
	const [classId, setClassId] = (0, import_react.useState)("");
	const [sessionId, setSessionId] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)(todayBR());
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [label, setLabel] = (0, import_react.useState)("Aula");
	const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
	const board = useQuery({
		queryKey: [
			"attendance",
			workspace?.school.id,
			classId
		],
		enabled: Boolean(workspace && classId),
		queryFn: () => getAttendance({ data: {
			schoolId: workspace.school.id,
			classId
		} })
	});
	const session = board.data?.sessions.find((item) => item.id === sessionId) ?? board.data?.sessions[0];
	const policy = workspace ? {
		justifiedRule: workspace.school.justifiedRule,
		lateRule: workspace.school.lateRule,
		minimum: workspace.school.frequencyMinPercent
	} : null;
	if (!workspace) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl",
				children: "Frequência"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Aula sem registro não conta como falta. Pendente fica de fora do percentual."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: classId,
						onChange: (event) => {
							setClassId(event.target.value);
							setSessionId("");
						},
						"aria-label": "Turma",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Turma"
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
							children: "Disciplina opcional"
						}), workspace.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: subject.id,
							children: subject.name
						}, subject.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "date",
						className: controlClass,
						value: date,
						onChange: (event) => setDate(event.target.value),
						"aria-label": "Data"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: label,
						onChange: (event) => setLabel(event.target.value),
						"aria-label": "Nome da aula"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				disabled: !classId,
				onClick: async () => {
					try {
						const created = await saveSession({ data: {
							schoolId: workspace.school.id,
							classId,
							subjectId: subjectId || null,
							periodId: null,
							date,
							label
						} });
						setSessionId(created.id);
						await client.invalidateQueries({ queryKey: ["attendance"] });
						toast.success("Aula aberta com registros pendentes.");
					} catch (error) {
						toast.error(errText(error));
					}
				},
				children: "Abrir aula"
			}),
			board.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[240px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: board.data.sessions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "h-11 w-full rounded-card border border-line bg-card px-3 text-left text-sm",
						onClick: () => setSessionId(item.id),
						children: [
							item.date,
							" · ",
							item.label || "Aula"
						]
					}) }, item.id))
				}), session && policy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl",
							children: [
								session.date,
								" · ",
								session.label || "Aula"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "soft",
								onClick: async () => {
									if (!window.confirm("Marcar todos os estudantes desta aula como presentes?")) return;
									try {
										await saveMarks({ data: {
											schoolId: workspace.school.id,
											items: board.data.students.map((student) => ({
												sessionId: session.id,
												studentId: student.id,
												status: "present"
											}))
										} });
										await client.invalidateQueries({ queryKey: ["attendance"] });
									} catch (error) {
										toast.error(errText(error));
									}
								},
								children: "Todos presentes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "danger",
								onClick: async () => {
									if (!window.confirm("Excluir esta aula e os registros dela?")) return;
									await deleteSession({ data: {
										schoolId: workspace.school.id,
										id: session.id
									} });
									setSessionId("");
									await client.invalidateQueries({ queryKey: ["attendance"] });
								},
								children: "Excluir aula"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-col gap-2",
						children: board.data.students.map((student) => {
							const mark = board.data.marks.find((item) => item.sessionId === session.id && item.studentId === student.id)?.status ?? "pending";
							const personal = frequencyOf(board.data.marks.filter((item) => item.studentId === student.id).map((item) => item.status), policy);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "grid items-center gap-2 border-t border-line py-2 md:grid-cols-[1fr_180px_120px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: student.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: controlClass,
										value: mark,
										"aria-label": `Frequência de ${student.name}`,
										onChange: async (event) => {
											try {
												await saveMarks({ data: {
													schoolId: workspace.school.id,
													items: [{
														sessionId: session.id,
														studentId: student.id,
														status: event.target.value
													}]
												} });
												await client.invalidateQueries({ queryKey: ["attendance"] });
											} catch (error) {
												toast.error(errText(error));
											}
										},
										children: FREQ_MARKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: item.id,
											children: item.label
										}, item.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm tabular-nums text-muted",
										children: fmtPercent(personal.percent)
									})
								]
							}, student.id);
						})
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhuma aula registrada nesta turma."
				})]
			}) : null
		]
	});
}
//#endregion
export { AttendancePage as component };
