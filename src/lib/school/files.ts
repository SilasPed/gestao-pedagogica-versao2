import type { ReportBundle, Sheet } from "./reports.ts";
import { IMPORT_FIELDS, type ImportKind } from "./constants.ts";

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadXlsx(filename: string, sheets: Sheet[]) {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const rows = sheet.rows.map((row) => row.map((cell) => (cell == null ? "" : cell)));
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), sheet.name.slice(0, 31) || "Planilha");
  }
  XLSX.writeFile(book, filename);
}

export function downloadCsv(filename: string, sheet: Sheet) {
  const lines = sheet.rows.map((row) =>
    row
      .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
      .join(";"),
  );
  downloadBlob(filename, new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
}

async function fontBase64() {
  const response = await fetch("/fonts/SourceSans3-Regular.ttf");
  if (!response.ok) throw new Error("Não foi possível carregar a fonte do PDF.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  const size = 0x8000;
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size));
  }
  return btoa(binary);
}

export async function downloadPdf(filename: string, report: ReportBundle) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const font = await fontBase64();
  doc.addFileToVFS("SourceSans3-Regular.ttf", font);
  doc.addFont("SourceSans3-Regular.ttf", "SourceSans", "normal");
  doc.setFont("SourceSans");
  if (report.bulletins.length) {
    report.bulletins.forEach((bulletin, index) => {
      if (index) doc.addPage();
      doc.setFont("SourceSans");
      doc.setFontSize(16);
      doc.text("Boletim individual", 40, 42);
      doc.setFontSize(11);
      doc.text(`${bulletin.studentName} · ${bulletin.className} · ${bulletin.year}`, 40, 64);
      doc.text(`Matrícula ${bulletin.enrollment} · Curso ${bulletin.course}`, 40, 80);
      doc.text(`Situação: ${bulletin.situation} · Média: ${bulletin.average}`, 40, 96);
      autoTable(doc, {
        startY: 112,
        head: [["Disciplina", "Período", "Regular", "Recuperação", "Resultado", "Situação"]],
        body: bulletin.rows.map((row) => [row.subject, row.period, row.regular, row.recovery, row.final, row.situation]),
        styles: { font: "SourceSans", fontSize: 9, textColor: 30 },
        headStyles: { fillColor: [27, 77, 62], textColor: 255 },
      });
      const finalY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 120;
      doc.setFontSize(10);
      const lines = bulletin.comparisons.slice(0, 4);
      doc.text(lines.length ? lines : ["Sem comparação entre períodos."], 40, finalY + 24, { maxWidth: 740 });
      if (bulletin.qualitative.length) {
        doc.text("Registros qualitativos solicitados neste arquivo:", 40, finalY + 70);
        doc.text(
          bulletin.qualitative.slice(0, 6).map((item) => `${item.criterion}: ${item.level}`),
          40,
          finalY + 86,
          { maxWidth: 740 },
        );
      }
    });
  } else {
    report.sheets.forEach((sheet, index) => {
      if (index) doc.addPage();
      doc.setFont("SourceSans");
      doc.setFontSize(14);
      doc.text(report.title, 40, 40);
      doc.setFontSize(11);
      doc.text(sheet.name, 40, 58);
      const [head, ...body] = sheet.rows;
      autoTable(doc, {
        startY: 72,
        head: [((head ?? []) as (string | number | null)[]).map((cell) => String(cell ?? ""))],
        body: body.map((row) => row.map((cell) => (cell == null ? "" : String(cell)))),
        styles: { font: "SourceSans", fontSize: 8, textColor: 30 },
        headStyles: { fillColor: [27, 77, 62], textColor: 255 },
      });
    });
  }
  doc.save(filename);
}

export async function readSpreadsheet(file: File) {
  const XLSX = await import("xlsx");
  const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  return book.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json(book.Sheets[name], { header: 1, raw: true, defval: null }) as unknown[][],
  }));
}

export async function downloadTemplate(kind: ImportKind) {
  const headers = IMPORT_FIELDS[kind].map((field) => field.label);
  const example: Record<ImportKind, string[]> = {
    students: ["Aluno Fictício 001", "FICTICIO-0001", "2026", "1", "A", "Informática", "ativo", "EXEMPLO FICTÍCIO — apague esta linha"],
    scores: ["Aluno Fictício 001", "FICTICIO-0001", "1", "A", "Física", "1º bimestre", "Prova 1", "7,5", "", "2", "10", "prova", "11/03/2026"],
    classes: ["2", "A", "Administração", "2026", "Professora Fictícia"],
    assessments: ["1", "A", "Física", "1º bimestre", "Trabalho", "trabalho", "20/03/2026", "1", "10", "não"],
    qualitative: ["Aluno Fictício 001", "FICTICIO-0001", "Participação nas aulas", "1º bimestre", "11/04/2026", "Bom", "EXEMPLO FICTÍCIO"],
  };
  await downloadXlsx(`modelo-${kind}.xlsx`, [{ name: "Modelo", rows: [headers, example[kind]] }]);
}

export async function downloadDemo430() {
  const rows: (string | number | null)[][] = [["Nome completo", "Matrícula", "Ano letivo", "Série", "Turma", "Curso técnico", "Situação", "Observações"]];
  const courses = ["Informática", "Administração", "Eletrotécnica"];
  const letters = ["A", "B", "C"];
  for (let index = 1; index <= 430; index += 1) {
    rows.push([
      `Aluno Fictício ${String(index).padStart(3, "0")}`,
      `FICTICIO-${String(index).padStart(4, "0")}`,
      "2026",
      String((index % 3) + 1),
      letters[index % 3],
      courses[index % 3],
      "ativo",
      "REGISTRO FICTÍCIO DE TESTE — não é um estudante real",
    ]);
  }
  await downloadXlsx("planilha-ficticia-430-alunos.xlsx", [{ name: "Alunos", rows }]);
}

export async function saveReport(format: "xlsx" | "csv" | "pdf", report: ReportBundle) {
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "pdf") return downloadPdf(`relatorio-${stamp}.pdf`, report);
  if (format === "csv") return downloadCsv(`relatorio-${stamp}.csv`, report.sheets[0] ?? { name: "Relatório", rows: [] });
  return downloadXlsx(`relatorio-${stamp}.xlsx`, report.sheets);
}
