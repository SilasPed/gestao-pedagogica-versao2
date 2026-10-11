import { o as __toESM } from "./_runtime.mjs";
import { i as fmtPercent, r as fmtGrade } from "./_ssr/format-DUutiuuN.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { c as controlClass, i as Empty, o as Stat, t as Badge } from "./_ssr/ui-ByRUqWcZ.mjs";
import { S as listStudents, U as useSchool, g as getDashboard } from "./_ssr/school-context-MF74zmn4.mjs";
import { a as Line, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as LineChart, o as CartesianGrid, r as YAxis, s as Bar, t as BarChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_shell-CpIz80Ii.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const { workspace, yearId, loading, error } = useSchool();
	const [series, setSeries] = (0, import_react.useState)("");
	const [classId, setClassId] = (0, import_react.useState)("");
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [periodId, setPeriodId] = (0, import_react.useState)("");
	const [studentQuery, setStudentQuery] = (0, import_react.useState)("");
	const [studentId, setStudentId] = (0, import_react.useState)("");
	const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId && (!series || klass.series === series));
	const periods = (workspace?.periods ?? []).filter((period) => period.yearId === yearId);
	const dash = useQuery({
		queryKey: [
			"dashboard",
			workspace?.school.id,
			yearId,
			series,
			classId,
			subjectId,
			periodId,
			studentId
		],
		enabled: Boolean(workspace && yearId),
		queryFn: () => getDashboard({ data: {
			schoolId: workspace.school.id,
			filter: {
				yearId,
				series: series || null,
				classId: classId || null,
				subjectId: subjectId || null,
				periodId: periodId || null,
				studentId: studentId || null
			}
		} })
	});
	const matches = useQuery({
		queryKey: [
			"dash-find",
			workspace?.school.id,
			yearId,
			studentQuery
		],
		enabled: Boolean(workspace && studentQuery.trim().length >= 2 && !studentId),
		queryFn: () => listStudents({ data: {
			schoolId: workspace.school.id,
			yearId,
			query: studentQuery.trim(),
			page: 1,
			pageSize: 8,
			archived: false
		} })
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Carregando a escola…"
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: error
	});
	if (!workspace) return null;
	const data = dash.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl",
				children: "Painel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					workspace.school.name,
					" · ",
					workspace.counts.students,
					" estudantes · ",
					workspace.counts.classes,
					" turmas · ",
					workspace.counts.subjects,
					" disciplinas · ",
					workspace.counts.assessments,
					" avaliações. Célula vazia não entra como zero."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: series,
						onChange: (event) => {
							setSeries(event.target.value);
							setStudentId("");
						},
						"aria-label": "Série",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Todas as séries"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "1",
								children: "1º ano"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "2",
								children: "2º ano"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "3",
								children: "3º ano"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: classId,
						onChange: (event) => {
							setClassId(event.target.value);
							setStudentId("");
						},
						"aria-label": "Turma",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as turmas"
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative max-w-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: studentId ? studentQuery : studentQuery,
						placeholder: "Filtrar um estudante",
						"aria-label": "Estudante",
						onChange: (event) => {
							setStudentQuery(event.target.value);
							setStudentId("");
						}
					}),
					studentId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-1 text-sm text-pine",
						onClick: () => {
							setStudentId("");
							setStudentQuery("");
						},
						children: "Limpar estudante"
					}) : null,
					!studentId && matches.data && matches.data.rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "absolute z-10 mt-1 w-full overflow-hidden rounded-card border border-line bg-card shadow-lg",
						children: matches.data.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "h-11 w-full px-3 text-left text-sm hover:bg-soft",
							onClick: () => {
								setStudentId(row.id);
								setStudentQuery(row.fullName);
							},
							children: [row.fullName, row.className ? ` · ${row.className}` : ""]
						}) }, row.id))
					}) : null
				]
			}),
			dash.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Calculando indicadores…"
			}) : null,
			dash.error instanceof Error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: dash.error.message
			}) : null,
			data && data.studentCount === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "Ainda não há turma neste filtro",
				text: "Cadastre estudantes e lançamentos. O painel não mostra números de exemplo no lugar dos dados reais."
			}) : null,
			data && data.studentCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Estudantes no filtro",
							value: String(data.studentCount),
							hint: `${data.classCount} turmas · ${data.assessmentCount} avaliações`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Média geral",
							value: fmtGrade(data.generalAverage),
							hint: data.gradedStudents ? `${data.gradedStudents} com nota` : "Sem nota lançada"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Desempenho satisfatório",
							value: fmtPercent(data.satisfactoryPercent),
							hint: "Entre quem já tem média"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Abaixo da média",
							value: String(data.belowCount),
							hint: `${data.pendingStudents} com nota pendente`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Frequência média",
							value: fmtPercent(data.frequencyAverage),
							hint: data.frequencyAverage == null ? "Sem aulas registradas" : `${data.absenceCount} faltas contadas`
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-4 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
						title: "Evolução entre períodos",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 240,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: data.evolution,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--line)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										tick: {
											fill: "var(--muted)",
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										domain: [0, workspace.school.gradeScaleMax],
										tick: {
											fill: "var(--muted)",
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--card)",
										border: "1px solid var(--line)",
										color: "var(--ink)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "average",
										name: "Média",
										stroke: "var(--pine)",
										strokeWidth: 2,
										dot: { r: 3 },
										connectNulls: false
									})
								]
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
						title: "Distribuição das médias",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 240,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: data.distribution,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--line)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--muted)",
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										allowDecimals: false,
										tick: {
											fill: "var(--muted)",
											fontSize: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--card)",
										border: "1px solid var(--line)",
										color: "var(--ink)"
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "count",
										name: "Estudantes",
										fill: "var(--pine)",
										radius: 6
									})
								]
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-4 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleTable, {
						title: "Média por turma",
						columns: [
							"Turma",
							"Alunos",
							"Média",
							"Abaixo",
							"Pendências"
						],
						rows: data.byClass.map((row) => [
							row.name,
							row.students,
							fmtGrade(row.average),
							row.below,
							row.pending
						])
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleTable, {
						title: "Média por disciplina",
						columns: [
							"Disciplina",
							"Média",
							"Pendências"
						],
						rows: data.bySubject.map((row) => [
							row.name,
							fmtGrade(row.average),
							row.pending
						])
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl",
							children: "Acompanhamento pedagógico"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Cada nome aparece por uma regra objetiva. ",
								data.watchTotal,
								" estudantes no filtro.",
								data.bestEvolution ? ` Maior evolução de turma: ${data.bestEvolution.text}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 flex flex-col gap-3",
							children: [data.watchlist.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-muted",
								children: "Nenhum alerta com os filtros atuais."
							}) : null, data.watchlist.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-card bg-soft px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-semibold",
									children: [
										item.name,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-normal text-muted",
											children: ["· ", item.className]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 flex flex-col gap-1",
									children: item.reasons.map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-sm text-pretty",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: reason.code === "media" ? "bad" : "warn",
												children: reason.code
											}),
											" ",
											reason.text
										]
									}, reason.code + reason.text))
								})]
							}, item.studentId))]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimpleTable, {
					title: "Avaliações com menor média",
					columns: [
						"Avaliação",
						"Disciplina",
						"Turma",
						"Média na escala",
						"Notas lançadas"
					],
					rows: data.lowestAssessments.map((row) => [
						row.name,
						row.subject,
						row.className,
						fmtGrade(row.average),
						row.count
					])
				})
			] }) : null
		]
	});
}
function ChartCard({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-card border border-line bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-xl",
			children: title
		}), children]
	});
}
function SimpleTable({ title, columns, rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "overflow-auto rounded-card border border-line bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "px-4 pt-4 text-xl",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "mt-2 w-full text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "text-left text-muted",
				children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-4 py-2 font-medium",
					children: column
				}, column))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-4 py-3 text-muted",
				colSpan: columns.length,
				children: "Sem dados neste recorte."
			}) }) : rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-t border-line",
				children: row.map((cell, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-2 tabular-nums",
					children: cell
				}, cellIndex))
			}, index)) })]
		})]
	});
}
//#endregion
export { DashboardPage as component };
