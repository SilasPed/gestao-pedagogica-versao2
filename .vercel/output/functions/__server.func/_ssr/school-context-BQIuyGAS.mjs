import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { p as useCurrentUserState } from "./ui-FQ-oeRrS.mjs";
import { t as authMiddleware } from "./middleware-CGATUTgq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/school-context-BQIuyGAS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("71b26c2a24b871087aec1f2bde36dd342e3345e70091b282b7db6c4daa513708"));
var updateSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("69c9e839d1dfa197e1f0d0cdf9a32df0f519832a1983c42c7b471c0062ef758e"));
var saveYear = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("bb47e852217ac335812b4107ed9b151535af269eef8d1fed17d4d8363a785aaa"));
var activateYear = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("496fa438b9b5a9f6af54775a2cd8c93c0ceeb2b19d569fa4a57386fe4f9975ae"));
var renamePeriod = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("d71cfafa634eaccb5d4907f63fe13d25c1f967ff47b9f8b9b3102522f6edf85d"));
var saveCourse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("269439885dc5959b2fd32761df06d1aa58e9aac851b3849cdfee31bb14d43fb6"));
var deleteCourse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("17be631dfccdd1def5eafc00424b98b2064c43fe91589654b8c707ec64786158"));
var saveSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("19a30d5445365fecf5ac969c4b93afe1e77b55fcb40def12624d6c53adedcc6c"));
var deleteSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("98060af2d368d9ad839c6474632ee5aead3b5080a329a73fa7e1d7821c95a936"));
var saveClass = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("fa8fd5ff09c88ae507e9ca42e3c827ac692b521c6148e732edacfff991f3dbec"));
var archiveClass = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("8af5f3eb1c2965b82d220f0697505744e1d4de9a40b0fd418031d77af5e7221f"));
var saveClassSubjects = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("b6db14ccd4fa59f4cc116d47ce7c79940577b82db84eaea2120f2b1875a7e49f"));
var saveStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("3bb9631897580d7c3d62b6191b5ebd7ea591a04777d1ce430f522fb2221d5f16"));
var deleteStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("ad8de00b2b063c8e331803ba484a8fe5a1637a3761bd2e224ac004aa3806183d"));
var listStudents = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("42357cb8f93db921ed894d829671f2ebfe2723694b41771993d6588cc40ba506"));
var saveStudent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("3fbb013018c3a42219d629429c5d45457bb23612cf1beaac5fd48c448686019f"));
var archiveStudent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("1fc9d5e2126e03a279dbd238f42ea0c6e9f785edfad44f130ea6d844b268441c"));
var deleteStudent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("401ac3a1fc48a801c4bf6890d475669be5894b7d7732408f2123beacf9ee889b"));
var getDashboard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("87b0a2010a34598b85c52421cfef183eb2514874cbf203d7c72c059096f574a0"));
var getStudentProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("658ae61348a633c7e57c40dec52a899284bf389d6899614e3fc9b855f8d42110"));
var getGradebook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("f6bb8fbdbdda627af0c2ee024d621f0f3bd26bbff21ac75f49852069d3046d8e"));
var saveAssessment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("221fa393479ed5a722d02461032e281137bf717f07951e4dfb9bc05fc5de030f"));
var deleteAssessment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7b96c5df88e47224de951713a4d18211237902f674998fff3e077e1847cdffbc"));
var saveScores = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("8a162d476a8fc1d2d41225bf921423013f910764e4e48cc8b7b9fa5faabc9366"));
var saveCriterion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("f2414f46855a53f68dcbee1387e8b3b2c9fc6f4e2d91ded3306ce6358edba4f0"));
var listQual = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("e66bce0def16d48c33c730a9d44138e9fca02e86847a4d72d6666d11dae43bbe"));
var saveQual = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("1da1333f28cbe054d4c4f2d2d1969253d0e22aee3858947dd8d7d1daa4796a09"));
var deleteQual = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("10c69d8788f04fce67f9dea6303fe22ec19e5001c6a712a381d7664c19374f22"));
var getAttendance = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("9125df954d09c9833d94e28c4460e55e984063429f67f90300b78242b15f238d"));
var saveSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("b3d124729e7ddd9ce87dae358f42570d8d51e2f283d387624f5528aa390c8d24"));
var saveMarks = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("b9e5189a4091480c6dd9f23a9ae0b2d28851f60c217c8e433617fd3dc4c1fe8c"));
var deleteSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("b31669f5bfae4a897d83057136285d209b91006ed6880f529a7438951291a43f"));
var buildExport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("10d76835ddf0aafa5185151c9ab3d39ab0f0921938391e6e55f756ffb602e96b"));
var previewImport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("75d62bc7135e9c37aad98970dd351d82a285b56cefb9bdfcf230f3696ed2ad0c"));
var commitImport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("f932d6cc7d88e4fc1346ad974dd7a11f783a9ee9cde5654608a85a3999926bb4"));
var exportBackup = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("93e75b2a8cd1ef3512920ab4cbc8f399e29e4e56bb164939a4d693d7fd555177"));
var listAudit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("4b0ec857681ae463b7d34f368ee1cc4da77c441ec4c5b237aae135008aa07f32"));
var joinSchool = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("584e832dcd102d70a3ecaffbeaa73ec1711046decb006d98236d29f2e8398c91"));
var regenerateInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("6e1b9dc2bb3bb958af7bbb29b7c5d1dc38112e1dc4eab7c8ce9bf4e5fd72f960"));
var updateMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("fdc1a00636230bc9f3ec59a4716a8ee82554a9ba32fa9c6d12f77ae63ba7c965"));
var updateMyName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("7803330db34dbe4c51d5aa8ce092397bee4221a73753e3051d371ea153072b78"));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(createSsrRpc("01bc48173f9a20834dd4ec55b6f7bc4de968b1b170a0d0279c1cb75cbc767390"));
var SchoolContext = (0, import_react.createContext)(null);
function SchoolProvider({ children }) {
	const { user } = useCurrentUserState();
	const client = useQueryClient();
	const [schoolId, setSchoolIdState] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [yearId, setYearIdState] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setSchoolIdState(localStorage.getItem("gep-school"));
		setReady(true);
	}, []);
	const query = useQuery({
		queryKey: [
			"workspace",
			user?.id,
			schoolId
		],
		enabled: Boolean(user) && ready,
		queryFn: () => getWorkspace({ data: { schoolId } })
	});
	(0, import_react.useEffect)(() => {
		const data = query.data;
		if (!data) return;
		localStorage.setItem("gep-school", data.school.id);
		const stored = localStorage.getItem(`gep-year-${data.school.id}`);
		const active = data.years.find((year) => year.active)?.id ?? data.years[0]?.id ?? null;
		const next = stored && data.years.some((year) => year.id === stored) ? stored : active;
		setYearIdState(next);
	}, [query.data]);
	function setYearId(id) {
		setYearIdState(id);
		if (query.data) localStorage.setItem(`gep-year-${query.data.school.id}`, id);
	}
	function setSchoolId(id) {
		localStorage.setItem("gep-school", id);
		setSchoolIdState(id);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SchoolContext.Provider, {
		value: {
			workspace: query.data ?? null,
			loading: !ready || query.isLoading,
			error: query.error instanceof Error ? query.error.message : query.error ? "Falha ao carregar a escola." : null,
			refresh: async () => {
				await client.invalidateQueries({ queryKey: ["workspace"] });
			},
			yearId,
			setYearId,
			schoolId: query.data?.school.id ?? schoolId,
			setSchoolId
		},
		children
	});
}
function useSchool() {
	const value = (0, import_react.useContext)(SchoolContext);
	if (!value) throw new Error("Escola indisponível neste ponto da tela.");
	return value;
}
//#endregion
export { saveCourse as A, updateMember as B, previewImport as C, saveAssessment as D, renamePeriod as E, saveSession as F, updateSettings as H, saveStaff as I, saveStudent as L, saveMarks as M, saveQual as N, saveClass as O, saveScores as P, saveSubject as R, listStudents as S, removeMember as T, useSchool as U, updateMyName as V, getGradebook as _, buildExport as a, listAudit as b, deleteCourse as c, deleteStaff as d, deleteStudent as f, getDashboard as g, getAttendance as h, archiveStudent as i, saveCriterion as j, saveClassSubjects as k, deleteQual as l, exportBackup as m, activateYear as n, commitImport as o, deleteSubject as p, archiveClass as r, deleteAssessment as s, SchoolProvider as t, deleteSession as u, getStudentProfile as v, regenerateInvite as w, listQual as x, joinSchool as y, saveYear as z };
