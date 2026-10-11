import { o as seriesLabel, r as fmtGrade } from "./format-DUutiuuN.mjs";
import { a as FREQ_MARKS, c as STUDENT_STATUSES, s as MARK_STATUSES, t as ASSESSMENT_KINDS } from "./constants-DSm8IPDq.mjs";
import { a as periodResult, c as summarizeItems, i as neededGrade, n as frequencyOf, o as roundGrade, r as isPendingItem, s as rulesText, t as academicSituation } from "./calc-DZI8ZCH7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-Ci5vaxxa.js
var EMPTY_FILTER = {
	yearId: null,
	series: null,
	classId: null,
	subjectId: null,
	periodId: null,
	studentId: null
};
function scoreKey(assessmentId, studentId) {
	return `${assessmentId}:${studentId}`;
}
function toItem(assessment, score) {
	const status = score?.status ?? "pending";
	const value = status === "graded" ? score?.value ?? null : null;
	return {
		assessmentId: assessment.id,
		name: assessment.name,
		periodId: assessment.periodId,
		subjectId: assessment.subjectId,
		classId: assessment.classId,
		weight: assessment.weight,
		maxScore: assessment.maxScore,
		isRecovery: assessment.isRecovery,
		value,
		status: status === "graded" && value == null ? "pending" : status
	};
}
function classLabel(klass) {
	if (!klass) return "Sem turma";
	return `${klass.series === "1" ? "1º" : klass.series === "2" ? "2º" : klass.series === "3" ? "3º" : klass.series} ${klass.name}`;
}
function buildDashboard(input) {
	const { policy, freq } = input;
	const filter = {
		...EMPTY_FILTER,
		...input.filter
	};
	const classes = input.classes.filter((klass) => {
		if (filter.yearId && klass.yearId !== filter.yearId) return false;
		if (filter.series && klass.series !== filter.series) return false;
		if (filter.classId && klass.id !== filter.classId) return false;
		return true;
	});
	const classIds = new Set(classes.map((klass) => klass.id));
	const periods = input.periods.filter((period) => !filter.yearId || period.yearId === filter.yearId).filter((period) => classes.some((klass) => klass.yearId === period.yearId)).sort((a, b) => a.ord - b.ord);
	const focusPeriods = filter.periodId ? periods.filter((period) => period.id === filter.periodId) : periods;
	const assessments = input.assessments.filter((assessment) => {
		if (!classIds.has(assessment.classId)) return false;
		if (filter.subjectId && assessment.subjectId !== filter.subjectId) return false;
		return true;
	});
	const headlineAssessments = filter.periodId ? assessments.filter((assessment) => assessment.periodId === filter.periodId) : assessments;
	const subjects = input.subjects.filter((subject) => !filter.subjectId || subject.id === filter.subjectId);
	const scoreMap = new Map(input.scores.map((score) => [scoreKey(score.assessmentId, score.studentId), score]));
	const activeEnrollment = input.enrollments.filter((enrollment) => enrollment.status === "ativo" && !enrollment.endedOn && enrollment.classId && classIds.has(enrollment.classId));
	const membersByClass = /* @__PURE__ */ new Map();
	const studentClass = /* @__PURE__ */ new Map();
	for (const enrollment of activeEnrollment) {
		if (!enrollment.classId) continue;
		const list = membersByClass.get(enrollment.classId) ?? [];
		list.push(enrollment.studentId);
		membersByClass.set(enrollment.classId, list);
		if (!studentClass.has(enrollment.studentId)) studentClass.set(enrollment.studentId, enrollment.classId);
	}
	for (const student of input.students) {
		if (student.archived || student.status !== "ativo" || !student.classId || !classIds.has(student.classId)) continue;
		if (studentClass.has(student.id)) continue;
		studentClass.set(student.id, student.classId);
		const list = membersByClass.get(student.classId) ?? [];
		list.push(student.id);
		membersByClass.set(student.classId, list);
	}
	let studentIds = [...studentClass.keys()];
	if (filter.studentId) studentIds = studentIds.filter((id) => id === filter.studentId);
	const studentById = new Map(input.students.map((student) => [student.id, student]));
	studentIds = studentIds.filter((id) => {
		const student = studentById.get(id);
		return student && !student.archived && student.status === "ativo";
	});
	const margin = roundGrade(policy.scaleMax * .05);
	const subjectName = new Map(input.subjects.map((subject) => [subject.id, subject.name]));
	const classById = new Map(input.classes.map((klass) => [klass.id, klass]));
	const rows = studentIds.map((studentId) => {
		const student = studentById.get(studentId);
		const classId = studentClass.get(studentId);
		const klass = classById.get(classId);
		const currentItems = headlineAssessments.filter((assessment) => assessment.classId === classId).map((assessment) => toItem(assessment, scoreMap.get(scoreKey(assessment.id, studentId))));
		const summary = summarizeItems(currentItems, focusPeriods, policy);
		const yearItems = assessments.filter((assessment) => assessment.classId === classId).map((assessment) => toItem(assessment, scoreMap.get(scoreKey(assessment.id, studentId))));
		const evolution = periods.map((period) => {
			const slice = yearItems.filter((item) => item.periodId === period.id);
			return {
				periodId: period.id,
				average: summarizeItems(slice, [period], policy).average
			};
		});
		const studentMarks = input.marks.filter((mark) => mark.studentId === studentId && mark.classId === classId && (!filter.subjectId || mark.subjectId === filter.subjectId));
		const frequency = studentMarks.length ? frequencyOf(studentMarks.map((mark) => mark.status), freq) : null;
		return {
			studentId,
			name: student.name,
			classId,
			passing: klass?.passing ?? policy.passing,
			average: summary.average,
			pending: summary.pending,
			closed: summary.closed,
			evolution,
			frequency,
			items: currentItems
		};
	});
	const graded = rows.filter((row) => row.average != null);
	const generalAverage = graded.length ? roundGrade(graded.reduce((sum, row) => sum + (row.average ?? 0), 0) / graded.length) : null;
	const satisfactory = graded.filter((row) => (row.average ?? 0) + 1e-9 >= row.passing);
	const below = graded.filter((row) => (row.average ?? 0) + 1e-9 < row.passing);
	const pendingStudents = rows.filter((row) => row.pending).length;
	const freqRows = rows.filter((row) => row.frequency?.percent != null);
	const frequencyAverage = freqRows.length ? roundGrade(freqRows.reduce((sum, row) => sum + (row.frequency?.percent ?? 0), 0) / freqRows.length) : null;
	const absenceCount = rows.reduce((sum, row) => sum + (row.frequency?.absences ?? 0), 0);
	const bands = 5;
	const size = policy.scaleMax / bands;
	const distribution = Array.from({ length: bands }, (_, index) => {
		const min = roundGrade(index * size);
		const max = roundGrade((index + 1) * size);
		const count = graded.filter((row) => {
			const value = row.average ?? 0;
			return index === 4 ? value >= min && value <= max + 1e-9 : value >= min && value < max;
		}).length;
		return {
			label: `${fmtGrade(min)}–${fmtGrade(max)}`,
			min,
			max,
			count
		};
	});
	const evolution = periods.map((period) => {
		const vals = rows.map((row) => row.evolution.find((item) => item.periodId === period.id)?.average).filter((value) => value != null);
		return {
			periodId: period.id,
			name: period.name,
			average: vals.length ? roundGrade(vals.reduce((sum, value) => sum + value, 0) / vals.length) : null
		};
	});
	const byClass = classes.map((klass) => {
		const members = rows.filter((row) => row.classId === klass.id);
		const withAvg = members.filter((row) => row.average != null);
		const freqMembers = members.filter((row) => row.frequency?.percent != null);
		return {
			classId: klass.id,
			name: classLabel(klass),
			series: klass.series,
			students: members.length,
			average: withAvg.length ? roundGrade(withAvg.reduce((sum, row) => sum + (row.average ?? 0), 0) / withAvg.length) : null,
			below: withAvg.filter((row) => (row.average ?? 0) + 1e-9 < (klass.passing ?? policy.passing)).length,
			pending: members.filter((row) => row.pending).length,
			frequency: freqMembers.length ? roundGrade(freqMembers.reduce((sum, row) => sum + (row.frequency?.percent ?? 0), 0) / freqMembers.length) : null
		};
	});
	const bySubject = subjects.map((subject) => {
		const vals = [];
		let pending = 0;
		for (const row of rows) {
			const sub = summarizeItems(row.items.filter((item) => item.subjectId === subject.id), focusPeriods, policy);
			if (sub.average != null) vals.push(sub.average);
			if (sub.pending) pending += 1;
		}
		return {
			subjectId: subject.id,
			name: subject.name,
			average: vals.length ? roundGrade(vals.reduce((sum, value) => sum + value, 0) / vals.length) : null,
			pending
		};
	}).filter((subject) => subject.average != null || subject.pending > 0);
	const lowestAssessments = headlineAssessments.map((assessment) => {
		const normalized = input.scores.filter((score) => score.assessmentId === assessment.id && score.status === "graded" && score.value != null).map((score) => roundGrade((score.value ?? 0) / assessment.maxScore * policy.scaleMax));
		return {
			id: assessment.id,
			name: assessment.name,
			subject: subjectName.get(assessment.subjectId) ?? "Disciplina",
			className: classLabel(classById.get(assessment.classId)),
			average: normalized.length ? roundGrade(normalized.reduce((sum, value) => sum + value, 0) / normalized.length) : null,
			count: normalized.length
		};
	}).filter((assessment) => assessment.average != null).sort((a, b) => (a.average ?? 0) - (b.average ?? 0)).slice(0, 8);
	const improved = [];
	const declined = [];
	const consistentDrops = [];
	const watch = [];
	const latestQual = /* @__PURE__ */ new Map();
	const qualSorted = [...input.qualitative].sort((a, b) => b.date.localeCompare(a.date));
	for (const record of qualSorted) {
		const key = `${record.studentId}:${record.criterionId}`;
		if (!latestQual.has(key)) latestQual.set(key, record);
	}
	const hotspot = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const reasons = [];
		const defined = row.evolution.filter((item) => item.average != null);
		const drops = [];
		for (let i = 1; i < defined.length; i += 1) {
			const prev = defined[i - 1];
			const next = defined[i];
			const delta = (next.average ?? 0) - (prev.average ?? 0);
			const prevName = periods.find((period) => period.id === prev.periodId)?.name ?? "período";
			const nextName = periods.find((period) => period.id === next.periodId)?.name ?? "período";
			if (delta <= -margin) {
				const text = `A média passou de ${fmtGrade(prev.average)} em ${prevName} para ${fmtGrade(next.average)} em ${nextName} (queda de ${fmtGrade(Math.abs(delta))}; a regra usa queda de pelo menos ${fmtGrade(margin)}).`;
				declined.push({
					studentId: row.studentId,
					name: row.name,
					text
				});
				drops.push(text);
			} else if (delta >= margin) improved.push({
				studentId: row.studentId,
				name: row.name,
				text: `A média passou de ${fmtGrade(prev.average)} em ${prevName} para ${fmtGrade(next.average)} em ${nextName} (alta de ${fmtGrade(delta)}).`
			});
		}
		if (drops.length >= 2) {
			const text = `Queda em períodos seguidos: ${drops.slice(-2).join(" ")}`;
			consistentDrops.push({
				studentId: row.studentId,
				name: row.name,
				text
			});
			reasons.push({
				code: "queda",
				text
			});
		}
		if (row.average != null && row.average + 1e-9 < row.passing) reasons.push({
			code: "media",
			text: `Média ${fmtGrade(row.average)} abaixo da mínima ${fmtGrade(row.passing)} na escala da escola. O cálculo ignora lançamentos em branco.`
		});
		if (row.pending) {
			const names = row.items.filter(isPendingItem).slice(0, 3).map((item) => item.name);
			reasons.push({
				code: "pendente",
				text: `Há avaliação sem nota lançada${names.length ? `: ${names.join(", ")}` : ""}. Célula vazia não foi convertida em zero.`
			});
		}
		if (row.frequency?.percent != null && row.frequency.percent + 1e-9 < freq.minimum) reasons.push({
			code: "frequencia",
			text: `Frequência ${fmtGrade(row.frequency.percent)}% nas aulas já registradas, abaixo do mínimo de ${fmtGrade(freq.minimum)}%. Aulas sem registro não entram como falta.`
		});
		for (const criterion of input.criteria) {
			const record = latestQual.get(`${row.studentId}:${criterion.id}`);
			if (!record) continue;
			const lowest = criterion.scale[criterion.scale.length - 1];
			if (lowest && record.level.trim().toLowerCase() === lowest.trim().toLowerCase()) {
				const set = hotspot.get(criterion.id) ?? /* @__PURE__ */ new Set();
				set.add(row.studentId);
				hotspot.set(criterion.id, set);
				reasons.push({
					code: "qualitativo",
					text: `No critério "${criterion.name}", o registro mais recente (${record.date}) está em "${record.level}", o último nível da escala configurada.`
				});
			}
		}
		const absents = row.items.filter((item) => item.status === "absent");
		if (absents.length && !policy.absenceCountsAsZero) reasons.push({
			code: "ausencia",
			text: `Há ausência em ${absents.slice(0, 2).map((item) => item.name).join(", ")}. Essa ausência não entrou como zero.`
		});
		if (reasons.length) watch.push({
			studentId: row.studentId,
			name: row.name,
			className: classLabel(classById.get(row.classId)),
			reasons
		});
	}
	watch.sort((a, b) => b.reasons.length - a.reasons.length || a.name.localeCompare(b.name, "pt-BR"));
	const best = classes.map((klass) => {
		const members = rows.filter((row) => row.classId === klass.id);
		const defined = periods.map((period) => {
			const vals = members.map((row) => row.evolution.find((item) => item.periodId === period.id)?.average).filter((value) => value != null);
			return vals.length ? vals.reduce((sum, value) => sum + value, 0) / vals.length : null;
		}).filter((value) => value != null);
		if (defined.length < 2) return null;
		const delta = roundGrade(defined[defined.length - 1] - defined[0]);
		return {
			className: classLabel(klass),
			delta
		};
	}).filter((item) => item != null).sort((a, b) => b.delta - a.delta)[0];
	return {
		studentCount: rows.length,
		classCount: classes.length,
		subjectCount: new Set(headlineAssessments.map((assessment) => assessment.subjectId)).size || subjects.length,
		assessmentCount: headlineAssessments.length,
		generalAverage,
		satisfactoryPercent: graded.length ? roundGrade(satisfactory.length / graded.length * 100) : null,
		gradedStudents: graded.length,
		belowCount: below.length,
		pendingStudents,
		frequencyAverage,
		absenceCount,
		evolution,
		distribution,
		byClass,
		bySubject,
		watchlist: watch.slice(0, 40),
		watchTotal: watch.length,
		lowestAssessments,
		improved,
		declined,
		consistentDrops,
		qualitativeHotspots: input.criteria.map((criterion) => ({
			criterionId: criterion.id,
			name: criterion.name,
			students: hotspot.get(criterion.id)?.size ?? 0
		})).filter((item) => item.students > 0).sort((a, b) => b.students - a.students),
		bestEvolution: best ? {
			...best,
			text: `${best.className} variou ${best.delta >= 0 ? "+" : ""}${fmtGrade(best.delta)} do primeiro ao último período com média.`
		} : null,
		rules: rulesText(policy)
	};
}
function buildStudentView(input) {
	const student = input.students.find((item) => item.id === input.studentId);
	if (!student) return null;
	const yearId = input.filter.yearId;
	const classes = input.classes.filter((klass) => !yearId || klass.yearId === yearId);
	const classIds = new Set(classes.map((klass) => klass.id));
	const enrollClass = input.enrollments.find((enrollment) => enrollment.studentId === student.id && enrollment.status === "ativo" && !enrollment.endedOn && enrollment.classId && classIds.has(enrollment.classId))?.classId ?? (student.classId && classIds.has(student.classId) ? student.classId : null);
	const scoreMap = new Map(input.scores.filter((score) => score.studentId === student.id).map((score) => [score.assessmentId, score]));
	const applicable = input.assessments.filter((assessment) => {
		if (!classIds.has(assessment.classId)) return false;
		if (input.filter.subjectId && assessment.subjectId !== input.filter.subjectId) return false;
		return scoreMap.has(assessment.id) || assessment.classId === enrollClass;
	});
	const items = applicable.map((assessment) => toItem(assessment, scoreMap.get(assessment.id)));
	const periods = input.periods.filter((period) => !yearId || period.yearId === yearId).sort((a, b) => a.ord - b.ord);
	const summary = summarizeItems(items, periods, input.policy);
	const passing = classes.find((item) => item.id === enrollClass)?.passing ?? input.policy.passing;
	const marks = input.marks.filter((mark) => mark.studentId === student.id && (!yearId || classIds.has(mark.classId)));
	const frequency = marks.length ? frequencyOf(marks.map((mark) => mark.status), input.freq) : null;
	const situation = academicSituation({
		average: summary.average,
		pending: summary.pending,
		passing,
		closed: summary.closed,
		frequencyPercent: frequency?.percent ?? null,
		frequencyMin: input.freq.minimum
	});
	const subjectName = new Map(input.subjects.map((subject) => [subject.id, subject.name]));
	const periodName = new Map(periods.map((period) => [period.id, period.name]));
	const subjects = summary.bySubject.map((subject) => ({
		id: subject.subjectId,
		name: subjectName.get(subject.subjectId) ?? "Disciplina",
		accumulated: subject.average,
		pending: subject.pending,
		periods: subject.periods.filter((result) => periods.some((period) => period.id === result.periodId)).map((result) => ({
			id: result.periodId,
			name: periodName.get(result.periodId) ?? "Período",
			base: result.base,
			recovery: result.recovery,
			final: result.final,
			pending: result.pending,
			needed: neededGrade(items.filter((item) => item.subjectId === subject.subjectId), result.periodId, input.policy)
		}))
	}));
	const comparisons = [];
	for (const subject of subjects) {
		const defined = subject.periods.filter((period) => period.final != null);
		for (let i = 1; i < defined.length; i += 1) {
			const prev = defined[i - 1];
			const next = defined[i];
			const delta = roundGrade((next.final ?? 0) - (prev.final ?? 0));
			const sign = delta > 0 ? "+" : "";
			comparisons.push(`Em ${subject.name}, o próprio resultado passou de ${fmtGrade(prev.final)} em ${prev.name} para ${fmtGrade(next.final)} em ${next.name} (${sign}${fmtGrade(delta)}).`);
		}
	}
	if (!comparisons.length) comparisons.push("Ainda não há dois períodos com nota para comparar a evolução deste estudante consigo mesmo.");
	const evolution = periods.map((period) => ({
		period: period.name,
		average: summarizeItems(items.filter((item) => item.periodId === period.id), [period], input.policy).average
	}));
	return {
		situation,
		average: summary.average,
		passing,
		frequency: frequency ? {
			percent: frequency.percent,
			absences: frequency.absences,
			considered: frequency.considered,
			minimum: input.freq.minimum
		} : null,
		evolution,
		subjects,
		assessments: applicable.map((assessment) => {
			const item = toItem(assessment, scoreMap.get(assessment.id));
			return {
				id: assessment.id,
				name: assessment.name,
				subject: subjectName.get(assessment.subjectId) ?? "Disciplina",
				period: assessment.periodId ? periodName.get(assessment.periodId) ?? "—" : "—",
				date: assessment.date,
				kind: assessment.kind,
				maxScore: assessment.maxScore,
				weight: assessment.weight,
				isRecovery: assessment.isRecovery,
				value: item.value,
				status: item.status
			};
		}).sort((a, b) => a.subject.localeCompare(b.subject, "pt-BR") || a.period.localeCompare(b.period, "pt-BR")),
		qualitative: input.qualLabels ?? [],
		comparisons,
		rules: rulesText(input.policy)
	};
}
var EXPORT_COLUMNS = {
	students: [
		"Nome completo",
		"Matrícula",
		"Ano letivo",
		"Série",
		"Turma",
		"Curso técnico",
		"Situação",
		"Observações"
	],
	gradebook: [
		"Nome",
		"Matrícula",
		"Turma",
		"Disciplina",
		"Período",
		"Avaliação",
		"Tipo",
		"Data",
		"Nota máxima",
		"Peso",
		"Nota",
		"Situação da nota",
		"Resultado do período",
		"Situação acadêmica"
	],
	report_cards: [
		"Nome",
		"Matrícula",
		"Turma",
		"Disciplina",
		"Período",
		"Média regular",
		"Recuperação",
		"Resultado",
		"Situação"
	],
	period_results: [
		"Nome",
		"Matrícula",
		"Turma",
		"Disciplina",
		"Período",
		"Média regular",
		"Recuperação",
		"Resultado",
		"Pendência",
		"Situação"
	],
	qualitative: [
		"Nome",
		"Matrícula",
		"Turma",
		"Critério",
		"Período",
		"Data",
		"Nível",
		"Comentário"
	],
	frequency: [
		"Nome",
		"Matrícula",
		"Turma",
		"Disciplina",
		"Data",
		"Aula",
		"Registro"
	],
	below_average: [
		"Nome",
		"Matrícula",
		"Turma",
		"Média",
		"Média mínima",
		"Diferença",
		"Motivo"
	],
	recovery: [
		"Nome",
		"Matrícula",
		"Turma",
		"Disciplina",
		"Período",
		"Média regular",
		"Recuperação",
		"Resultado",
		"Nota necessária"
	],
	class_overview: [
		"Turma",
		"Série",
		"Alunos",
		"Média",
		"Abaixo da média",
		"Pendências",
		"Frequência média"
	],
	annual_history: [
		"Nome",
		"Matrícula",
		"Ano",
		"Turma",
		"Disciplina",
		"Período",
		"Resultado",
		"Média acumulada",
		"Situação"
	]
};
var NOTE_HEADERS = /* @__PURE__ */ new Set(["Observações", "Comentário"]);
function filterColumns(sheet, columns, includeNotes) {
	const keep = (sheet.rows[0] ?? []).map((cell) => String(cell ?? "")).map((name) => {
		if (!includeNotes && NOTE_HEADERS.has(name)) return false;
		if (columns && columns.length > 0 && !columns.includes(name)) return false;
		return true;
	});
	return {
		name: sheet.name,
		rows: sheet.rows.map((row) => row.filter((_, index) => keep[index] !== false))
	};
}
function labelOf(list, id) {
	return list.find((item) => item.id === id)?.label ?? id;
}
function classNameOf(input, classId) {
	const klass = input.classes.find((item) => item.id === classId);
	if (!klass) return "—";
	return `${seriesLabel(klass.series)} ${klass.name}`;
}
function buildReport(input) {
	const dash = buildDashboard(input);
	const titleBase = `${input.schoolName} · ${input.yearLabel || "Ano letivo"}`;
	let sheets = [];
	let bulletins = [];
	let title = titleBase;
	if (input.kind === "students") {
		title = `Lista de estudantes · ${titleBase}`;
		sheets = [{
			name: "Estudantes",
			rows: [EXPORT_COLUMNS.students, ...input.students.filter((student) => !student.archived && inFilterStudent(input, student.id, student.classId)).map((student) => [
				student.name,
				student.enrollment ?? "",
				input.yearLabel,
				seriesLabel(input.classes.find((klass) => klass.id === student.classId)?.series ?? null),
				classNameOf(input, student.classId),
				input.courseName[input.classes.find((klass) => klass.id === student.classId)?.courseId ?? ""] ?? "",
				labelOf(STUDENT_STATUSES, student.status),
				input.notes[student.id] ?? ""
			])]
		}];
	}
	if (input.kind === "class_overview") {
		title = `Visão da turma · ${titleBase}`;
		sheets = [{
			name: "Turmas",
			rows: [EXPORT_COLUMNS.class_overview, ...dash.byClass.map((row) => [
				row.name,
				seriesLabel(row.series),
				row.students,
				row.average == null ? "" : fmtGrade(row.average),
				row.below,
				row.pending,
				row.frequency == null ? "" : fmtGrade(row.frequency)
			])]
		}];
	}
	if (input.kind === "below_average") {
		title = `Abaixo da média · ${titleBase}`;
		sheets = [{
			name: "Abaixo da média",
			rows: [EXPORT_COLUMNS.below_average, ...dash.watchlist.filter((item) => item.reasons.some((reason) => reason.code === "media")).map((item) => {
				const reason = item.reasons.find((entry) => entry.code === "media");
				const student = input.students.find((entry) => entry.id === item.studentId);
				const view = buildStudentView({
					...input,
					studentId: item.studentId
				});
				const diff = view?.average != null ? roundGrade(view.average - (view.passing ?? input.policy.passing)) : null;
				return [
					item.name,
					student?.enrollment ?? "",
					item.className,
					view?.average == null ? "" : fmtGrade(view.average),
					fmtGrade(view?.passing ?? input.policy.passing),
					diff == null ? "" : fmtGrade(diff),
					reason?.text ?? ""
				];
			})]
		}];
	}
	if (input.kind === "qualitative") {
		title = `Avaliação qualitativa · ${titleBase}`;
		sheets = [{
			name: "Qualitativa",
			rows: [EXPORT_COLUMNS.qualitative, ...input.qualRecords.filter((record) => {
				const student = input.students.find((item) => item.id === record.studentId);
				return student ? inFilterStudent(input, student.id, student.classId) : false;
			}).map((record) => {
				const student = input.students.find((item) => item.id === record.studentId);
				return [
					student?.name ?? "",
					student?.enrollment ?? "",
					classNameOf(input, student?.classId ?? null),
					record.criterion,
					record.period ?? "",
					record.date,
					record.level,
					record.comment
				];
			})]
		}];
	}
	if (input.kind === "frequency") {
		title = `Frequência · ${titleBase}`;
		sheets = [{
			name: "Frequência",
			rows: [EXPORT_COLUMNS.frequency, ...input.sessions.filter((session) => {
				if (input.filter.classId && session.classId !== input.filter.classId) return false;
				if (input.filter.subjectId && session.subjectId !== input.filter.subjectId) return false;
				return input.classes.some((klass) => klass.id === session.classId && (!input.filter.yearId || klass.yearId === input.filter.yearId));
			}).map((session) => {
				const student = input.students.find((item) => item.id === session.studentId);
				const subject = input.subjects.find((item) => item.id === session.subjectId);
				return [
					student?.name ?? "",
					student?.enrollment ?? "",
					classNameOf(input, session.classId),
					subject?.name ?? "",
					session.date,
					session.label,
					labelOf(FREQ_MARKS, session.status)
				];
			})]
		}];
	}
	if (input.kind === "gradebook" || input.kind === "period_results" || input.kind === "recovery" || input.kind === "annual_history" || input.kind === "report_cards") {
		const lines = gradeLines(input);
		if (input.kind === "gradebook") {
			title = `Diário de notas · ${titleBase}`;
			sheets = [{
				name: "Diário",
				rows: [EXPORT_COLUMNS.gradebook, ...lines.launches]
			}];
		}
		if (input.kind === "period_results") {
			title = `Resultados por período · ${titleBase}`;
			sheets = [{
				name: "Períodos",
				rows: [EXPORT_COLUMNS.period_results, ...lines.periods]
			}];
		}
		if (input.kind === "recovery") {
			title = `Recuperação · ${titleBase}`;
			sheets = [{
				name: "Recuperação",
				rows: [EXPORT_COLUMNS.recovery, ...lines.recovery]
			}];
		}
		if (input.kind === "annual_history") {
			title = `Histórico anual · ${titleBase}`;
			sheets = [{
				name: "Histórico",
				rows: [EXPORT_COLUMNS.annual_history, ...lines.history]
			}];
		}
		if (input.kind === "report_cards") {
			title = `Boletins · ${titleBase}`;
			sheets = [{
				name: "Boletins",
				rows: [EXPORT_COLUMNS.report_cards, ...lines.cards]
			}];
			bulletins = lines.bulletins;
		}
	}
	return {
		title,
		sheets: sheets.map((sheet) => filterColumns(sheet, input.columns, input.includeNotes)),
		bulletins: input.includeNotes ? bulletins : bulletins.map((bulletin) => ({
			...bulletin,
			qualitative: []
		}))
	};
}
function inFilterStudent(input, studentId, classId) {
	if (input.filter.studentId && input.filter.studentId !== studentId) return false;
	if (!classId) return !input.filter.classId && !input.filter.series;
	const klass = input.classes.find((item) => item.id === classId);
	if (!klass) return false;
	if (input.filter.yearId && klass.yearId !== input.filter.yearId) return false;
	if (input.filter.series && klass.series !== input.filter.series) return false;
	if (input.filter.classId && klass.id !== input.filter.classId) return false;
	return true;
}
function gradeLines(input) {
	const launches = [];
	const periods = [];
	const recovery = [];
	const history = [];
	const cards = [];
	const bulletins = [];
	const scoreMap = new Map(input.scores.map((score) => [`${score.assessmentId}:${score.studentId}`, score]));
	const students = input.students.filter((student) => !student.archived && student.status === "ativo" && inFilterStudent(input, student.id, student.classId));
	for (const student of students) {
		const klass = input.classes.find((item) => item.id === student.classId);
		if (!klass) continue;
		const assessments = input.assessments.filter((assessment) => {
			if (assessment.classId !== klass.id) return false;
			if (input.filter.subjectId && assessment.subjectId !== input.filter.subjectId) return false;
			if (input.filter.periodId && assessment.periodId !== input.filter.periodId) return false;
			return true;
		});
		const items = assessments.map((assessment) => {
			const score = scoreMap.get(`${assessment.id}:${student.id}`);
			const status = score?.status ?? "pending";
			const value = status === "graded" ? score?.value ?? null : null;
			return {
				assessmentId: assessment.id,
				name: assessment.name,
				periodId: assessment.periodId,
				subjectId: assessment.subjectId,
				classId: assessment.classId,
				weight: assessment.weight,
				maxScore: assessment.maxScore,
				isRecovery: assessment.isRecovery,
				value,
				status: status === "graded" && value == null ? "pending" : status
			};
		});
		const yearPeriods = input.periods.filter((period) => period.yearId === klass.yearId).sort((a, b) => a.ord - b.ord);
		const summary = summarizeItems(items, yearPeriods, input.policy);
		const situation = academicSituation({
			average: summary.average,
			pending: summary.pending,
			passing: klass.passing ?? input.policy.passing,
			closed: summary.closed,
			frequencyPercent: null,
			frequencyMin: input.freq.minimum
		});
		for (const assessment of assessments) {
			const item = items.find((entry) => entry.assessmentId === assessment.id);
			const subject = input.subjects.find((entry) => entry.id === assessment.subjectId);
			const period = yearPeriods.find((entry) => entry.id === assessment.periodId);
			const result = assessment.periodId ? periodResult(items.filter((entry) => entry.subjectId === assessment.subjectId), assessment.periodId, input.policy) : null;
			launches.push([
				student.name,
				student.enrollment ?? "",
				`${seriesLabel(klass.series)} ${klass.name}`,
				subject?.name ?? "",
				period?.name ?? "",
				assessment.name,
				labelOf(ASSESSMENT_KINDS, assessment.kind),
				assessment.date ?? "",
				assessment.maxScore,
				assessment.weight,
				item.status === "graded" ? fmtGrade(item.value) : "",
				labelOf(MARK_STATUSES, item.status),
				result?.final == null ? "" : fmtGrade(result.final),
				situation.label
			]);
		}
		for (const subject of summary.bySubject) {
			const subjectName = input.subjects.find((entry) => entry.id === subject.subjectId)?.name ?? "";
			for (const result of subject.periods) {
				const period = yearPeriods.find((entry) => entry.id === result.periodId);
				if (!period) continue;
				if (input.filter.periodId && period.id !== input.filter.periodId) continue;
				const needed = result.final != null && result.final + 1e-9 < (klass.passing ?? input.policy.passing);
				periods.push([
					student.name,
					student.enrollment ?? "",
					`${seriesLabel(klass.series)} ${klass.name}`,
					subjectName,
					period.name,
					result.base == null ? "" : fmtGrade(result.base),
					result.recovery == null ? "" : fmtGrade(result.recovery),
					result.final == null ? "" : fmtGrade(result.final),
					result.pending ? "Sim" : "Não",
					situation.label
				]);
				if (result.recovery != null || needed) recovery.push([
					student.name,
					student.enrollment ?? "",
					`${seriesLabel(klass.series)} ${klass.name}`,
					subjectName,
					period.name,
					result.base == null ? "" : fmtGrade(result.base),
					result.recovery == null ? "" : fmtGrade(result.recovery),
					result.final == null ? "" : fmtGrade(result.final),
					needed ? fmtGrade(klass.passing ?? input.policy.passing) : ""
				]);
				history.push([
					student.name,
					student.enrollment ?? "",
					input.yearLabel,
					`${seriesLabel(klass.series)} ${klass.name}`,
					subjectName,
					period.name,
					result.final == null ? "" : fmtGrade(result.final),
					subject.average == null ? "" : fmtGrade(subject.average),
					situation.label
				]);
				cards.push([
					student.name,
					student.enrollment ?? "",
					`${seriesLabel(klass.series)} ${klass.name}`,
					subjectName,
					period.name,
					result.base == null ? "" : fmtGrade(result.base),
					result.recovery == null ? "" : fmtGrade(result.recovery),
					result.final == null ? "" : fmtGrade(result.final),
					situation.label
				]);
			}
		}
		const view = buildStudentView({
			...input,
			studentId: student.id
		});
		bulletins.push({
			studentId: student.id,
			studentName: student.name,
			enrollment: student.enrollment ?? "—",
			className: `${seriesLabel(klass.series)} ${klass.name}`,
			course: input.courseName[klass.courseId ?? ""] ?? "—",
			year: input.yearLabel,
			situation: situation.label,
			average: summary.average == null ? "—" : fmtGrade(summary.average),
			frequency: "—",
			rows: cards.filter((row) => row[0] === student.name).map((row) => ({
				subject: String(row[3] ?? ""),
				period: String(row[4] ?? ""),
				regular: String(row[5] ?? ""),
				recovery: String(row[6] ?? ""),
				final: String(row[7] ?? ""),
				situation: String(row[8] ?? "")
			})),
			comparisons: view?.comparisons ?? [],
			qualitative: input.qualRecords.filter((record) => record.studentId === student.id).map((record) => ({
				criterion: record.criterion,
				level: record.level,
				comment: record.comment
			}))
		});
	}
	return {
		launches,
		periods,
		recovery,
		history,
		cards,
		bulletins
	};
}
//#endregion
export { buildStudentView as i, buildDashboard as n, buildReport as r, EXPORT_COLUMNS as t };
