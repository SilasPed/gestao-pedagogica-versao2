import { a as normalizeKey } from "./format-DUutiuuN.mjs";
import { i as FIELD_ALIASES, o as IMPORT_FIELDS } from "./constants-DSm8IPDq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/import-logic-aplL_GiE.js
function parseSeries(raw) {
	if (raw == null || String(raw).trim() === "") return null;
	const t = normalizeKey(String(raw)).replace(/\s+/g, " ");
	if (/\b(primeiro|1)\b/.test(t) && !/\b(2|3|segundo|terceiro)\b/.test(t)) return "1";
	if (/\b(segundo|2)\b/.test(t) && !/\b(1|3|primeiro|terceiro)\b/.test(t)) return "2";
	if (/\b(terceiro|3)\b/.test(t) && !/\b(1|2|primeiro|segundo)\b/.test(t)) return "3";
	return "invalid";
}
function parseStatus(raw) {
	if (raw == null || String(raw).trim() === "") return null;
	const t = normalizeKey(String(raw));
	if ([
		"ativo",
		"ativa",
		"cursando",
		"matriculado",
		"matriculada"
	].includes(t)) return "ativo";
	if ([
		"transferido",
		"transferida",
		"transferencia"
	].includes(t)) return "transferido";
	if ([
		"concluido",
		"concluida",
		"formado",
		"formada",
		"concluinte"
	].includes(t)) return "concluido";
	if ([
		"inativo",
		"inativa",
		"evadido",
		"evadida",
		"cancelado",
		"cancelada",
		"desistente"
	].includes(t)) return "inativo";
	return "invalid";
}
function parseGradeCell(raw, maxScore) {
	if (raw == null) return { kind: "empty" };
	if (typeof raw === "number") {
		if (!Number.isFinite(raw)) return {
			kind: "invalid",
			error: "Nota inválida."
		};
		if (raw < 0) return {
			kind: "invalid",
			error: "Nota negativa não é permitida."
		};
		if (maxScore != null && raw > maxScore + 1e-9) return {
			kind: "invalid",
			error: `Nota ${raw} acima do máximo ${maxScore}.`
		};
		return {
			kind: "graded",
			value: raw
		};
	}
	const s = String(raw).trim();
	if (!s || s === "-" || s === "—" || s === "–") return { kind: "empty" };
	const t = normalizeKey(s);
	if ([
		"pendente",
		"p",
		"pend"
	].includes(t)) return { kind: "pending" };
	if ([
		"ausente",
		"ausencia",
		"falta",
		"f",
		"aus"
	].includes(t)) return { kind: "absent" };
	if ([
		"dispensado",
		"dispensada",
		"dispensa",
		"d",
		"disp"
	].includes(t)) return { kind: "excused" };
	if ([
		"na",
		"n a",
		"nao aplicavel"
	].includes(t)) return { kind: "na" };
	const normalized = s.replace(/\s/g, "").replace(",", ".");
	if (!/^\d+(\.\d+)?$/.test(normalized)) return {
		kind: "invalid",
		error: `Nota "${s}" não foi reconhecida.`
	};
	const value = Number(normalized);
	if (value < 0) return {
		kind: "invalid",
		error: "Nota negativa não é permitida."
	};
	if (maxScore != null && value > maxScore + 1e-9) return {
		kind: "invalid",
		error: `Nota ${value} acima do máximo ${maxScore}.`
	};
	return {
		kind: "graded",
		value
	};
}
function parseWeight(raw) {
	if (raw == null || String(raw).trim() === "") return null;
	const cell = parseGradeCell(raw, null);
	if (cell.kind !== "graded" || !(cell.value > 0) || cell.value > 100) return "invalid";
	return cell.value;
}
function parseDateCell(raw) {
	if (raw == null || raw === "") return null;
	if (raw instanceof Date && !Number.isNaN(raw.getTime())) return `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}-${String(raw.getDate()).padStart(2, "0")}`;
	if (typeof raw === "number" && Number.isFinite(raw)) {
		const utc = new Date(Date.UTC(1899, 11, 30) + Math.round(raw) * 864e5);
		if (Number.isNaN(utc.getTime())) return "invalid";
		return utc.toISOString().slice(0, 10);
	}
	const s = String(raw).trim();
	const br = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(s);
	if (br) {
		const d = Number(br[1]);
		const m = Number(br[2]);
		const y = Number(br[3]);
		if (m < 1 || m > 12 || d < 1 || d > 31) return "invalid";
		const dt = new Date(Date.UTC(y, m - 1, d));
		if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return "invalid";
		return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
	}
	const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
	if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
	return "invalid";
}
function parseKind(raw) {
	if (raw == null || String(raw).trim() === "") return null;
	const t = normalizeKey(String(raw));
	if (t.startsWith("prov")) return "prova";
	if (t.startsWith("trabal")) return "trabalho";
	if (t.startsWith("ativ")) return "atividade";
	if (t.startsWith("proje")) return "projeto";
	if (t.startsWith("part")) return "participacao";
	if (t.startsWith("recup")) return "recuperacao";
	return "invalid";
}
function parseBool(raw) {
	if (raw == null || String(raw).trim() === "") return null;
	const t = normalizeKey(String(raw));
	if ([
		"sim",
		"s",
		"true",
		"1",
		"recuperacao",
		"yes"
	].includes(t)) return true;
	if ([
		"nao",
		"n",
		"false",
		"0",
		"no"
	].includes(t)) return false;
	return "invalid";
}
function cleanName(raw) {
	return String(raw ?? "").replace(/\s+/g, " ").trim();
}
function cleanEnrollment(raw) {
	return String(raw ?? "").trim().toUpperCase() || null;
}
function clip(raw, max) {
	return cleanName(raw).slice(0, max);
}
function detectHeaderRow(rows) {
	const limit = Math.min(rows.length, 15);
	for (let i = 0; i < limit; i += 1) {
		const cells = (rows[i] ?? []).map((cell) => cell == null ? "" : String(cell).trim()).filter(Boolean);
		if (cells.length < 2) continue;
		if (cells.filter((cell) => Number.isNaN(Number(cell.replace(",", ".")))).length >= 2) return i;
	}
	return 0;
}
function autoMap(headers, kind) {
	const used = /* @__PURE__ */ new Set();
	const result = {};
	for (const field of IMPORT_FIELDS[kind]) {
		const aliases = (FIELD_ALIASES[field.key] ?? [field.key]).map(normalizeKey);
		let found = null;
		headers.forEach((header, index) => {
			if (found != null || used.has(index)) return;
			if (aliases.includes(normalizeKey(header))) found = index;
		});
		if (found != null) used.add(found);
		result[field.key] = found;
	}
	return result;
}
function sheetRecords(rows, headerIndex, mapping) {
	const out = [];
	for (let i = headerIndex + 1; i < rows.length; i += 1) {
		const line = rows[i] ?? [];
		const values = {};
		let any = false;
		for (const [key, index] of Object.entries(mapping)) {
			if (index == null) continue;
			const value = line[index] ?? null;
			values[key] = value;
			if (value != null && String(value).trim() !== "") any = true;
		}
		if (!any) continue;
		out.push({
			sheetRow: i + 1,
			values
		});
	}
	return out;
}
function text(values, key) {
	return cleanName(values[key]);
}
function planStudentImport(existing, records, options) {
	const pool = existing.map((student) => ({ ...student }));
	return records.map((record) => {
		const fullName = clip(record.values.fullName, 160);
		const enrollment = cleanEnrollment(record.values.enrollment);
		const series = parseSeries(record.values.series);
		const status = parseStatus(record.values.status);
		const notes = clip(record.values.notes, 4e3);
		const className = clip(record.values.className, 80);
		const courseName = clip(record.values.course, 120);
		const yearLabel = clip(record.values.year, 20);
		if (!fullName) return reject(record.sheetRow, "Nome vazio.");
		if (yearLabel && options.yearLabel && normalizeKey(yearLabel) !== normalizeKey(options.yearLabel)) return reject(record.sheetRow, `A linha está no ano ${yearLabel}, mas o destino escolhido é ${options.yearLabel}.`);
		if (series === "invalid") return reject(record.sheetRow, `Série "${text(record.values, "series")}" não é 1º, 2º ou 3º ano.`);
		if (status === "invalid") return reject(record.sheetRow, `Situação "${text(record.values, "status")}" não foi reconhecida.`);
		const byEnrollment = enrollment ? pool.filter((student) => student.enrollment && student.enrollment.toUpperCase() === enrollment) : [];
		if (byEnrollment.length > 1) return reject(record.sheetRow, `Matrícula ${enrollment} aparece mais de uma vez nos dados já salvos.`);
		let match = byEnrollment[0] ?? null;
		let weak = false;
		if (!match) {
			const byName = pool.filter((student) => normalizeKey(student.name) === normalizeKey(fullName));
			if (byName.length > 1 && !enrollment) return reject(record.sheetRow, `Há mais de um estudante com o nome "${fullName}". Informe a matrícula.`);
			if (byName.length >= 1 && enrollment && options.allowSameName && !options.allowNameMatch) match = null;
			else if (byName.length === 1 && !enrollment && options.allowNameMatch) {
				match = byName[0];
				weak = true;
			} else if (byName.length === 1 && enrollment && options.allowNameMatch && !options.allowSameName) {
				match = byName[0];
				weak = true;
			} else if (byName.length >= 1) return {
				row: record.sheetRow,
				action: "ignore",
				message: enrollment ? `A matrícula ${enrollment} é nova, mas o nome "${fullName}" já existe. Nada foi gravado. Confirme a mescla se for a mesma pessoa, ou permita outro estudante com o mesmo nome.` : `Possível duplicidade pelo nome "${fullName}". Nada foi alterado. Confirme a mescla por nome se for a mesma pessoa.`,
				payload: basePayload(record, fullName, enrollment, series, status, notes, className, courseName, yearLabel)
			};
		}
		const payload = {
			...basePayload(record, fullName, enrollment, series, status, notes, className, courseName, yearLabel),
			studentId: match?.id ?? null,
			weak
		};
		if (match) {
			if (options.mode === "add") return {
				row: record.sheetRow,
				action: "ignore",
				message: "Já existe e o modo é somente adicionar.",
				payload
			};
			if (match.archived) payload.unarchive = true;
			const updated = pool.find((student) => student.id === match.id);
			if (updated && enrollment) updated.enrollment = enrollment;
			if (updated) updated.name = fullName;
			return {
				row: record.sheetRow,
				action: "update",
				message: weak ? "Atualização pelo nome confirmado." : "Atualização pela matrícula.",
				payload
			};
		}
		if (options.mode === "update") return {
			row: record.sheetRow,
			action: "ignore",
			message: "Não encontrado para atualizar.",
			payload
		};
		const id = `new:${record.sheetRow}`;
		pool.push({
			id,
			name: fullName,
			enrollment,
			classId: null,
			yearId: options.yearId,
			archived: false
		});
		return {
			row: record.sheetRow,
			action: "add",
			message: "Novo estudante.",
			payload: {
				...payload,
				studentId: null
			}
		};
	});
}
function basePayload(record, fullName, enrollment, series, status, notes, className, courseName, yearLabel) {
	return {
		sheetRow: record.sheetRow,
		fullName,
		enrollment,
		series: series === "invalid" ? null : series,
		status: status && status !== "invalid" ? status : "ativo",
		notes,
		className,
		courseName,
		yearLabel
	};
}
function reject(row, message) {
	return {
		row,
		action: "reject",
		message,
		payload: {}
	};
}
function planScoreImport(records, ctx) {
	const students = ctx.students.map((student) => ({ ...student }));
	return records.map((record) => {
		const fullName = clip(record.values.fullName, 160);
		const enrollment = cleanEnrollment(record.values.enrollment);
		const className = clip(record.values.className, 80);
		const subjectName = clip(record.values.subject, 120);
		const assessmentName = clip(record.values.assessment, 120);
		const series = parseSeries(record.values.series);
		if (!className || !subjectName || !assessmentName) return reject(record.sheetRow, "Turma, disciplina e avaliação são obrigatórias.");
		if (!fullName && !enrollment) return reject(record.sheetRow, "Informe matrícula ou nome para vincular a nota.");
		if (series === "invalid") return reject(record.sheetRow, "Série inválida.");
		const student = matchStudent(students, fullName, enrollment, ctx.allowNameMatch);
		if (student.status === "ambiguous") return reject(record.sheetRow, student.message);
		if (student.status === "missing" && ctx.mode === "update") return reject(record.sheetRow, "Estudante não encontrado no modo atualizar.");
		if (student.status === "needs-confirm") return {
			row: record.sheetRow,
			action: "ignore",
			message: student.message,
			payload: {}
		};
		const periodId = matchPeriod(ctx.periods.filter((period) => period.yearId === ctx.yearId), record.values.period);
		if (periodId === "invalid") return reject(record.sheetRow, `Período "${text(record.values, "period")}" não existe neste ano.`);
		if (periodId === "ambiguous") return reject(record.sheetRow, "Período ambíguo.");
		const weight = parseWeight(record.values.weight);
		if (weight === "invalid") return reject(record.sheetRow, "Peso inválido. Use um número maior que zero.");
		const maxParsed = parseWeight(record.values.maxScore);
		if (maxParsed === "invalid") return reject(record.sheetRow, "Nota máxima inválida.");
		const maxScore = maxParsed ?? ctx.scaleMax;
		if (maxScore > ctx.scaleMax + 1e-9) return reject(record.sheetRow, `Nota máxima ${maxScore} passa da escala ${ctx.scaleMax}.`);
		const kind = parseKind(record.values.kind);
		if (kind === "invalid") return reject(record.sheetRow, "Tipo de avaliação não reconhecido.");
		const date = parseDateCell(record.values.date);
		if (date === "invalid") return reject(record.sheetRow, "Data inválida. Use dia/mês/ano.");
		const cell = parseGradeCell(record.values.scoreStatus != null && String(record.values.scoreStatus).trim() !== "" && (record.values.score == null || String(record.values.score).trim() === "") ? record.values.scoreStatus : record.values.score, maxScore);
		if (cell.kind === "invalid") return reject(record.sheetRow, cell.error);
		const mark = cell.kind === "empty" || cell.kind === "pending" ? {
			status: "pending",
			value: null
		} : cell.kind === "graded" ? {
			status: "graded",
			value: cell.value
		} : {
			status: cell.kind,
			value: null
		};
		const classHit = matchClass(ctx.classes, ctx.yearId, className, series);
		if (classHit === "ambiguous") return reject(record.sheetRow, `Há mais de uma turma "${className}". Informe a série.`);
		return {
			row: record.sheetRow,
			action: student.status === "missing" ? "add" : "update",
			message: mark.status === "pending" ? "Pendência registrada, sem transformar em zero." : "Nota vinculada ao estudante.",
			payload: {
				studentId: student.status === "found" ? student.id : null,
				fullName,
				enrollment,
				createStudent: student.status === "missing",
				classId: classHit && classHit !== "missing" ? classHit.id : null,
				createClass: !classHit || classHit === "missing",
				className,
				series,
				subjectName,
				subjectId: ctx.subjects.find((subject) => normalizeKey(subject.name) === normalizeKey(subjectName))?.id ?? null,
				periodId: periodId === "invalid" || periodId === "ambiguous" ? null : periodId,
				assessmentName,
				kind: kind ?? "prova",
				date,
				weight: weight ?? 1,
				maxScore,
				isRecovery: kind === "recuperacao",
				value: mark.value,
				markStatus: mark.status,
				yearId: ctx.yearId
			}
		};
	});
}
function matchStudent(students, fullName, enrollment, allowNameMatch) {
	if (enrollment) {
		const hits = students.filter((student) => student.enrollment && student.enrollment.toUpperCase() === enrollment);
		if (hits.length > 1) return {
			status: "ambiguous",
			message: `Matrícula ${enrollment} duplicada.`
		};
		if (hits.length === 1) return {
			status: "found",
			id: hits[0].id
		};
	}
	if (fullName) {
		const hits = students.filter((student) => normalizeKey(student.name) === normalizeKey(fullName));
		if (hits.length > 1) return {
			status: "ambiguous",
			message: `Nome "${fullName}" corresponde a mais de um estudante.`
		};
		if (hits.length === 1) {
			if (!allowNameMatch && !enrollment) return {
				status: "needs-confirm",
				message: `A nota de "${fullName}" só pode ser ligada pelo nome. Confirme a mescla por nome ou informe a matrícula.`
			};
			return {
				status: "found",
				id: hits[0].id
			};
		}
	}
	return { status: "missing" };
}
function matchClass(classes, yearId, className, series) {
	const sameYear = classes.filter((klass) => klass.yearId === yearId && normalizeKey(klass.name) === normalizeKey(className));
	const hits = series ? sameYear.filter((klass) => klass.series === series) : sameYear;
	if (hits.length === 1) return hits[0];
	if (hits.length > 1) return "ambiguous";
	return "missing";
}
function matchPeriod(periods, raw) {
	if (raw == null || String(raw).trim() === "") return null;
	const t = normalizeKey(String(raw)).replace(/\s+/g, " ");
	const hits = periods.filter((period) => {
		if (normalizeKey(period.name) === t) return true;
		if (t === String(period.ord)) return true;
		if (t === `${period.ord} ${period.kind}` || t === `${period.ord} bimestre` || t === `${period.ord} trimestre` || t === `${period.ord} semestre`) return true;
		return false;
	});
	if (hits.length === 1) return hits[0].id;
	if (hits.length > 1) return "ambiguous";
	return "invalid";
}
function planClassImport(records, classes, yearId, mode) {
	const pool = classes.map((klass) => ({ ...klass }));
	return records.map((record) => {
		const series = parseSeries(record.values.series);
		const className = clip(record.values.className, 80);
		const courseName = clip(record.values.course, 120);
		const teacher = clip(record.values.teacher, 120);
		if (!className) return reject(record.sheetRow, "Nome da turma vazio.");
		if (series == null || series === "invalid") return reject(record.sheetRow, "Série obrigatória: 1º, 2º ou 3º ano.");
		const hit = matchClass(pool, yearId, className, series);
		if (hit === "ambiguous") return reject(record.sheetRow, "Turma ambígua.");
		const payload = {
			className,
			series,
			courseName,
			teacher,
			classId: hit !== "missing" && hit ? hit.id : null,
			yearId
		};
		if (hit && hit !== "missing") {
			if (mode === "add") return {
				row: record.sheetRow,
				action: "ignore",
				message: "Turma já existe.",
				payload
			};
			return {
				row: record.sheetRow,
				action: "update",
				message: "Turma atualizada.",
				payload
			};
		}
		if (mode === "update") return {
			row: record.sheetRow,
			action: "ignore",
			message: "Turma não encontrada.",
			payload
		};
		pool.push({
			id: `new:${record.sheetRow}`,
			yearId,
			series,
			name: className,
			courseId: null
		});
		return {
			row: record.sheetRow,
			action: "add",
			message: "Nova turma.",
			payload
		};
	});
}
function planAssessmentImport(records, ctx) {
	return records.map((record) => {
		const className = clip(record.values.className, 80);
		const subjectName = clip(record.values.subject, 120);
		const assessmentName = clip(record.values.assessment, 120);
		const series = parseSeries(record.values.series);
		if (!className || !subjectName || !assessmentName) return reject(record.sheetRow, "Turma, disciplina e avaliação são obrigatórias.");
		if (series === "invalid") return reject(record.sheetRow, "Série inválida.");
		const klass = matchClass(ctx.classes, ctx.yearId, className, series);
		if (klass === "ambiguous") return reject(record.sheetRow, "Turma ambígua.");
		const periodId = matchPeriod(ctx.periods.filter((period) => period.yearId === ctx.yearId), record.values.period);
		if (periodId === "invalid" || periodId === "ambiguous") return reject(record.sheetRow, "Período não reconhecido.");
		const weight = parseWeight(record.values.weight);
		if (weight === "invalid") return reject(record.sheetRow, "Peso inválido.");
		const maxParsed = parseWeight(record.values.maxScore);
		if (maxParsed === "invalid") return reject(record.sheetRow, "Nota máxima inválida.");
		const maxScore = maxParsed ?? ctx.scaleMax;
		if (maxScore > ctx.scaleMax + 1e-9) return reject(record.sheetRow, "Nota máxima acima da escala.");
		const kind = parseKind(record.values.kind);
		if (kind === "invalid") return reject(record.sheetRow, "Tipo inválido.");
		const date = parseDateCell(record.values.date);
		if (date === "invalid") return reject(record.sheetRow, "Data inválida.");
		const recoveryFlag = parseBool(record.values.recovery);
		if (recoveryFlag === "invalid") return reject(record.sheetRow, "Campo de recuperação inválido. Use sim ou não.");
		const isRecovery = recoveryFlag === true || kind === "recuperacao";
		const subject = ctx.subjects.find((item) => normalizeKey(item.name) === normalizeKey(subjectName));
		const classId = klass && klass !== "missing" ? klass.id : null;
		const existing = classId && subject ? ctx.assessments.find((assessment) => assessment.classId === classId && assessment.subjectId === subject.id && assessment.periodId === periodId && normalizeKey(assessment.name) === normalizeKey(assessmentName)) : void 0;
		const payload = {
			classId,
			createClass: !classId,
			className,
			series,
			subjectId: subject?.id ?? null,
			subjectName,
			periodId,
			assessmentName,
			kind: kind ?? (isRecovery ? "recuperacao" : "prova"),
			date,
			weight: weight ?? 1,
			maxScore,
			isRecovery,
			assessmentId: existing?.id ?? null,
			yearId: ctx.yearId
		};
		if (existing) {
			if (ctx.mode === "add") return {
				row: record.sheetRow,
				action: "ignore",
				message: "Avaliação já existe.",
				payload
			};
			return {
				row: record.sheetRow,
				action: "update",
				message: "Avaliação atualizada sem apagar notas.",
				payload
			};
		}
		if (ctx.mode === "update") return {
			row: record.sheetRow,
			action: "ignore",
			message: "Avaliação não encontrada.",
			payload
		};
		return {
			row: record.sheetRow,
			action: "add",
			message: "Nova avaliação.",
			payload
		};
	});
}
function planQualImport(records, ctx) {
	return records.map((record) => {
		const fullName = clip(record.values.fullName, 160);
		const enrollment = cleanEnrollment(record.values.enrollment);
		const criterionName = clip(record.values.criterion, 160);
		const level = clip(record.values.level, 80);
		const comment = clip(record.values.comment, 2e3);
		if (!criterionName || !level) return reject(record.sheetRow, "Critério e nível são obrigatórios.");
		const student = matchStudent(ctx.students, fullName, enrollment, ctx.allowNameMatch);
		if (student.status === "ambiguous" || student.status === "needs-confirm") return {
			row: record.sheetRow,
			action: student.status === "ambiguous" ? "reject" : "ignore",
			message: student.message,
			payload: {}
		};
		if (student.status === "missing") return reject(record.sheetRow, "Estudante não encontrado. Cadastre-o antes do registro qualitativo.");
		const criterion = ctx.criteria.find((item) => normalizeKey(item.name) === normalizeKey(criterionName));
		if (!criterion) return reject(record.sheetRow, `Critério "${criterionName}" não está configurado.`);
		const levelHit = criterion.scale.find((item) => normalizeKey(item) === normalizeKey(level));
		if (!levelHit) return reject(record.sheetRow, `Nível "${level}" não faz parte da escala de "${criterion.name}".`);
		const periodId = matchPeriod(ctx.periods.filter((period) => period.yearId === ctx.yearId), record.values.period);
		if (periodId === "invalid" || periodId === "ambiguous") return reject(record.sheetRow, "Período inválido.");
		const date = parseDateCell(record.values.date);
		if (date === "invalid") return reject(record.sheetRow, "Data inválida.");
		if (ctx.mode === "add") return {
			row: record.sheetRow,
			action: "add",
			message: "Novo registro qualitativo.",
			payload: {
				studentId: student.id,
				criterionId: criterion.id,
				periodId,
				date,
				level: levelHit,
				comment
			}
		};
		return {
			row: record.sheetRow,
			action: ctx.mode === "update" ? "update" : "add",
			message: "Registro qualitativo.",
			payload: {
				studentId: student.id,
				criterionId: criterion.id,
				periodId,
				date,
				level: levelHit,
				comment
			}
		};
	});
}
function summarizePlans(plans) {
	return {
		added: plans.filter((plan) => plan.action === "add").length,
		updated: plans.filter((plan) => plan.action === "update").length,
		ignored: plans.filter((plan) => plan.action === "ignore").length,
		rejected: plans.filter((plan) => plan.action === "reject").length
	};
}
//#endregion
export { detectHeaderRow as a, planClassImport as c, planStudentImport as d, sheetRecords as f, clip as i, planQualImport as l, cleanEnrollment as n, parseSeries as o, summarizePlans as p, cleanName as r, planAssessmentImport as s, autoMap as t, planScoreImport as u };
