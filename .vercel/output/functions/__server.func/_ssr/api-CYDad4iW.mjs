import { i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CGATUTgq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CYDad4iW.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var UserError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "UserError";
	}
};
var api_exports = /* @__PURE__ */ __exportAll({
	activateYear_createServerFn_handler: () => activateYear_createServerFn_handler,
	archiveClass_createServerFn_handler: () => archiveClass_createServerFn_handler,
	archiveStudent_createServerFn_handler: () => archiveStudent_createServerFn_handler,
	buildExport_createServerFn_handler: () => buildExport_createServerFn_handler,
	commitImport_createServerFn_handler: () => commitImport_createServerFn_handler,
	deleteAssessment_createServerFn_handler: () => deleteAssessment_createServerFn_handler,
	deleteCourse_createServerFn_handler: () => deleteCourse_createServerFn_handler,
	deleteQual_createServerFn_handler: () => deleteQual_createServerFn_handler,
	deleteSession_createServerFn_handler: () => deleteSession_createServerFn_handler,
	deleteStaff_createServerFn_handler: () => deleteStaff_createServerFn_handler,
	deleteStudent_createServerFn_handler: () => deleteStudent_createServerFn_handler,
	deleteSubject_createServerFn_handler: () => deleteSubject_createServerFn_handler,
	exportBackup_createServerFn_handler: () => exportBackup_createServerFn_handler,
	getAttendance_createServerFn_handler: () => getAttendance_createServerFn_handler,
	getDashboard_createServerFn_handler: () => getDashboard_createServerFn_handler,
	getGradebook_createServerFn_handler: () => getGradebook_createServerFn_handler,
	getStudentProfile_createServerFn_handler: () => getStudentProfile_createServerFn_handler,
	getWorkspace_createServerFn_handler: () => getWorkspace_createServerFn_handler,
	joinSchool_createServerFn_handler: () => joinSchool_createServerFn_handler,
	listAudit_createServerFn_handler: () => listAudit_createServerFn_handler,
	listQual_createServerFn_handler: () => listQual_createServerFn_handler,
	listStudents_createServerFn_handler: () => listStudents_createServerFn_handler,
	previewImport_createServerFn_handler: () => previewImport_createServerFn_handler,
	regenerateInvite_createServerFn_handler: () => regenerateInvite_createServerFn_handler,
	removeMember_createServerFn_handler: () => removeMember_createServerFn_handler,
	renamePeriod_createServerFn_handler: () => renamePeriod_createServerFn_handler,
	saveAssessment_createServerFn_handler: () => saveAssessment_createServerFn_handler,
	saveClassSubjects_createServerFn_handler: () => saveClassSubjects_createServerFn_handler,
	saveClass_createServerFn_handler: () => saveClass_createServerFn_handler,
	saveCourse_createServerFn_handler: () => saveCourse_createServerFn_handler,
	saveCriterion_createServerFn_handler: () => saveCriterion_createServerFn_handler,
	saveMarks_createServerFn_handler: () => saveMarks_createServerFn_handler,
	saveQual_createServerFn_handler: () => saveQual_createServerFn_handler,
	saveScores_createServerFn_handler: () => saveScores_createServerFn_handler,
	saveSession_createServerFn_handler: () => saveSession_createServerFn_handler,
	saveStaff_createServerFn_handler: () => saveStaff_createServerFn_handler,
	saveStudent_createServerFn_handler: () => saveStudent_createServerFn_handler,
	saveSubject_createServerFn_handler: () => saveSubject_createServerFn_handler,
	saveYear_createServerFn_handler: () => saveYear_createServerFn_handler,
	updateMember_createServerFn_handler: () => updateMember_createServerFn_handler,
	updateMyName_createServerFn_handler: () => updateMyName_createServerFn_handler,
	updateSettings_createServerFn_handler: () => updateSettings_createServerFn_handler
});
async function guard(work) {
	try {
		return await work();
	} catch (error) {
		if (error instanceof UserError) throw error;
		console.error(error);
		throw new UserError("Não foi possível concluir a operação. Verifique a conexão e tente de novo.");
	}
}
var getWorkspace_createServerFn_handler = createServerRpc({
	id: "71b26c2a24b871087aec1f2bde36dd342e3345e70091b282b7db6c4daa513708",
	name: "getWorkspace",
	filename: "src/lib/school/api.ts"
}, (opts) => getWorkspace.__executeServer(opts));
var getWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(getWorkspace_createServerFn_handler, async ({ context, data }) => {
	const { getWorkspaceFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => getWorkspaceFor(context.userId, data));
});
var updateSettings_createServerFn_handler = createServerRpc({
	id: "69c9e839d1dfa197e1f0d0cdf9a32df0f519832a1983c42c7b471c0062ef758e",
	name: "updateSettings",
	filename: "src/lib/school/api.ts"
}, (opts) => updateSettings.__executeServer(opts));
var updateSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(updateSettings_createServerFn_handler, async ({ context, data }) => {
	const { updateSettingsFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => updateSettingsFor(context.userId, data));
});
var saveYear_createServerFn_handler = createServerRpc({
	id: "bb47e852217ac335812b4107ed9b151535af269eef8d1fed17d4d8363a785aaa",
	name: "saveYear",
	filename: "src/lib/school/api.ts"
}, (opts) => saveYear.__executeServer(opts));
var saveYear = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveYear_createServerFn_handler, async ({ context, data }) => {
	const { saveYearFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveYearFor(context.userId, data));
});
var activateYear_createServerFn_handler = createServerRpc({
	id: "496fa438b9b5a9f6af54775a2cd8c93c0ceeb2b19d569fa4a57386fe4f9975ae",
	name: "activateYear",
	filename: "src/lib/school/api.ts"
}, (opts) => activateYear.__executeServer(opts));
var activateYear = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(activateYear_createServerFn_handler, async ({ context, data }) => {
	const { activateYearFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => activateYearFor(context.userId, data));
});
var renamePeriod_createServerFn_handler = createServerRpc({
	id: "d71cfafa634eaccb5d4907f63fe13d25c1f967ff47b9f8b9b3102522f6edf85d",
	name: "renamePeriod",
	filename: "src/lib/school/api.ts"
}, (opts) => renamePeriod.__executeServer(opts));
var renamePeriod = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(renamePeriod_createServerFn_handler, async ({ context, data }) => {
	const { renamePeriodFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => renamePeriodFor(context.userId, data));
});
var saveCourse_createServerFn_handler = createServerRpc({
	id: "269439885dc5959b2fd32761df06d1aa58e9aac851b3849cdfee31bb14d43fb6",
	name: "saveCourse",
	filename: "src/lib/school/api.ts"
}, (opts) => saveCourse.__executeServer(opts));
var saveCourse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveCourse_createServerFn_handler, async ({ context, data }) => {
	const { saveCourseFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveCourseFor(context.userId, data));
});
var deleteCourse_createServerFn_handler = createServerRpc({
	id: "17be631dfccdd1def5eafc00424b98b2064c43fe91589654b8c707ec64786158",
	name: "deleteCourse",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteCourse.__executeServer(opts));
var deleteCourse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteCourse_createServerFn_handler, async ({ context, data }) => {
	const { deleteCourseFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteCourseFor(context.userId, data));
});
var saveSubject_createServerFn_handler = createServerRpc({
	id: "19a30d5445365fecf5ac969c4b93afe1e77b55fcb40def12624d6c53adedcc6c",
	name: "saveSubject",
	filename: "src/lib/school/api.ts"
}, (opts) => saveSubject.__executeServer(opts));
var saveSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveSubject_createServerFn_handler, async ({ context, data }) => {
	const { saveSubjectFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveSubjectFor(context.userId, data));
});
var deleteSubject_createServerFn_handler = createServerRpc({
	id: "98060af2d368d9ad839c6474632ee5aead3b5080a329a73fa7e1d7821c95a936",
	name: "deleteSubject",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteSubject.__executeServer(opts));
var deleteSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteSubject_createServerFn_handler, async ({ context, data }) => {
	const { deleteSubjectFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteSubjectFor(context.userId, data));
});
var saveClass_createServerFn_handler = createServerRpc({
	id: "fa8fd5ff09c88ae507e9ca42e3c827ac692b521c6148e732edacfff991f3dbec",
	name: "saveClass",
	filename: "src/lib/school/api.ts"
}, (opts) => saveClass.__executeServer(opts));
var saveClass = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveClass_createServerFn_handler, async ({ context, data }) => {
	const { saveClassFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveClassFor(context.userId, data));
});
var archiveClass_createServerFn_handler = createServerRpc({
	id: "8af5f3eb1c2965b82d220f0697505744e1d4de9a40b0fd418031d77af5e7221f",
	name: "archiveClass",
	filename: "src/lib/school/api.ts"
}, (opts) => archiveClass.__executeServer(opts));
var archiveClass = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(archiveClass_createServerFn_handler, async ({ context, data }) => {
	const { archiveClassFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => archiveClassFor(context.userId, data));
});
var saveClassSubjects_createServerFn_handler = createServerRpc({
	id: "b6db14ccd4fa59f4cc116d47ce7c79940577b82db84eaea2120f2b1875a7e49f",
	name: "saveClassSubjects",
	filename: "src/lib/school/api.ts"
}, (opts) => saveClassSubjects.__executeServer(opts));
var saveClassSubjects = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveClassSubjects_createServerFn_handler, async ({ context, data }) => {
	const { saveClassSubjectsFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveClassSubjectsFor(context.userId, data));
});
var saveStaff_createServerFn_handler = createServerRpc({
	id: "3bb9631897580d7c3d62b6191b5ebd7ea591a04777d1ce430f522fb2221d5f16",
	name: "saveStaff",
	filename: "src/lib/school/api.ts"
}, (opts) => saveStaff.__executeServer(opts));
var saveStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveStaff_createServerFn_handler, async ({ context, data }) => {
	const { saveStaffFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveStaffFor(context.userId, data));
});
var deleteStaff_createServerFn_handler = createServerRpc({
	id: "ad8de00b2b063c8e331803ba484a8fe5a1637a3761bd2e224ac004aa3806183d",
	name: "deleteStaff",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteStaff.__executeServer(opts));
var deleteStaff = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteStaff_createServerFn_handler, async ({ context, data }) => {
	const { deleteStaffFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteStaffFor(context.userId, data));
});
var listStudents_createServerFn_handler = createServerRpc({
	id: "42357cb8f93db921ed894d829671f2ebfe2723694b41771993d6588cc40ba506",
	name: "listStudents",
	filename: "src/lib/school/api.ts"
}, (opts) => listStudents.__executeServer(opts));
var listStudents = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(listStudents_createServerFn_handler, async ({ context, data }) => {
	const { listStudentsFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => listStudentsFor(context.userId, data));
});
var saveStudent_createServerFn_handler = createServerRpc({
	id: "3fbb013018c3a42219d629429c5d45457bb23612cf1beaac5fd48c448686019f",
	name: "saveStudent",
	filename: "src/lib/school/api.ts"
}, (opts) => saveStudent.__executeServer(opts));
var saveStudent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveStudent_createServerFn_handler, async ({ context, data }) => {
	const { saveStudentFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveStudentFor(context.userId, data));
});
var archiveStudent_createServerFn_handler = createServerRpc({
	id: "1fc9d5e2126e03a279dbd238f42ea0c6e9f785edfad44f130ea6d844b268441c",
	name: "archiveStudent",
	filename: "src/lib/school/api.ts"
}, (opts) => archiveStudent.__executeServer(opts));
var archiveStudent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(archiveStudent_createServerFn_handler, async ({ context, data }) => {
	const { archiveStudentFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => archiveStudentFor(context.userId, data));
});
var deleteStudent_createServerFn_handler = createServerRpc({
	id: "401ac3a1fc48a801c4bf6890d475669be5894b7d7732408f2123beacf9ee889b",
	name: "deleteStudent",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteStudent.__executeServer(opts));
var deleteStudent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteStudent_createServerFn_handler, async ({ context, data }) => {
	const { deleteStudentFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteStudentFor(context.userId, data));
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "87b0a2010a34598b85c52421cfef183eb2514874cbf203d7c72c059096f574a0",
	name: "getDashboard",
	filename: "src/lib/school/api.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(getDashboard_createServerFn_handler, async ({ context, data }) => {
	const { dashboardFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => dashboardFor(context.userId, data));
});
var getStudentProfile_createServerFn_handler = createServerRpc({
	id: "658ae61348a633c7e57c40dec52a899284bf389d6899614e3fc9b855f8d42110",
	name: "getStudentProfile",
	filename: "src/lib/school/api.ts"
}, (opts) => getStudentProfile.__executeServer(opts));
var getStudentProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(getStudentProfile_createServerFn_handler, async ({ context, data }) => {
	const { studentProfileFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => studentProfileFor(context.userId, data));
});
var getGradebook_createServerFn_handler = createServerRpc({
	id: "f6bb8fbdbdda627af0c2ee024d621f0f3bd26bbff21ac75f49852069d3046d8e",
	name: "getGradebook",
	filename: "src/lib/school/api.ts"
}, (opts) => getGradebook.__executeServer(opts));
var getGradebook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(getGradebook_createServerFn_handler, async ({ context, data }) => {
	const { gradebookFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => gradebookFor(context.userId, data));
});
var saveAssessment_createServerFn_handler = createServerRpc({
	id: "221fa393479ed5a722d02461032e281137bf717f07951e4dfb9bc05fc5de030f",
	name: "saveAssessment",
	filename: "src/lib/school/api.ts"
}, (opts) => saveAssessment.__executeServer(opts));
var saveAssessment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveAssessment_createServerFn_handler, async ({ context, data }) => {
	const { saveAssessmentFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveAssessmentFor(context.userId, data));
});
var deleteAssessment_createServerFn_handler = createServerRpc({
	id: "7b96c5df88e47224de951713a4d18211237902f674998fff3e077e1847cdffbc",
	name: "deleteAssessment",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteAssessment.__executeServer(opts));
var deleteAssessment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteAssessment_createServerFn_handler, async ({ context, data }) => {
	const { deleteAssessmentFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteAssessmentFor(context.userId, data));
});
var saveScores_createServerFn_handler = createServerRpc({
	id: "8a162d476a8fc1d2d41225bf921423013f910764e4e48cc8b7b9fa5faabc9366",
	name: "saveScores",
	filename: "src/lib/school/api.ts"
}, (opts) => saveScores.__executeServer(opts));
var saveScores = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveScores_createServerFn_handler, async ({ context, data }) => {
	const { saveScoresFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveScoresFor(context.userId, data));
});
var saveCriterion_createServerFn_handler = createServerRpc({
	id: "f2414f46855a53f68dcbee1387e8b3b2c9fc6f4e2d91ded3306ce6358edba4f0",
	name: "saveCriterion",
	filename: "src/lib/school/api.ts"
}, (opts) => saveCriterion.__executeServer(opts));
var saveCriterion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveCriterion_createServerFn_handler, async ({ context, data }) => {
	const { saveCriterionFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveCriterionFor(context.userId, data));
});
var listQual_createServerFn_handler = createServerRpc({
	id: "e66bce0def16d48c33c730a9d44138e9fca02e86847a4d72d6666d11dae43bbe",
	name: "listQual",
	filename: "src/lib/school/api.ts"
}, (opts) => listQual.__executeServer(opts));
var listQual = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(listQual_createServerFn_handler, async ({ context, data }) => {
	const { qualListFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => qualListFor(context.userId, data));
});
var saveQual_createServerFn_handler = createServerRpc({
	id: "1da1333f28cbe054d4c4f2d2d1969253d0e22aee3858947dd8d7d1daa4796a09",
	name: "saveQual",
	filename: "src/lib/school/api.ts"
}, (opts) => saveQual.__executeServer(opts));
var saveQual = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveQual_createServerFn_handler, async ({ context, data }) => {
	const { saveQualFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveQualFor(context.userId, data));
});
var deleteQual_createServerFn_handler = createServerRpc({
	id: "10c69d8788f04fce67f9dea6303fe22ec19e5001c6a712a381d7664c19374f22",
	name: "deleteQual",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteQual.__executeServer(opts));
var deleteQual = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteQual_createServerFn_handler, async ({ context, data }) => {
	const { deleteQualFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteQualFor(context.userId, data));
});
var getAttendance_createServerFn_handler = createServerRpc({
	id: "9125df954d09c9833d94e28c4460e55e984063429f67f90300b78242b15f238d",
	name: "getAttendance",
	filename: "src/lib/school/api.ts"
}, (opts) => getAttendance.__executeServer(opts));
var getAttendance = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(getAttendance_createServerFn_handler, async ({ context, data }) => {
	const { attendanceFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => attendanceFor(context.userId, data));
});
var saveSession_createServerFn_handler = createServerRpc({
	id: "b3d124729e7ddd9ce87dae358f42570d8d51e2f283d387624f5528aa390c8d24",
	name: "saveSession",
	filename: "src/lib/school/api.ts"
}, (opts) => saveSession.__executeServer(opts));
var saveSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveSession_createServerFn_handler, async ({ context, data }) => {
	const { saveSessionFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveSessionFor(context.userId, data));
});
var saveMarks_createServerFn_handler = createServerRpc({
	id: "b9e5189a4091480c6dd9f23a9ae0b2d28851f60c217c8e433617fd3dc4c1fe8c",
	name: "saveMarks",
	filename: "src/lib/school/api.ts"
}, (opts) => saveMarks.__executeServer(opts));
var saveMarks = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(saveMarks_createServerFn_handler, async ({ context, data }) => {
	const { saveMarksFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => saveMarksFor(context.userId, data));
});
var deleteSession_createServerFn_handler = createServerRpc({
	id: "b31669f5bfae4a897d83057136285d209b91006ed6880f529a7438951291a43f",
	name: "deleteSession",
	filename: "src/lib/school/api.ts"
}, (opts) => deleteSession.__executeServer(opts));
var deleteSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(deleteSession_createServerFn_handler, async ({ context, data }) => {
	const { deleteSessionFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => deleteSessionFor(context.userId, data));
});
var buildExport_createServerFn_handler = createServerRpc({
	id: "10d76835ddf0aafa5185151c9ab3d39ab0f0921938391e6e55f756ffb602e96b",
	name: "buildExport",
	filename: "src/lib/school/api.ts"
}, (opts) => buildExport.__executeServer(opts));
var buildExport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(buildExport_createServerFn_handler, async ({ context, data }) => {
	const { reportFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => reportFor(context.userId, data));
});
var previewImport_createServerFn_handler = createServerRpc({
	id: "75d62bc7135e9c37aad98970dd351d82a285b56cefb9bdfcf230f3696ed2ad0c",
	name: "previewImport",
	filename: "src/lib/school/api.ts"
}, (opts) => previewImport.__executeServer(opts));
var previewImport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(previewImport_createServerFn_handler, async ({ context, data }) => {
	const { previewImportFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => previewImportFor(context.userId, data));
});
var commitImport_createServerFn_handler = createServerRpc({
	id: "f932d6cc7d88e4fc1346ad974dd7a11f783a9ee9cde5654608a85a3999926bb4",
	name: "commitImport",
	filename: "src/lib/school/api.ts"
}, (opts) => commitImport.__executeServer(opts));
var commitImport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(commitImport_createServerFn_handler, async ({ context, data }) => {
	const { commitImportFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => commitImportFor(context.userId, data));
});
var exportBackup_createServerFn_handler = createServerRpc({
	id: "93e75b2a8cd1ef3512920ab4cbc8f399e29e4e56bb164939a4d693d7fd555177",
	name: "exportBackup",
	filename: "src/lib/school/api.ts"
}, (opts) => exportBackup.__executeServer(opts));
var exportBackup = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(exportBackup_createServerFn_handler, async ({ context, data }) => {
	const { backupFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => backupFor(context.userId, data));
});
var listAudit_createServerFn_handler = createServerRpc({
	id: "4b0ec857681ae463b7d34f368ee1cc4da77c441ec4c5b237aae135008aa07f32",
	name: "listAudit",
	filename: "src/lib/school/api.ts"
}, (opts) => listAudit.__executeServer(opts));
var listAudit = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(listAudit_createServerFn_handler, async ({ context, data }) => {
	const { auditFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => auditFor(context.userId, data));
});
var joinSchool_createServerFn_handler = createServerRpc({
	id: "584e832dcd102d70a3ecaffbeaa73ec1711046decb006d98236d29f2e8398c91",
	name: "joinSchool",
	filename: "src/lib/school/api.ts"
}, (opts) => joinSchool.__executeServer(opts));
var joinSchool = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(joinSchool_createServerFn_handler, async ({ context, data }) => {
	const { joinSchoolFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => joinSchoolFor(context.userId, data));
});
var regenerateInvite_createServerFn_handler = createServerRpc({
	id: "6e1b9dc2bb3bb958af7bbb29b7c5d1dc38112e1dc4eab7c8ce9bf4e5fd72f960",
	name: "regenerateInvite",
	filename: "src/lib/school/api.ts"
}, (opts) => regenerateInvite.__executeServer(opts));
var regenerateInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(regenerateInvite_createServerFn_handler, async ({ context, data }) => {
	const { regenerateInviteFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => regenerateInviteFor(context.userId, data));
});
var updateMember_createServerFn_handler = createServerRpc({
	id: "fdc1a00636230bc9f3ec59a4716a8ee82554a9ba32fa9c6d12f77ae63ba7c965",
	name: "updateMember",
	filename: "src/lib/school/api.ts"
}, (opts) => updateMember.__executeServer(opts));
var updateMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(updateMember_createServerFn_handler, async ({ context, data }) => {
	const { updateMemberFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => updateMemberFor(context.userId, data));
});
var updateMyName_createServerFn_handler = createServerRpc({
	id: "7803330db34dbe4c51d5aa8ce092397bee4221a73753e3051d371ea153072b78",
	name: "updateMyName",
	filename: "src/lib/school/api.ts"
}, (opts) => updateMyName.__executeServer(opts));
var updateMyName = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(updateMyName_createServerFn_handler, async ({ context, data }) => {
	const { updateMyNameFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => updateMyNameFor(context.userId, data));
});
var removeMember_createServerFn_handler = createServerRpc({
	id: "01bc48173f9a20834dd4ec55b6f7bc4de968b1b170a0d0279c1cb75cbc767390",
	name: "removeMember",
	filename: "src/lib/school/api.ts"
}, (opts) => removeMember.__executeServer(opts));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(removeMember_createServerFn_handler, async ({ context, data }) => {
	const { removeMemberFor } = await import("./db-api-CzxcVOot.mjs");
	return guard(() => removeMemberFor(context.userId, data));
});
//#endregion
export { UserError as n, api_exports as t };
