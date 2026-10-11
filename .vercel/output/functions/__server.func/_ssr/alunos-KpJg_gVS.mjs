import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Field, d as errText, i as Empty, n as Button, o as Notice, r as Dialog, s as PageHeader, t as Badge, u as controlClass } from "./ui-FQ-oeRrS.mjs";
import { L as saveStudent, S as listStudents, U as useSchool, i as archiveStudent } from "./school-context-BQIuyGAS.mjs";
import { o as seriesLabel } from "./format-DUutiuuN.mjs";
import { c as STUDENT_STATUSES } from "./constants-DSm8IPDq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$2 } from "./router-DaXABTwf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/alunos-KpJg_gVS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StudentsPage() {
	const { q } = Route$2.useSearch();
	const { workspace, yearId } = useSchool();
	const client = useQueryClient();
	const [query, setQuery] = (0, import_react.useState)(q);
	const [classId, setClassId] = (0, import_react.useState)("");
	const [series, setSeries] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("");
	const [archived, setArchived] = (0, import_react.useState)(false);
	const [page, setPage] = (0, import_react.useState)(1);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [confirmDuplicate, setConfirmDuplicate] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setQuery(q), [q]);
	(0, import_react.useEffect)(() => setPage(1), [
		query,
		classId,
		series,
		status,
		archived,
		yearId
	]);
	const list = useQuery({
		queryKey: [
			"students",
			workspace?.school.id,
			yearId,
			query,
			classId,
			series,
			status,
			archived,
			page
		],
		enabled: Boolean(workspace),
		queryFn: () => listStudents({ data: {
			schoolId: workspace.school.id,
			yearId,
			query,
			classId: classId || null,
			series: series || null,
			status: status || null,
			archived,
			page,
			pageSize: 25
		} })
	});
	const save = useMutation({
		mutationFn: saveStudent,
		onSuccess: async () => {
			toast.success("Estudante salvo.");
			setOpen(false);
			setConfirmDuplicate(false);
			await client.invalidateQueries({ queryKey: ["students"] });
			await client.invalidateQueries({ queryKey: ["workspace"] });
		},
		onError: (error) => {
			const message = errText(error);
			if (message.includes("duplicidade")) setConfirmDuplicate(true);
			toast.error(message);
		}
	});
	const classes = (workspace?.classes ?? []).filter((klass) => !klass.archived && klass.yearId === yearId);
	const current = list.data?.rows.find((row) => row.id === editing);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Alunos",
				description: "Busca por nome ou matrícula. Arquivar não apaga o histórico de notas.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => {
						setEditing(null);
						setConfirmDuplicate(false);
						setOpen(true);
					},
					children: "Novo estudante"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-card border border-line bg-card p-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: controlClass,
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Nome ou matrícula",
						"aria-label": "Buscar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: controlClass,
						value: series,
						onChange: (event) => setSeries(event.target.value),
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
						value: status,
						onChange: (event) => setStatus(event.target.value),
						"aria-label": "Situação",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as situações"
						}), STUDENT_STATUSES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.label
						}, item.id))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-11 items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: archived,
					onChange: (event) => setArchived(event.target.checked)
				}), "Mostrar arquivados"]
			}),
			list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, { children: "Buscando estudantes…" }) : null,
			list.error instanceof Error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "error",
				children: list.error.message
			}) : null,
			list.data && list.data.total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: query || classId || series || status || archived ? "Nenhum resultado para esta busca" : "Nenhum estudante cadastrado",
				text: query || classId || series || status || archived ? "Nada corresponde aos filtros. Limpe a busca ou escolha outra turma. O cadastro real não foi alterado." : "Cadastre alguém ou importe uma planilha. A lista não traz nomes de demonstração."
			}) : null,
			list.data && list.data.total > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-auto rounded-card border border-line bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "data-table min-w-[720px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Nome",
						"Matrícula",
						"Série",
						"Turma",
						"Curso",
						"Situação",
						""
					].map((head) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: head
					}, head)) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: list.data.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "font-medium",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/alunos/$studentId",
								params: { studentId: row.id },
								className: "underline-offset-2 hover:underline",
								children: row.fullName
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "tabular-nums text-muted",
							children: row.enrollment ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: seriesLabel(row.series) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.className ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.courseName ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: row.archived ? "muted" : row.status === "ativo" ? "ok" : row.status === "transferido" ? "warn" : "muted",
							children: [STUDENT_STATUSES.find((item) => item.id === row.status)?.label ?? row.status, row.archived ? " · arquivado" : ""]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 px-2 text-sm font-semibold text-pine",
								onClick: () => {
									setEditing(row.id);
									setConfirmDuplicate(false);
									setOpen(true);
								},
								children: "Editar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 px-2 text-muted",
								onClick: async () => {
									if (!workspace) return;
									if (!window.confirm(row.archived ? "Reativar este estudante?" : "Arquivar este estudante? As notas permanecem.")) return;
									try {
										await archiveStudent({ data: {
											schoolId: workspace.school.id,
											id: row.id,
											archived: !row.archived
										} });
										await client.invalidateQueries({ queryKey: ["students"] });
									} catch (error) {
										toast.error(errText(error));
									}
								},
								children: row.archived ? "Reativar" : "Arquivar"
							})]
						})
					] }, row.id)) })]
				})
			}) : null,
			list.data && list.data.total > list.data.pageSize ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						disabled: page <= 1,
						onClick: () => setPage((value) => value - 1),
						children: "Anterior"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums",
						children: [
							"Página ",
							page,
							" de ",
							Math.ceil(list.data.total / list.data.pageSize)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						disabled: page * list.data.pageSize >= list.data.total,
						onClick: () => setPage((value) => value + 1),
						children: "Próxima"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				title: editing ? "Editar estudante" : "Novo estudante",
				onClose: () => setOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						if (!workspace || !yearId) return;
						const form = new FormData(event.currentTarget);
						save.mutate({ data: {
							schoolId: workspace.school.id,
							id: editing,
							fullName: String(form.get("fullName") ?? ""),
							enrollment: String(form.get("enrollment") ?? ""),
							yearId,
							classId: String(form.get("classId") ?? "") || null,
							courseId: String(form.get("courseId") ?? "") || null,
							series: String(form.get("series") ?? "") || null,
							status: String(form.get("status") ?? "ativo"),
							notes: String(form.get("notes") ?? ""),
							confirmDuplicate
						} });
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nome completo",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "fullName",
								required: true,
								defaultValue: current?.fullName ?? "",
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Matrícula",
							hint: "Opcional, mas é a chave mais segura na importação.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "enrollment",
								defaultValue: current?.enrollment ?? "",
								className: controlClass
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Série",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "series",
								defaultValue: current?.series ?? "1",
								className: controlClass,
								children: [
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
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Turma",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "classId",
								defaultValue: current?.classId ?? "",
								className: controlClass,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Sem turma"
								}), classes.map((klass) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: klass.id,
									children: [
										seriesLabel(klass.series),
										" ",
										klass.name
									]
								}, klass.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Curso técnico",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "courseId",
								defaultValue: current?.courseId ?? "",
								className: controlClass,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Herdar da turma ou deixar em branco"
								}), workspace?.courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: course.id,
									children: course.name
								}, course.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Situação",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								name: "status",
								defaultValue: current?.status ?? "ativo",
								className: controlClass,
								children: STUDENT_STATUSES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.id,
									children: item.label
								}, item.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Observações pedagógicas",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								name: "notes",
								defaultValue: current?.notes ?? "",
								className: "min-h-24 w-full rounded-lg border border-line bg-card p-3 text-sm"
							})
						}),
						confirmDuplicate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "rounded-lg border border-warn/30 bg-warn-bg px-3 py-2 text-sm text-warn",
							children: "Há um cadastro parecido. Envie de novo para confirmar que não é duplicidade acidental."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending,
							children: save.isPending ? "Salvando…" : confirmDuplicate ? "Confirmar e salvar" : "Salvar"
						})
					]
				})
			})
		]
	});
}
//#endregion
export { StudentsPage as component };
