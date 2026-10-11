import { r as fmtGrade } from "./format-DUutiuuN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calc-DZI8ZCH7.js
function roundGrade(n) {
	return Math.round(n * 100) / 100;
}
function normalizeScore(value, maxScore, scaleMax) {
	if (!(maxScore > 0) || !(scaleMax > 0)) return value;
	return value / maxScore * scaleMax;
}
/** Nota válida para a média. Vazio, pendente, dispensa e N/A ficam de fora. Zero lançado entra. */
function effectiveValue(item, policy) {
	if (item.status === "graded" && item.value != null && Number.isFinite(item.value)) return normalizeScore(item.value, item.maxScore, policy.scaleMax);
	if (item.status === "absent" && policy.absenceCountsAsZero) return 0;
	return null;
}
function averageOf(values, mode) {
	if (values.length === 0) return null;
	if (mode === "simple") return roundGrade(values.reduce((sum, v) => sum + v.n, 0) / values.length);
	const weight = values.reduce((sum, v) => sum + v.w, 0);
	if (!(weight > 0)) return null;
	return roundGrade(values.reduce((sum, v) => sum + v.n * v.w, 0) / weight);
}
function points(items, policy) {
	const out = [];
	for (const item of items) {
		const n = effectiveValue(item, policy);
		if (n == null) continue;
		if (policy.mode === "weighted" && !(item.weight > 0)) continue;
		out.push({
			n,
			w: item.weight > 0 ? item.weight : 1
		});
	}
	return out;
}
function isPendingItem(item) {
	return item.status === "pending" || item.status === "graded" && item.value == null;
}
function periodResult(items, periodId, policy) {
	const inPeriod = items.filter((item) => item.periodId === periodId);
	const regular = inPeriod.filter((item) => !item.isRecovery);
	const recoveryItems = inPeriod.filter((item) => item.isRecovery);
	const base = averageOf(points(regular, policy), policy.mode);
	const recovery = averageOf(points(recoveryItems, policy), policy.mode);
	let final = base;
	if (policy.recovery === "replace_if_higher") final = recovery != null && (base == null || recovery > base) ? recovery : base;
	else if (policy.recovery === "average_with_original") final = base != null && recovery != null ? roundGrade((base + recovery) / 2) : base ?? recovery;
	return {
		periodId,
		base,
		recovery,
		final,
		pending: inPeriod.some(isPendingItem),
		gradedCount: points(regular, policy).length
	};
}
function accumulate(results) {
	const vals = results.map((r) => r.final).filter((v) => v != null);
	if (!vals.length) return null;
	return roundGrade(vals.reduce((sum, v) => sum + v, 0) / vals.length);
}
function neededGrade(items, periodId, policy) {
	const regular = items.filter((item) => item.periodId === periodId && !item.isRecovery);
	const done = points(regular, policy);
	const pending = regular.filter(isPendingItem);
	const target = policy.passing;
	if (pending.length > 0) {
		let neededN = 0;
		if (policy.mode === "simple") {
			const sum = done.reduce((acc, v) => acc + v.n, 0);
			neededN = (target * (done.length + pending.length) - sum) / pending.length;
		} else {
			const sum = done.reduce((acc, v) => acc + v.n * v.w, 0);
			const wDone = done.reduce((acc, v) => acc + v.w, 0);
			const wPend = pending.reduce((acc, item) => acc + (item.weight > 0 ? item.weight : 0), 0);
			if (!(wPend > 0)) return {
				neededOnScale: null,
				neededRaw: null,
				feasible: null,
				explanation: "Há avaliações pendentes sem peso válido. Ajuste o peso antes de calcular a nota necessária."
			};
			neededN = (target * (wDone + wPend) - sum) / wPend;
		}
		const already = neededN <= 0;
		const neededOnScale = already ? 0 : roundGrade(neededN);
		const one = pending.length === 1 ? pending[0] : null;
		const neededRaw = one && !already ? roundGrade(Math.max(0, neededN) / policy.scaleMax * one.maxScore) : already ? 0 : null;
		const feasible = already || neededN <= policy.scaleMax + 1e-9;
		const names = pending.slice(0, 3).map((item) => item.name).join(", ");
		let explanation;
		if (already) explanation = "A média mínima deste período já está garantida com as notas lançadas. As pendências continuam fora da conta e não foram transformadas em zero.";
		else if (!feasible) explanation = `Para atingir ${fmtGrade(target)} seria necessária uma nota ${fmtGrade(neededOnScale)} na escala, acima do máximo ${fmtGrade(policy.scaleMax)}. Avaliações pendentes: ${names}.`;
		else if (one && neededRaw != null) explanation = `Em "${one.name}" (máximo ${fmtGrade(one.maxScore)}), a nota necessária é ${fmtGrade(neededRaw)}, equivalente a ${fmtGrade(neededOnScale)} na escala da escola.`;
		else explanation = `Há ${pending.length} avaliações pendentes (${names}). Se todas tiverem o mesmo desempenho, cada uma precisa valer ${fmtGrade(neededOnScale)} na escala da escola.`;
		return {
			neededOnScale,
			neededRaw,
			feasible,
			explanation
		};
	}
	const current = periodResult(items, periodId, policy);
	if (current.final != null && current.final + 1e-9 >= target) return {
		neededOnScale: 0,
		neededRaw: null,
		feasible: true,
		explanation: "O resultado deste período já alcança a média mínima."
	};
	if (policy.recovery === "keep_both") return {
		neededOnScale: null,
		neededRaw: null,
		feasible: null,
		explanation: "A recuperação fica registrada e não altera o resultado do período. As notas originais permanecem. A regra pode ser mudada em Configurações."
	};
	if (policy.recovery === "replace_if_higher") return {
		neededOnScale: target,
		neededRaw: null,
		feasible: target <= policy.scaleMax,
		explanation: `Uma recuperação que substitua o resultado, somente se for maior, precisa ser pelo menos ${fmtGrade(target)} na escala da escola. A média original (${current.base == null ? "sem nota" : fmtGrade(current.base)}) não é apagada.`
	};
	if (current.base == null) return {
		neededOnScale: target,
		neededRaw: null,
		feasible: target <= policy.scaleMax,
		explanation: "Ainda não há média regular. Sozinha, a recuperação precisará atingir a média mínima."
	};
	const needed = roundGrade(target * 2 - current.base);
	return {
		neededOnScale: Math.max(0, needed),
		neededRaw: null,
		feasible: needed <= policy.scaleMax + 1e-9,
		explanation: `Pela regra de média entre a nota regular (${fmtGrade(current.base)}) e a recuperação, a recuperação precisa ser ${fmtGrade(Math.max(0, needed))} na escala. A nota original permanece registrada.`
	};
}
function academicSituation(input) {
	const gradeOk = input.average != null && input.average + 1e-9 >= input.passing;
	const freqOk = !(input.frequencyPercent != null) || input.frequencyPercent + 1e-9 >= input.frequencyMin;
	if (input.average == null && input.pending) return {
		label: "Notas pendentes",
		tone: "warn"
	};
	if (input.average == null) return {
		label: "Sem nota lançada",
		tone: "muted"
	};
	if (!freqOk && gradeOk) return {
		label: "Nota satisfatória, frequência abaixo do mínimo",
		tone: "warn"
	};
	if (!freqOk && !gradeOk) return {
		label: "Abaixo da média e da frequência mínima",
		tone: "bad"
	};
	if (!gradeOk) return {
		label: input.pending ? "Abaixo da média, com pendência" : "Abaixo da média",
		tone: "bad"
	};
	if (input.pending) return {
		label: "Satisfatório, com pendência",
		tone: "warn"
	};
	if (!input.closed) return {
		label: "Satisfatório (parcial)",
		tone: "ok"
	};
	return {
		label: "Satisfatório",
		tone: "ok"
	};
}
function frequencyOf(marks, policy) {
	let present = 0;
	let absences = 0;
	let considered = 0;
	for (const mark of marks) {
		if (mark === "pending") continue;
		const rule = mark === "present" ? "presence" : mark === "absent" ? "absence" : mark === "justified" ? policy.justifiedRule : policy.lateRule;
		if (rule === "ignore") continue;
		considered += 1;
		if (rule === "presence") present += 1;
		else absences += 1;
	}
	return {
		percent: considered ? roundGrade(present / considered * 100) : null,
		absences,
		considered,
		present
	};
}
function rulesText(policy) {
	return [
		policy.mode === "weighted" ? "Média ponderada = soma de (nota normalizada × peso) dividida pela soma dos pesos das avaliações com nota válida." : "Média simples = soma das notas normalizadas dividida pela quantidade de avaliações com nota válida. Os pesos ficam registrados, mas não entram na conta.",
		"Nota normalizada = nota lançada ÷ nota máxima da avaliação × escala da escola. Um trabalho de máximo diferente de uma prova passa a ser comparável.",
		"Célula vazia, pendente, dispensa e não aplicável não viram zero. Zero só entra quando foi lançado como nota zero.",
		policy.absenceCountsAsZero ? "Ausência na avaliação entra como zero porque essa opção está ligada nas configurações." : "Ausência na avaliação não entra na média e não vira zero.",
		"A média do período usa só as avaliações regulares. A recuperação não apaga e não substitui o lançamento original.",
		policy.recovery === "replace_if_higher" ? "Recuperação: se a média das recuperações for maior que a média regular, ela passa a ser o resultado do período. As notas originais continuam visíveis." : policy.recovery === "average_with_original" ? "Recuperação: o resultado do período é a média aritmética entre a média regular e a média das recuperações." : "Recuperação: fica registrada à parte e não altera o resultado do período.",
		"A média acumulada é a média aritmética dos resultados dos períodos que já têm nota. Período sem nota não entra como zero.",
		`Média mínima: ${fmtGrade(policy.passing)} na escala de 0 a ${fmtGrade(policy.scaleMax)}.`
	];
}
function summarizeItems(items, periods, policy) {
	const bySubject = [...new Set(items.map((item) => item.subjectId))].map((subjectId) => {
		const sub = items.filter((item) => item.subjectId === subjectId);
		const results = periods.map((period) => periodResult(sub, period.id, policy));
		const relevantResults = periods.filter((period) => sub.some((item) => item.periodId === period.id)).map((period) => results.find((r) => r.periodId === period.id));
		const closed = relevantResults.length > 0 && relevantResults.every((r) => r.final != null && !r.pending);
		return {
			subjectId,
			average: accumulate(results),
			pending: sub.some(isPendingItem),
			periods: results,
			closed
		};
	});
	const averages = bySubject.map((s) => s.average).filter((v) => v != null);
	const relevantSubjects = bySubject.filter((s) => s.periods.some((p) => p.final != null || p.pending || p.gradedCount > 0));
	return {
		average: averages.length ? roundGrade(averages.reduce((sum, v) => sum + v, 0) / averages.length) : null,
		pending: bySubject.some((s) => s.pending),
		closed: relevantSubjects.length > 0 && relevantSubjects.every((s) => s.closed),
		bySubject
	};
}
//#endregion
export { periodResult as a, summarizeItems as c, neededGrade as i, frequencyOf as n, roundGrade as o, isPendingItem as r, rulesText as s, academicSituation as t };
