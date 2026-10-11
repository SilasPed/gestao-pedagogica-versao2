//#region node_modules/.nitro/vite/services/ssr/assets/format-DUutiuuN.js
function fmtGrade(n) {
	if (n == null || Number.isNaN(n)) return "—";
	const neg = n < 0;
	const [i, d] = (Math.round(Math.abs(n) * 100) / 100).toFixed(2).split(".");
	const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	const dec = d === "00" ? "" : d.endsWith("0") ? `,${d[0]}` : `,${d}`;
	return `${neg ? "-" : ""}${int}${dec}`;
}
function fmtPercent(n) {
	if (n == null || Number.isNaN(n)) return "—";
	return `${fmtGrade(n)}%`;
}
function asNumber(v, fallback = 0) {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string" && v.trim() !== "") {
		const n = Number(v);
		if (Number.isFinite(n)) return n;
	}
	return fallback;
}
function asNumberOrNull(v) {
	if (v == null || v === "") return null;
	if (typeof v === "number") return Number.isFinite(v) ? v : null;
	if (typeof v === "string" && v.trim() !== "") {
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}
function seriesLabel(series) {
	if (series === "1") return "1º ano";
	if (series === "2") return "2º ano";
	if (series === "3") return "3º ano";
	return series?.trim() || "—";
}
function todayBR() {
	return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(/* @__PURE__ */ new Date());
}
function normalizeKey(s) {
	return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
//#endregion
export { normalizeKey as a, fmtPercent as i, asNumberOrNull as n, seriesLabel as o, fmtGrade as r, todayBR as s, asNumber as t };
