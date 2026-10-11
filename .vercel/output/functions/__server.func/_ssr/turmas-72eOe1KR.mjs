import { o as __toESM } from "../_runtime.mjs";
import { o as seriesLabel } from "./format-DUutiuuN.mjs";
import { a as require_jsx_runtime, i as useQueryClient, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { a as Field, c as controlClass, i as Empty, l as errText, n as Button, r as Dialog } from "./ui-ByRUqWcZ.mjs";
import { A as saveCourse, O as saveClass, U as useSchool, k as saveClassSubjects, r as archiveClass } from "./school-context-MF74zmn4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/turmas-72eOe1KR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClassesPage() {
	const { workspace, yearId, refresh } = useSchool();
	const client = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [linksFor, setLinksFor] = (0, import_react.useState)(null);
	const [courseName, setCourseName] = (0, import_react.useState)("");
	const classes = (workspace?.classes ?? []).filter((klass) => klass.yearId === yearId);
	const save = useMutation({
		mutationFn: saveClass,
		onSuccess: async () => {
			toast.success("Turma salva.");
			setOpen(false);
			await refresh();
			await client.invalidateQueries();
		},
		onError: (error) => toast.error(errText(error))
	});
	if (!workspace) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Carregando…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl",
					children: "Turmas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Série, curso técnico e professores da turma. Arquivar não reescreve notas antigas."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					children: "Nova turma"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-wrap gap-2",
				onSubmit: async (event) => {
					event.preventDefault();
					try {
						await saveCourse({ data: {
							schoolId: workspace.school.id,
							id: null,
							name: courseName
						} });
						setCourseName("");
						await refresh();
						toast.success("Curso salvo.");
					} catch (error) {
						toast.error(errText(error));
					}
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: courseName,
					onChange: (event) => setCourseName(event.target.value),
					placeholder: "Novo curso técnico",
					className: `${controlClass} max-w-sm`,
					"aria-label": "Curso técnico"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "soft",
					children: "Adicionar curso"
				})]
			}),
			classes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "Nenhuma turma neste ano",
				text: "Crie a primeira turma para lançar notas."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: classes.map((klass) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-card border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-xl",
							children: [
								seriesLabel(klass.series),
								" ",
								klass.name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								workspace.courses.find((course) => course.id === klass.courseId)?.name ?? "Sem curso",
								" · ",
								klass.studentCount,
								" ativos",
								klass.teacherName ? ` · ${klass.teacherName}` : "",
								klass.archived ? " · arquivada" : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm",
							children: ["Disciplinas: ", workspace.classSubjects.filter((link) => link.classId === klass.id).map((link) => workspace.subjects.find((subject) => subject.id === link.subjectId)?.name).filter(Boolean).join(", ") || "nenhuma vinculada"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									onClick: () => {
										setEditing(klass.id);
										setOpen(true);
									},
									children: "Editar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "soft",
									onClick: () => setLinksFor(klass.id),
									children: "Disciplinas"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									onClick: async () => {
										if (!window.confirm(klass.archived ? "Reativar a turma?" : "Arquivar a turma? O histórico de notas permanece.")) return;
										try {
											await archiveClass({ data: {
												schoolId: workspace.school.id,
												id: klass.id,
												archived: !klass.archived
											} });
											await refresh();
										} catch (error) {
											toast.error(errText(error));
										}
									},
									children: klass.archived ? "Reativar" : "Arquivar"
								})
							]
						})
					]
				}, klass.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				title: editing ? "Editar turma" : "Nova turma",
				onClose: () => setOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						save.mutate({ data: {
							schoolId: workspace.school.id,
							id: editing,
							yearId,
							name: String(form.get("name") ?? ""),
							series: String(form.get("series") ?? "1"),
							courseId: String(form.get("courseId") ?? "") || null,
							teacherName: String(form.get("teacherName") ?? ""),
							passingAverage: String(form.get("passing") ?? "") || null
						} });
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nome",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "name",
								required: true,
								className: controlClass,
								placeholder: "A",
								defaultValue: classes.find((klass) => klass.id === editing)?.name ?? ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Série",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "series",
								className: controlClass,
								defaultValue: classes.find((klass) => klass.id === editing)?.series ?? "1",
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
							label: "Curso técnico",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "courseId",
								className: controlClass,
								defaultValue: classes.find((klass) => klass.id === editing)?.courseId ?? "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Não informado"
								}), workspace.courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: course.id,
									children: course.name
								}, course.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Professor responsável",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "teacherName",
								className: controlClass,
								defaultValue: classes.find((klass) => klass.id === editing)?.teacherName ?? ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Média mínima da turma",
							hint: "Em branco usa a média da escola.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "passing",
								className: controlClass,
								defaultValue: classes.find((klass) => klass.id === editing)?.passingAverage ?? ""
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: save.isPending,
							children: "Salvar turma"
						})
					]
				}, editing ?? "nova")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(linksFor),
				title: "Disciplinas da turma",
				onClose: () => setLinksFor(null),
				children: linksFor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-3",
					onSubmit: async (event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						const links = workspace.subjects.flatMap((subject) => {
							if (!form.get(`sub-${subject.id}`)) return [];
							return [{
								subjectId: subject.id,
								teacherName: String(form.get(`teacher-${subject.id}`) ?? "")
							}];
						});
						try {
							await saveClassSubjects({ data: {
								schoolId: workspace.school.id,
								classId: linksFor,
								links
							} });
							await refresh();
							setLinksFor(null);
							toast.success("Disciplinas atualizadas.");
						} catch (error) {
							toast.error(errText(error));
						}
					},
					children: [workspace.subjects.map((subject) => {
						const current = workspace.classSubjects.find((link) => link.classId === linksFor && link.subjectId === subject.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									name: `sub-${subject.id}`,
									defaultChecked: Boolean(current)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-28",
									children: subject.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: `teacher-${subject.id}`,
									defaultValue: current?.teacherName ?? subject.teacherName,
									placeholder: "Professor",
									className: controlClass
								})
							]
						}, subject.id);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Salvar vínculos"
					})]
				}) : null
			})
		]
	});
}
//#endregion
export { ClassesPage as component };
