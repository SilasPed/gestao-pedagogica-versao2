import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { c as controlClass, l as errText, n as Button } from "./ui-ByRUqWcZ.mjs";
import { C as previewImport, U as useSchool, o as commitImport } from "./school-context-MF74zmn4.mjs";
import { o as IMPORT_FIELDS } from "./constants-DSm8IPDq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as readSpreadsheet, n as downloadDemo430, r as downloadTemplate } from "./files-BTo9JlNV.mjs";
import { a as detectHeaderRow, f as sheetRecords, t as autoMap } from "./import-logic-aplL_GiE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/importar-BMjwx-vN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	{
		id: "students",
		label: "Cadastro de estudantes"
	},
	{
		id: "scores",
		label: "Notas"
	},
	{
		id: "classes",
		label: "Turmas"
	},
	{
		id: "assessments",
		label: "Avaliações"
	},
	{
		id: "qualitative",
		label: "Registros qualitativos"
	}
];
var MODES = [
	{
		id: "add",
		label: "Adicionar",
		hint: "Inclui só quem ainda não existe. Quem já está cadastrado fica intocado."
	},
	{
		id: "update",
		label: "Atualizar",
		hint: "Altera apenas registros achados por matrícula ou, se você confirmar, pelo nome."
	},
	{
		id: "merge",
		label: "Mesclar",
		hint: "Inclui os novos e atualiza os que já existem, depois da prévia."
	}
];
function ImportPage() {
	const { workspace, yearId, refresh } = useSchool();
	const [kind, setKind] = (0, import_react.useState)("students");
	const [mode, setMode] = (0, import_react.useState)("merge");
	const [sheets, setSheets] = (0, import_react.useState)([]);
	const [sheetName, setSheetName] = (0, import_react.useState)("");
	const [headerIndex, setHeaderIndex] = (0, import_react.useState)(0);
	const [mapping, setMapping] = (0, import_react.useState)({});
	const [allowNameMatch, setAllowNameMatch] = (0, import_react.useState)(false);
	const [allowSameName, setAllowSameName] = (0, import_react.useState)(false);
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [report, setReport] = (0, import_react.useState)(null);
	const sheet = sheets.find((item) => item.name === sheetName) ?? sheets[0];
	const headers = (0, import_react.useMemo)(() => {
		return (sheet?.rows[headerIndex] ?? []).map((cell, index) => cell == null || String(cell).trim() === "" ? `Coluna ${index + 1}` : String(cell));
	}, [sheet, headerIndex]);
	const records = (0, import_react.useMemo)(() => sheet ? sheetRecords(sheet.rows, headerIndex, mapping) : [], [
		sheet,
		headerIndex,
		mapping
	]);
	const fields = IMPORT_FIELDS[kind];
	const missingRequired = fields.filter((field) => field.required && mapping[field.key] == null);
	if (!workspace || !yearId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Carregando a escola…"
	});
	async function onFile(file) {
		if (!file) return;
		setPreview(null);
		setReport(null);
		setFileName(file.name);
		try {
			const loaded = await readSpreadsheet(file);
			if (!loaded.length) throw new Error("A planilha não tem abas.");
			const first = loaded[0];
			setSheets(loaded);
			setSheetName(first.name);
			const header = detectHeaderRow(first.rows);
			setHeaderIndex(header);
			setMapping(autoMap(headerRow(first.rows, header), kind));
			toast.success("Arquivo lido. Confira a aba, o cabeçalho e o mapeamento.");
		} catch (error) {
			toast.error(errText(error));
		}
	}
	function changeKind(next) {
		setKind(next);
		setPreview(null);
		setReport(null);
		if (sheet) setMapping(autoMap(headers, next));
	}
	function changeSheet(name) {
		const next = sheets.find((item) => item.name === name);
		if (!next) return;
		const header = detectHeaderRow(next.rows);
		setSheetName(name);
		setHeaderIndex(header);
		setMapping(autoMap(headerRow(next.rows, header), kind));
		setPreview(null);
	}
	async function validate() {
		if (!records.length) return toast.error("Não há linhas de dados abaixo do cabeçalho.");
		if (missingRequired.length) return toast.error(`Mapeie: ${missingRequired.map((field) => field.label).join(", ")}.`);
		if ((kind === "scores" || kind === "qualitative") && mapping.enrollment == null && !allowNameMatch) toast.message("Sem matrícula mapeada. A prévia vai pedir confirmação antes de usar só o nome.");
		setBusy("preview");
		setReport(null);
		try {
			const summary = emptySummary();
			const plans = [];
			let totalPlans = 0;
			for (const chunk of chunks(records, 1e3)) {
				const result = await previewImport({ data: {
					schoolId: workspace.school.id,
					kind,
					mode,
					allowNameMatch,
					allowSameName,
					yearId: yearId ?? "",
					records: chunk
				} });
				addSummary(summary, result.summary);
				totalPlans += result.totalPlans;
				plans.push(...result.plans);
			}
			setPreview({
				summary,
				plans: plans.slice(0, 320),
				totalPlans
			});
		} catch (error) {
			toast.error(errText(error));
		} finally {
			setBusy(null);
		}
	}
	async function confirm() {
		if (!preview) return toast.error("Valide a planilha antes de gravar.");
		if (preview.summary.rejected > 0 && !window.confirm("Há linhas rejeitadas. Elas não serão gravadas. Continuar com as demais?")) return;
		setBusy("commit");
		const summary = emptySummary();
		const issues = [];
		let done = 0;
		try {
			for (const chunk of chunks(records, 1e3)) {
				const result = await commitImport({ data: {
					schoolId: workspace.school.id,
					kind,
					mode,
					allowNameMatch,
					allowSameName,
					yearId: yearId ?? "",
					records: chunk
				} });
				addSummary(summary, result.summary);
				issues.push(...result.issues);
				done += chunk.length;
			}
			setReport({
				summary,
				issues: issues.slice(0, 200)
			});
			setPreview(null);
			await refresh();
			toast.success("Importação concluída.");
		} catch (error) {
			setReport({
				summary,
				issues,
				stopped: `A gravação parou depois de ${done} linhas. O que já entrou permanece. ${errText(error)}`
			});
			await refresh();
			toast.error("A importação foi interrompida. Veja o relatório parcial.");
		} finally {
			setBusy(null);
		}
	}
	const sample = (sheet?.rows.slice(headerIndex, headerIndex + 6) ?? []).map((row) => headers.map((_, index) => cellText(row[index])));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl",
					children: "Importar planilha"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm text-pretty text-muted",
					children: "Excel ou CSV. A nota entra pela matrícula, não pela ordem das linhas. Célula vazia não vira zero. Nada é gravado antes da confirmação."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						onClick: () => downloadTemplate(kind),
						children: "Modelo desta importação"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => downloadDemo430(),
						children: "Planilha fictícia de 430 alunos"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: KINDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => changeKind(item.id),
					className: choice(kind === item.id),
					children: item.label
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: MODES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setMode(item.id);
						setPreview(null);
					},
					className: choice(mode === item.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-semibold",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: item.hint
					})]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-card border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "1. Arquivo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "mt-3 block w-full text-sm",
						type: "file",
						accept: ".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
						"aria-label": "Arquivo da planilha",
						onChange: (event) => void onFile(event.target.files?.[0])
					}),
					fileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: fileName
					}) : null
				]
			}),
			sheet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "2. Aba"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: controlClass,
							value: sheet.name,
							onChange: (event) => changeSheet(event.target.value),
							"aria-label": "Aba da planilha",
							children: sheets.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: item.name,
								children: item.name
							}, item.name))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "3. Linha do cabeçalho"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: controlClass,
							type: "number",
							min: 1,
							max: Math.max(1, sheet.rows.length),
							value: headerIndex + 1,
							onChange: (event) => {
								const next = Math.max(0, Number(event.target.value) - 1);
								setHeaderIndex(next);
								setMapping(autoMap(headerRow(sheet.rows, next), kind));
								setPreview(null);
							}
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-card border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl",
							children: "4. Mapear colunas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Ano de destino: ",
								workspace.years.find((year) => year.id === yearId)?.label,
								". Troque o ano no topo se a planilha for de outro período."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid gap-3 md:grid-cols-2",
							children: fields.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: [field.label, field.required ? " *" : ""]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: controlClass,
									"aria-label": field.label,
									value: mapping[field.key] ?? "",
									onChange: (event) => {
										const value = event.target.value === "" ? null : Number(event.target.value);
										setMapping((current) => ({
											...current,
											[field.key]: value
										}));
										setPreview(null);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "Não usar"
									}), headers.map((header, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: index,
										children: header
									}, `${header}-${index}`))]
								})]
							}, field.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: allowNameMatch,
									onChange: (event) => {
										setAllowNameMatch(event.target.checked);
										setPreview(null);
									}
								}), "Confirmo a mescla pelo nome quando não houver matrícula confiável"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: allowSameName,
									onChange: (event) => {
										setAllowSameName(event.target.checked);
										setPreview(null);
									}
								}), "Permitir outro estudante com o mesmo nome e matrícula diferente"]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-auto rounded-card border border-line bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "px-4 pt-4 text-xl",
							children: "5. Amostra"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "px-4 text-sm text-muted",
							children: [records.length, " linhas com algum dado. As linhas de exemplo fictício também entram se você não apagá-las."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "mt-2 w-full min-w-[640px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-soft text-left",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: header
								}, header)) })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sample.slice(1).map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-t border-line",
								children: row.map((cell, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: cell
								}, cellIndex))
							}, index)) })]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "soft",
						disabled: busy != null,
						onClick: () => void validate(),
						children: busy === "preview" ? "Validando…" : "6. Validar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						disabled: busy != null || !preview,
						onClick: () => void confirm(),
						children: busy === "commit" ? "Gravando…" : "7. Confirmar importação"
					})]
				})
			] }) : null,
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportCard, {
				title: "Prévia — nada foi gravado ainda",
				summary: preview.summary,
				lines: preview.plans.map((plan) => ({
					row: plan.row,
					message: `${labelAction(plan.action)}: ${plan.message}`
				})),
				extra: preview.totalPlans > preview.plans.length ? `Mostrando ${preview.plans.length} de ${preview.totalPlans} linhas. Os totais acima consideram o arquivo inteiro.` : null
			}) : null,
			report ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportCard, {
				title: "8. Relatório da importação",
				summary: report.summary,
				lines: report.issues,
				extra: report.stopped ?? null
			}) : null
		]
	});
}
function ReportCard({ title, summary, lines, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-card border border-line bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 grid gap-2 sm:grid-cols-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-card bg-soft px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "tabular-nums",
							children: summary.added
						}), " adicionados"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-card bg-soft px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "tabular-nums",
							children: summary.updated
						}), " atualizados"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-card bg-soft px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "tabular-nums",
							children: summary.ignored
						}), " ignorados"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-card bg-soft px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "tabular-nums",
							children: summary.rejected
						}), " rejeitados"]
					})
				]
			}),
			extra ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: extra
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 flex max-h-80 flex-col gap-1 overflow-auto text-sm",
				children: [lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-muted",
					children: "Nenhuma observação de linha."
				}) : null, lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Linha ",
					line.row,
					": ",
					line.message
				] }, `${line.row}-${index}`))]
			})
		]
	});
}
function choice(active) {
	return `rounded-card border p-3 text-left text-sm ${active ? "border-pine bg-soft" : "border-line bg-card"}`;
}
function headerRow(rows, index) {
	return (rows[index] ?? []).map((cell) => cell == null ? "" : String(cell));
}
function cellText(value) {
	if (value == null) return "";
	if (value instanceof Date) return value.toLocaleDateString("pt-BR");
	return String(value);
}
function emptySummary() {
	return {
		added: 0,
		updated: 0,
		ignored: 0,
		rejected: 0
	};
}
function addSummary(target, extra) {
	target.added += extra.added;
	target.updated += extra.updated;
	target.ignored += extra.ignored;
	target.rejected += extra.rejected;
}
function chunks(items, size) {
	const out = [];
	for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
	return out;
}
function labelAction(action) {
	if (action === "add") return "Novo";
	if (action === "update") return "Atualizar";
	if (action === "ignore") return "Ignorado";
	return "Rejeitado";
}
//#endregion
export { ImportPage as component };
