# Gestão Pedagógica

Aplicação de gestão acadêmica do Ensino Médio integrado. A interface atual está na branch `redesign/visual-saas`. A branch `main` não recebe merge automático.

## Executar

```bash
npm install
npm run dev
```

Outros comandos do `package.json`: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

O build gera `.vercel/output/`. Essa pasta, capturas de tela e o log de preview não entram no Git.

## Ambiente

Não crie um arquivo `.env` neste workspace. Em publicação, a plataforma injeta:

- `DATABASE_URL` — Postgres. Sem essa variável, o servidor usa PGLite local.
- `BETTER_AUTH_SECRET` — sessão. O preview gera um segredo só do processo.
- `VITE_AUTH_ENABLED` — só `"false"` desliga a autenticação. Omitir mantém o login ligado.

Não registre senhas, códigos de convite nem notas de estudantes em log. Falhas inesperadas da API gravam apenas o tipo do erro.

## Acesso

Cada conta vê somente as escolas em que é membro. Papéis:

- `admin` — escola, equipe, convite e exclusões administrativas.
- `coordenacao` — critérios de cálculo, anos, cursos e cópia integral.
- `professor` — cadastro, diário, frequência e relatórios. Se houver disciplinas marcadas no acesso, notas, avaliações e frequência com disciplina ficam limitadas a elas.

Aula sem disciplina continua visível para o professor com escopo. Avaliação qualitativa não é separada por disciplina: o critério é da escola, não uma nota.

## Regras já implementadas

- Célula vazia não vira zero. Zero lançado permanece zero.
- Média simples ou ponderada, conforme a configuração da escola.
- Recuperação não apaga o lançamento original. A política pode substituir o período só se for maior, tirar a média com a original ou apenas registrar.
- Ausência na avaliação só entra como zero se a escola ligar essa opção.
- Frequência: registro pendente fica fora do percentual. Falta justificada e atraso seguem a regra da escola (presença, falta ou ignorar).
- Situação acadêmica não rotula o estudante como reprovado.

Não altere essas regras sem uma decisão pedagógica explícita.
