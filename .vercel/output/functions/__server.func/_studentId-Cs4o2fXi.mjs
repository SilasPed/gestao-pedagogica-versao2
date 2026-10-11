import { o as __toESM } from "./_runtime.mjs";
import { i as fmtPercent, o as seriesLabel, r as fmtGrade } from "./_ssr/format-DUutiuuN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { C as useNavigate, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as controlClass, l as errText, n as Button, t as Badge } from "./_ssr/ui-ByRUqWcZ.mjs";
import { U as useSchool, a as buildExport, f as deleteStudent, v as getStudentProfile } from "./_ssr/school-context-MF74zmn4.mjs";
import { a as Line, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as LineChart, r as YAxis } from "./_libs/recharts+[...].mjs";
import { s as MARK_STATUSES } from "./_ssr/constants-DSm8IPDq.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$1 } from "./_ssr/router-DrbzW7rd.mjs";
import { a as saveReport } from "./_ssr/files-BTo9JlNV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_studentId-Cs4o2fXi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudentPage() {
	const { studentId } = Route$1.useParams();
	const { workspace, yearId } = useSchool();
	const navigate = useNavigate();
	const client = useQueryClient();
	const [confirmName, setConfirmName] = (0, import_react.useState)("");
	const profile = useQuery({
		queryKey: [
			"student",
			workspace?.school.id,
			studentId,
			yearId
		],
		enabled: Boolean(workspace && studentId),
		queryFn: () => getStudentProfile({ data: {
			schoolId: workspace.school.id,
			studentId,
			yearId
		} })
	});
	const data = profile.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/alunos",
				search: { q: "" },
				className: "text-sm text-pine",
				children: "Voltar aos alunos"
			}),
			profile.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Carregando perfil…"
			}) : null,
			profile.error instanceof Error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: profile.error.message
			}) : null,
			data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-3xl",
							children: data.student.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								data.student.enrollment ?? "Sem matrícula",
								" · ",
								seriesLabel(data.student.series),
								" · situação ",
								data.student.status
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: data.view.situation.tone,
								children: data.view.situation.label
							})
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						onClick: async () => {
							if (!workspace || !yearId) return;
							try {
								const report = await buildExport({ data: {
									schoolId: workspace.school.id,
									kind: "report_cards",
									includeNotes: true,
									columns: null,
									filter: {
										yearId,
										series: null,
										classId: data.student.classId,
										subjectId: null,
										periodId: null,
										studentId
									}
								} });
								const mine = {
									...report,
									bulletins: report.bulletins.filter((item) => item.studentId === studentId)
								};
								await saveReport("pdf", mine.bulletins.length ? mine : report);
							} catch (error) {
								toast.error(errText(error));
							}
						},
						children: "Boletim em PDF"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-card border border-line bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted uppercase",
									children: "Média no ano"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-serif text-3xl tabular-nums",
									children: fmtGrade(data.view.average)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"Mínima ",
										fmtGrade(data.view.passing),
										". Comparação só com a própria evolução."
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-card border border-line bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted uppercase",
									children: "Frequência"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-serif text-3xl tabular-nums",
									children: fmtPercent(data.view.frequency?.percent)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: data.view.frequency ? `${data.view.frequency.absences} faltas em ${data.view.frequency.considered} aulas registradas` : "Sem aulas registradas"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-card border border-line bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted uppercase",
								children: "Pendências"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-serif text-3xl tabular-nums",
								children: data.view.assessments.filter((item) => item.status === "pending").length
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl",
							children: "Evolução individual"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 h-56",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
									data: data.view.evolution,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "period",
											tick: {
												fill: "var(--muted)",
												fontSize: 12
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											domain: [0, workspace?.school.gradeScaleMax ?? 10],
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
											dataKey: "average",
											name: "Média",
											stroke: "var(--pine)",
											strokeWidth: 2,
											connectNulls: false
										})
									]
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-1 text-sm",
							children: data.view.comparisons.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
						})
					]
				}),
				data.view.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-auto rounded-card border border-line bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "px-4 pt-4 text-xl",
							children: subject.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-4 text-sm text-muted",
							children: ["Acumulada ", fmtGrade(subject.accumulated)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "mt-2 w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "text-left text-muted",
								children: [
									"Período",
									"Regular",
									"Recuperação",
									"Resultado",
									"Nota necessária"
								].map((head) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 font-medium",
									children: head
								}, head))
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: subject.periods.map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-line",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: period.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2 tabular-nums",
										children: fmtGrade(period.base)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2 tabular-nums",
										children: fmtGrade(period.recovery)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2 tabular-nums",
										children: fmtGrade(period.final)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2",
										children: period.needed.explanation
									})
								]
							}, period.id)) })]
						})
					]
				}, subject.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-auto rounded-card border border-line bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "px-4 pt-4 text-xl",
						children: "Lançamentos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "mt-2 w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "text-left text-muted",
							children: [
								"Disciplina",
								"Avaliação",
								"Período",
								"Nota",
								"Situação"
							].map((head) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-2",
								children: head
							}, head))
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.view.assessments.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2",
									children: item.subject
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-2",
									children: [item.name, item.isRecovery ? " · recuperação" : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2",
									children: item.period
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2 tabular-nums",
									children: item.status === "graded" ? fmtGrade(item.value) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2",
									children: MARK_STATUSES.find((status) => status.id === item.status)?.label
								})
							]
						}, item.id)) })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Histórico de turmas"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-2 text-sm",
						children: [data.history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-muted",
							children: "Sem movimentação registrada."
						}) : null, data.history.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							item.year,
							" · ",
							seriesLabel(item.series),
							" ",
							item.className,
							" · ",
							item.status,
							" · ",
							item.startedOn ?? "—",
							" até ",
							item.endedOn ?? "agora"
						] }, index))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Avaliação qualitativa"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 flex flex-col gap-3",
						children: [data.view.qualitative.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted",
							children: "Nenhum registro qualitativo."
						}) : null, data.view.qualitative.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-t border-line pt-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-semibold",
								children: [
									item.date,
									" · ",
									item.criterion,
									" · ",
									item.level
								]
							}), item.comment ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-pretty text-muted",
								children: item.comment
							}) : null]
						}, index))]
					})]
				}),
				data.student.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Observações pedagógicas"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-pretty",
						children: data.student.notes
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "rounded-card border border-line bg-card p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-semibold",
						children: "Como a média foi calculada"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 list-disc pl-5",
						children: data.view.rules.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: rule }, rule))
					})]
				}),
				workspace?.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-danger/40 bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl",
							children: "Excluir cadastro"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "A exclusão apaga o histórico deste estudante. Prefira arquivar. Digite o nome completo para confirmar."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: `${controlClass} max-w-sm`,
								value: confirmName,
								onChange: (event) => setConfirmName(event.target.value),
								"aria-label": "Confirmar nome para excluir"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "danger",
								onClick: async () => {
									if (!workspace) return;
									try {
										await deleteStudent({ data: {
											schoolId: workspace.school.id,
											id: studentId,
											confirmName
										} });
										await client.invalidateQueries({ queryKey: ["students"] });
										toast.success("Estudante excluído.");
										navigate({
											to: "/alunos",
											search: { q: "" }
										});
									} catch (error) {
										toast.error(errText(error));
									}
								},
								children: "Excluir definitivamente"
							})]
						})
					]
				}) : null
			] }) : null
		]
	});
}
//#endregion
export { StudentPage as component };
