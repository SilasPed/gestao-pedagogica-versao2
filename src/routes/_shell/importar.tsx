import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSchool } from "@/components/school-context";
import { Button, controlClass, errText } from "@/components/ui";
import { commitImport, previewImport } from "@/lib/school/api";
import { IMPORT_FIELDS, type ImportKind } from "@/lib/school/constants";
import { downloadDemo430, downloadTemplate, readSpreadsheet } from "@/lib/school/files";
import { autoMap, detectHeaderRow, sheetRecords } from "@/lib/school/import-logic";
import type { ImportMode } from "@/lib/school/import-logic";

export const Route = createFileRoute("/_shell/importar")({ component: ImportPage });

const KINDS: { id: ImportKind; label: string }[] = [
  { id: "students", label: "Cadastro de estudantes" },
  { id: "scores", label: "Notas" },
  { id: "classes", label: "Turmas" },
  { id: "assessments", label: "Avaliações" },
  { id: "qualitative", label: "Registros qualitativos" },
];

const MODES: { id: ImportMode; label: string; hint: string }[] = [
  { id: "add", label: "Adicionar", hint: "Inclui só quem ainda não existe. Quem já está cadastrado fica intocado." },
  { id: "update", label: "Atualizar", hint: "Altera apenas registros achados por matrícula ou, se você confirmar, pelo nome." },
  { id: "merge", label: "Mesclar", hint: "Inclui os novos e atualiza os que já existem, depois da prévia." },
];

type Sheet = { name: string; rows: unknown[][] };
type Summary = { added: number; updated: number; ignored: number; rejected: number };

type PlanLine = { row: number; action: "add" | "update" | "ignore" | "reject"; message: string };

function ImportPage() {
  const { workspace, yearId, refresh } = useSchool();
  const [kind, setKind] = useState<ImportKind>("students");
  const [mode, setMode] = useState<ImportMode>("merge");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [sheetName, setSheetName] = useState("");
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<Record<string, number | null>>({});
  const [allowNameMatch, setAllowNameMatch] = useState(false);
  const [allowSameName, setAllowSameName] = useState(false);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [preview, setPreview] = useState<{ summary: Summary; plans: PlanLine[]; totalPlans: number } | null>(null);
  const [report, setReport] = useState<{ summary: Summary; issues: { row: number; message: string }[]; stopped?: string } | null>(null);

  const sheet = sheets.find((item) => item.name === sheetName) ?? sheets[0];
  const headers = useMemo(() => {
    const row = sheet?.rows[headerIndex] ?? [];
    return row.map((cell, index) => (cell == null || String(cell).trim() === "" ? `Coluna ${index + 1}` : String(cell)));
  }, [sheet, headerIndex]);
  const records = useMemo(() => (sheet ? sheetRecords(sheet.rows, headerIndex, mapping) : []), [sheet, headerIndex, mapping]);
  const fields = IMPORT_FIELDS[kind];
  const missingRequired = fields.filter((field) => field.required && mapping[field.key] == null);

  if (!workspace || !yearId) return <p className="text-sm text-muted">Carregando a escola…</p>;

  async function onFile(file: File | undefined) {
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

  function changeKind(next: ImportKind) {
    setKind(next);
    setPreview(null);
    setReport(null);
    if (sheet) setMapping(autoMap(headers, next));
  }

  function changeSheet(name: string) {
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
    if ((kind === "scores" || kind === "qualitative") && mapping.enrollment == null && !allowNameMatch) {
      toast.message("Sem matrícula mapeada. A prévia vai pedir confirmação antes de usar só o nome.");
    }
    setBusy("preview");
    setReport(null);
    try {
      const summary = emptySummary();
      const plans: PlanLine[] = [];
      let totalPlans = 0;
      for (const chunk of chunks(records, 1000)) {
        const result = await previewImport({
          data: {
            schoolId: workspace!.school.id,
            kind,
            mode,
            allowNameMatch,
            allowSameName,
            yearId: yearId ?? "",
            records: chunk,
          },
        });
        addSummary(summary, result.summary);
        totalPlans += result.totalPlans;
        plans.push(...result.plans);
      }
      setPreview({ summary, plans: plans.slice(0, 320), totalPlans });
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
    const issues: { row: number; message: string }[] = [];
    let done = 0;
    try {
      for (const chunk of chunks(records, 1000)) {
        const result = await commitImport({
          data: {
            schoolId: workspace!.school.id,
            kind,
            mode,
            allowNameMatch,
            allowSameName,
            yearId: yearId ?? "",
            records: chunk,
          },
        });
        addSummary(summary, result.summary);
        issues.push(...result.issues);
        done += chunk.length;
      }
      setReport({ summary, issues: issues.slice(0, 200) });
      setPreview(null);
      await refresh();
      toast.success("Importação concluída.");
    } catch (error) {
      setReport({
        summary,
        issues,
        stopped: `A gravação parou depois de ${done} linhas. O que já entrou permanece. ${errText(error)}`,
      });
      await refresh();
      toast.error("A importação foi interrompida. Veja o relatório parcial.");
    } finally {
      setBusy(null);
    }
  }

  const sample = (sheet?.rows.slice(headerIndex, headerIndex + 6) ?? []).map((row) => headers.map((_, index) => cellText(row[index])));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Importar planilha</h1>
          <p className="max-w-2xl text-sm text-pretty text-muted">
            Excel ou CSV. A nota entra pela matrícula, não pela ordem das linhas. Célula vazia não vira zero. Nada é gravado antes da confirmação.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="soft" onClick={() => downloadTemplate(kind)}>Modelo desta importação</Button>
          <Button type="button" variant="ghost" onClick={() => downloadDemo430()}>Planilha fictícia de 430 alunos</Button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {KINDS.map((item) => (
          <button key={item.id} type="button" onClick={() => changeKind(item.id)} className={choice(kind === item.id)}>
            {item.label}
          </button>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {MODES.map((item) => (
          <button key={item.id} type="button" onClick={() => { setMode(item.id); setPreview(null); }} className={choice(mode === item.id)}>
            <span className="block font-semibold">{item.label}</span>
            <span className="mt-1 block text-sm text-muted">{item.hint}</span>
          </button>
        ))}
      </section>

      <section className="rounded-card border border-line bg-card p-4">
        <h2 className="text-xl">1. Arquivo</h2>
        <input
          className="mt-3 block w-full text-sm"
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          aria-label="Arquivo da planilha"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        {fileName ? <p className="mt-2 text-sm text-muted">{fileName}</p> : null}
      </section>

      {sheet ? (
        <>
          <section className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">2. Aba</span>
              <select className={controlClass} value={sheet.name} onChange={(event) => changeSheet(event.target.value)} aria-label="Aba da planilha">
                {sheets.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">3. Linha do cabeçalho</span>
              <input
                className={controlClass}
                type="number"
                min={1}
                max={Math.max(1, sheet.rows.length)}
                value={headerIndex + 1}
                onChange={(event) => {
                  const next = Math.max(0, Number(event.target.value) - 1);
                  setHeaderIndex(next);
                  setMapping(autoMap(headerRow(sheet.rows, next), kind));
                  setPreview(null);
                }}
              />
            </label>
          </section>

          <section className="rounded-card border border-line bg-card p-4">
            <h2 className="text-xl">4. Mapear colunas</h2>
            <p className="mt-1 text-sm text-muted">Ano de destino: {workspace.years.find((year) => year.id === yearId)?.label}. Troque o ano no topo se a planilha for de outro período.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">{field.label}{field.required ? " *" : ""}</span>
                  <select
                    className={controlClass}
                    aria-label={field.label}
                    value={mapping[field.key] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value === "" ? null : Number(event.target.value);
                      setMapping((current) => ({ ...current, [field.key]: value }));
                      setPreview(null);
                    }}
                  >
                    <option value="">Não usar</option>
                    {headers.map((header, index) => <option key={`${header}-${index}`} value={index}>{header}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <label className="flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={allowNameMatch} onChange={(event) => { setAllowNameMatch(event.target.checked); setPreview(null); }} />
                Confirmo a mescla pelo nome quando não houver matrícula confiável
              </label>
              <label className="flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={allowSameName} onChange={(event) => { setAllowSameName(event.target.checked); setPreview(null); }} />
                Permitir outro estudante com o mesmo nome e matrícula diferente
              </label>
            </div>
          </section>

          <section className="overflow-auto rounded-card border border-line bg-card">
            <h2 className="px-4 pt-4 text-xl">5. Amostra</h2>
            <p className="px-4 text-sm text-muted">{records.length} linhas com algum dado. As linhas de exemplo fictício também entram se você não apagá-las.</p>
            <table className="mt-2 w-full min-w-[640px] text-sm">
              <thead className="bg-soft text-left">
                <tr>{headers.map((header) => <th key={header} className="px-3 py-2 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody>
                {sample.slice(1).map((row, index) => (
                  <tr key={index} className="border-t border-line">
                    {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-2">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="soft" disabled={busy != null} onClick={() => void validate()}>
              {busy === "preview" ? "Validando…" : "6. Validar"}
            </Button>
            <Button type="button" disabled={busy != null || !preview} onClick={() => void confirm()}>
              {busy === "commit" ? "Gravando…" : "7. Confirmar importação"}
            </Button>
          </div>
        </>
      ) : null}

      {preview ? (
        <ReportCard
          title="Prévia — nada foi gravado ainda"
          summary={preview.summary}
          lines={preview.plans.map((plan) => ({ row: plan.row, message: `${labelAction(plan.action)}: ${plan.message}` }))}
          extra={preview.totalPlans > preview.plans.length ? `Mostrando ${preview.plans.length} de ${preview.totalPlans} linhas. Os totais acima consideram o arquivo inteiro.` : null}
        />
      ) : null}
      {report ? (
        <ReportCard
          title="8. Relatório da importação"
          summary={report.summary}
          lines={report.issues}
          extra={report.stopped ?? null}
        />
      ) : null}
    </div>
  );
}

function ReportCard({ title, summary, lines, extra }: { title: string; summary: Summary; lines: { row: number; message: string }[]; extra: string | null }) {
  return (
    <section className="rounded-card border border-line bg-card p-4">
      <h2 className="text-xl">{title}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-4 text-sm">
        <li className="rounded-card bg-soft px-3 py-2"><strong className="tabular-nums">{summary.added}</strong> adicionados</li>
        <li className="rounded-card bg-soft px-3 py-2"><strong className="tabular-nums">{summary.updated}</strong> atualizados</li>
        <li className="rounded-card bg-soft px-3 py-2"><strong className="tabular-nums">{summary.ignored}</strong> ignorados</li>
        <li className="rounded-card bg-soft px-3 py-2"><strong className="tabular-nums">{summary.rejected}</strong> rejeitados</li>
      </ul>
      {extra ? <p className="mt-3 text-sm text-danger">{extra}</p> : null}
      <ul className="mt-3 flex max-h-80 flex-col gap-1 overflow-auto text-sm">
        {lines.length === 0 ? <li className="text-muted">Nenhuma observação de linha.</li> : null}
        {lines.map((line, index) => <li key={`${line.row}-${index}`}>Linha {line.row}: {line.message}</li>)}
      </ul>
    </section>
  );
}

function choice(active: boolean) {
  return `rounded-card border p-3 text-left text-sm ${active ? "border-pine bg-soft" : "border-line bg-card"}`;
}

function headerRow(rows: unknown[][], index: number) {
  return (rows[index] ?? []).map((cell) => (cell == null ? "" : String(cell)));
}

function cellText(value: unknown) {
  if (value == null) return "";
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  return String(value);
}

function emptySummary(): Summary {
  return { added: 0, updated: 0, ignored: 0, rejected: 0 };
}

function addSummary(target: Summary, extra: Summary) {
  target.added += extra.added;
  target.updated += extra.updated;
  target.ignored += extra.ignored;
  target.rejected += extra.rejected;
}

function chunks<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
}

function labelAction(action: PlanLine["action"]) {
  if (action === "add") return "Novo";
  if (action === "update") return "Atualizar";
  if (action === "ignore") return "Ignorado";
  return "Rejeitado";
}
