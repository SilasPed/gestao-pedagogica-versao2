export const DEFAULT_SCALE = [
  "Excelente",
  "Bom",
  "Em desenvolvimento",
  "Necessita de acompanhamento",
] as const;

export const DEFAULT_CRITERIA: { name: string; description: string }[] = [
  {
    name: "Participação nas aulas",
    description: "Envolve-se nas propostas da aula, responde quando solicitado e acompanha o encaminhamento.",
  },
  {
    name: "Realização das atividades",
    description: "Entrega as atividades propostas no prazo combinado e conforme as orientações dadas.",
  },
  {
    name: "Organização e responsabilidade",
    description: "Traz o material, registra o que foi pedido e cuida dos combinados da turma.",
  },
  {
    name: "Autonomia na aprendizagem",
    description: "Busca resolver o que consegue sozinho e pede ajuda quando encontra um obstáculo concreto.",
  },
  {
    name: "Colaboração em equipe",
    description: "Contribui nas tarefas em grupo e escuta os colegas durante o trabalho.",
  },
  {
    name: "Respeito às regras de convivência",
    description: "Cumpre os combinados de convivência da turma e da escola.",
  },
  {
    name: "Evolução individual",
    description: "Mostra avanço em relação ao que já conseguia fazer nas aulas anteriores.",
  },
  {
    name: "Dificuldades de aprendizagem",
    description: "Registra obstáculos observáveis em um conteúdo ou procedimento, sem diagnóstico e sem rótulo pessoal.",
  },
  {
    name: "Pontos fortes e aspectos a desenvolver",
    description: "Descreve o que o estudante já demonstra com segurança e o que ainda pede prática orientada.",
  },
];

export const ASSESSMENT_KINDS = [
  { id: "prova", label: "Prova" },
  { id: "trabalho", label: "Trabalho" },
  { id: "atividade", label: "Atividade" },
  { id: "projeto", label: "Projeto" },
  { id: "participacao", label: "Participação" },
  { id: "recuperacao", label: "Recuperação" },
] as const;

export type AssessmentKind = (typeof ASSESSMENT_KINDS)[number]["id"];

export const STUDENT_STATUSES = [
  { id: "ativo", label: "Ativo" },
  { id: "transferido", label: "Transferido" },
  { id: "concluido", label: "Concluído" },
  { id: "inativo", label: "Inativo" },
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number]["id"];

export const MARK_STATUSES = [
  { id: "graded", label: "Nota" },
  { id: "pending", label: "Pendente" },
  { id: "absent", label: "Ausência" },
  { id: "excused", label: "Dispensa" },
  { id: "na", label: "Não aplicável" },
] as const;

export const FREQ_MARKS = [
  { id: "present", label: "Presente" },
  { id: "absent", label: "Falta" },
  { id: "justified", label: "Falta justificada" },
  { id: "late", label: "Atraso" },
  { id: "pending", label: "Registro pendente" },
] as const;

export type PeriodModel = "bimestre" | "trimestre" | "semestre";

export function periodNames(model: PeriodModel): string[] {
  const count = model === "bimestre" ? 4 : model === "trimestre" ? 3 : 2;
  const word = model === "bimestre" ? "bimestre" : model === "trimestre" ? "trimestre" : "semestre";
  return Array.from({ length: count }, (_, i) => `${i + 1}º ${word}`);
}

export const FIELD_ALIASES: Record<string, string[]> = {
  fullName: ["nome", "nome completo", "aluno", "estudante", "nome do aluno"],
  enrollment: ["matricula", "ra", "codigo", "codigo escolar", "registro", "numero de matricula"],
  year: ["ano", "ano letivo", "ano escolar"],
  series: ["serie", "ano serie", "serie ano"],
  className: ["turma", "classe"],
  course: ["curso", "curso tecnico", "habilitacao"],
  status: ["situacao", "status", "situacao do aluno"],
  notes: ["observacoes", "observacao", "anotacoes"],
  subject: ["disciplina", "materia", "componente", "componente curricular"],
  period: ["bimestre", "periodo", "trimestre", "semestre", "etapa"],
  assessment: ["avaliacao", "prova", "atividade", "instrumento", "descricao da avaliacao"],
  score: ["nota", "valor", "nota obtida", "aproveitamento"],
  weight: ["peso"],
  maxScore: ["nota maxima", "valor maximo", "maximo"],
  kind: ["tipo", "tipo de avaliacao"],
  date: ["data", "data da avaliacao", "dia"],
  scoreStatus: ["situacao da nota", "lancamento", "status da nota"],
  criterion: ["criterio", "aspecto"],
  level: ["nivel", "conceito", "escala", "descritor"],
  comment: ["comentario", "comentario pedagogico", "parecer"],
  teacher: ["professor", "professor responsavel", "docente"],
  recovery: ["recuperacao", "e recuperacao"],
};

export type ImportKind = "students" | "scores" | "classes" | "assessments" | "qualitative";

export const IMPORT_FIELDS: Record<ImportKind, { key: string; label: string; required: boolean }[]> = {
  students: [
    { key: "fullName", label: "Nome completo", required: true },
    { key: "enrollment", label: "Matrícula", required: false },
    { key: "year", label: "Ano letivo", required: false },
    { key: "series", label: "Série", required: false },
    { key: "className", label: "Turma", required: false },
    { key: "course", label: "Curso técnico", required: false },
    { key: "status", label: "Situação", required: false },
    { key: "notes", label: "Observações", required: false },
  ],
  scores: [
    { key: "fullName", label: "Nome completo", required: false },
    { key: "enrollment", label: "Matrícula", required: false },
    { key: "series", label: "Série", required: false },
    { key: "className", label: "Turma", required: true },
    { key: "subject", label: "Disciplina", required: true },
    { key: "period", label: "Período", required: false },
    { key: "assessment", label: "Avaliação", required: true },
    { key: "score", label: "Nota", required: false },
    { key: "scoreStatus", label: "Situação da nota", required: false },
    { key: "weight", label: "Peso", required: false },
    { key: "maxScore", label: "Nota máxima", required: false },
    { key: "kind", label: "Tipo", required: false },
    { key: "date", label: "Data", required: false },
  ],
  classes: [
    { key: "series", label: "Série", required: true },
    { key: "className", label: "Turma", required: true },
    { key: "course", label: "Curso técnico", required: false },
    { key: "year", label: "Ano letivo", required: false },
    { key: "teacher", label: "Professor responsável", required: false },
  ],
  assessments: [
    { key: "series", label: "Série", required: false },
    { key: "className", label: "Turma", required: true },
    { key: "subject", label: "Disciplina", required: true },
    { key: "period", label: "Período", required: false },
    { key: "assessment", label: "Avaliação", required: true },
    { key: "kind", label: "Tipo", required: false },
    { key: "date", label: "Data", required: false },
    { key: "weight", label: "Peso", required: false },
    { key: "maxScore", label: "Nota máxima", required: false },
    { key: "recovery", label: "Recuperação", required: false },
  ],
  qualitative: [
    { key: "fullName", label: "Nome completo", required: false },
    { key: "enrollment", label: "Matrícula", required: false },
    { key: "criterion", label: "Critério", required: true },
    { key: "period", label: "Período", required: false },
    { key: "date", label: "Data", required: false },
    { key: "level", label: "Nível", required: true },
    { key: "comment", label: "Comentário", required: false },
  ],
};
