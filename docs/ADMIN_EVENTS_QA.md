# Admin e eventos — auditoria e QA

> Registo histórico da ronda inicial de implementação. A exigência de
> `app_metadata.role` descrita abaixo foi posteriormente removida. A regra atual
> e validada está em `AUTH_INVITE_QA.md` e na migration
> `20260921192134_event_admin_confirmed_allowlist.sql`.

Data: 21/09/2026. Projeto exclusivo: `E:\Katia\dj-marquez-website`.
Branch: `main`. Base aprovada: `cf79de1678c99b27e8eb03a8466fe4a8e4a507b0`.
Estado: **implementado e validado localmente; integração remota pendente**. Sem commit, push ou deploy nesta ronda.

## Auditoria inicial

- React/Vite + cliente `@supabase/supabase-js` carregado dinamicamente. `persistSession` e `autoRefreshToken` já ativos; preservados. Login por email/palavra-passe, sem registo público.
- `/admin` confiava no papel presente na sessão; faltava restringir às duas contas aprovadas e verificar a identidade atual no Auth.
- Editor fazia upsert em lote; não existia eliminação nem confirmação por registo. Validação e recuperação de falhas eram insuficientes.
- `events`: UUID, `date` em texto, `name`, `location`, `info_url`, `is_visible`, `sort_order`, timestamps. Estrutura preservada; nenhuma migração da coluna de data.
- SQL local anterior tinha RLS por claim `app_metadata.role`, sem política/privilégio DELETE e sem limitar os emails. Não era evidência das políticas instaladas remotamente.
- Homepage ordenava por `sort_order`, não filtrava datas passadas e conservava silenciosamente o fallback antigo em falhas.
- Não havia configuração Supabase local. Nenhuma credencial privada foi adicionada. `.env.example` só contém campos públicos e contactos já aprovados.

## Implementação

- Autenticação: sessão inicial/renovada verificada por `getUser`, listener sem chamadas Auth dentro do lock, timeout e saída explícita em erro. O editor aguarda autorização inicial; refresh do token do mesmo utilizador preserva o rascunho durante a verificação. React StrictMode não deixa o carregamento bloqueado.
- Autorização UI: apenas `lachefbino@gmail.com` e `marquesandre112005@gmail.com`, email confirmado, utilizador não anónimo e `app_metadata.role = admin`. A mesma verificação atual é exigida antes de cada escrita. `user_metadata` nunca concede acesso.
- CRUD: insert individual, update filtrado por UUID, delete filtrado por UUID e precedido de confirmação. Sucesso só após resposta com o identificador esperado; falhas preservam o formulário. Operações concorrentes por clique ficam bloqueadas.
- Validação: data real, nome/local obrigatórios e limitados, URL HTTP(S) sem credenciais, UUID, visibilidade e ordem. Duplicação acidental por data/nome/local na lista carregada é rejeitada. Não foi criada uma constraint única sem auditar os dados reais; criação simultânea por dois administradores com UUIDs diferentes continua uma limitação conhecida.
- Agenda: inclui hoje no fuso `Europe/Lisbon`, omite passado/ocultos/datas inválidas, ordena por data. Lê o formato PT antigo e guarda ISO. URLs inválidos não geram links; links válidos usam `noopener noreferrer`.
- Atualização pública ao regressar ao separador e a cada minuto visível. Sucesso remoto vazio é um estado vazio real, não ativa fallback. Em falha há aviso visível, warning sem credenciais e fallback sujeito à mesma filtragem. O Midnight histórico não reaparece como próximo evento.
- Configuração: publishable existente preservada; alias opcional `VITE_SUPABASE_ANON_KEY`. Validação rejeita chaves privadas e endpoints inseguros; build interrompido em configuração inválida.
- SQL proposto: transação, sem apagar eventos/criar utilizadores/atribuir papéis. Helper privado com `search_path` vazio, execução restrita e leitura do papel atual em `auth.users`, associado a `auth.uid()`. RLS permite leitura pública dos publicados e CRUD apenas às duas contas aprovadas. Políticas desconhecidas interrompem o script para revisão. **Não aplicado ao Supabase.**

## Validação local executada

- `node --test tests/*.test.js`: **12/12 passaram** (5 Booking existentes + 7 grupos focados em eventos, datas, autorização, configuração e contrato do repositório).
- `npm.cmd run build`: passou (Vite 8.3.0).
- `git diff --check`: passou; apenas avisos de normalização LF/CRLF do Git em Windows.
- PostgreSQL 17 em container descartável, `--network none`, sem portas publicadas. `tests/events-rls.sql` aplicado sobre tabelas Auth de teste: leitura anon apenas publicados, insert/update/delete negados à terceira conta, CRUD aprovado, segunda conta aprovada, email não confirmado recusado, `user_metadata` forjado recusado, revogação do papel efetiva e reaplicação do SQL sem perder os registos. Todos passaram. Política extra desconhecida fez a transação parar como previsto. Container criado para o teste removido no final.
- Browser Chromium do Codex, `http://127.0.0.1:5173/admin`: sem configuração, mostra indisponibilidade e não expõe editor.
- `tests/fixtures/admin.html`: simulação **explicitamente identificada**, sem URL/chave Supabase e sem rede de autenticação/dados. Componentes e hooks reais sob React StrictMode com cliente injetado. Confirmados: login simulado, conta não autorizada, logout, sessão após refresh, sessão expirada, criar, editar sem duplicar, cancelar eliminação, confirmar eliminação, erros de leitura/escrita, manutenção do formulário, estados vazios, agenda ordenada, hoje incluído, passado/ocultos excluídos e link ausente sem botão morto. O preenchimento automatizado do input nativo de data precisou de eventos DOM de input/change; não é um teste de teclado/calendário num iPhone físico.
- Responsividade: formulário/lista/agenda em **320, 360, 375, 390, 430 e 1440px**. `scrollWidth == clientWidth` em todos; campos e botões dentro do viewport, inputs de texto a 16px. Inspeção visual a 390px e 1440px com a tipografia do site.
- Homepage real sem Supabase nas mesmas seis larguras: sem overflow e com aviso de indisponibilidade; fallback histórico excluído. Nenhum novo erro de aplicação na consola; apenas warnings esperados ao simular falha da agenda.
- Booking, WhatsApp, YouTube, Hero, Gallery, Arquivo, App/ordem das secções e marca não foram alterados. Não foi repetido o QA integral de funcionalidades fora deste âmbito; os testes Booking existentes continuam verdes.

## Supabase real — pendente

A ligação anterior só listava um projeto Evolution, explicitamente identificado pelo utilizador como alheio a este site. Nenhuma tabela desse projeto foi consultada ou alterada.

Após a troca de conta, o utilizador indicou a organização **PiriLight Studio**, com dois projetos incluindo DJ M4rquez. A instalação passou a constar como ativa, mas as chamadas de inventário falharam com `Unknown tool` em `supabase.list_projects` / `supabase.list_organizations`. Assim, o identificador, schema, políticas, contas e dados do projeto DJ M4rquez **ainda não foram verificados**. Nenhuma alteração remota foi executada.

Passos pendentes após recuperar a ligação:

1. Confirmar organização, nome e identificador do projeto correto; inspecionar tabela, grants, RLS e as duas contas Auth (sem recolher passwords ou chaves privadas).
2. Comparar o SQL preparado com o schema/políticas reais; rever e autorizar a aplicação concreta antes de alterar acessos remotos. Não executar testes SQL/fixtures no projeto real.
3. Configurar apenas URL e chave pública do projeto em `.env.local`; nenhum valor fictício foi usado para declarar esta integração funcional.
4. Validar login real, refresh, logout, autorização e CRUD com dados de QA explicitamente autorizados, além da leitura pública e das políticas reais. Não há confirmação de produção nem deploy.

## Ficheiros

Modificados: `.env.example`, `README.md`, `vite.config.js`, `supabase/events.sql`, `src/data/defaultEvents.js`, `src/hooks/useEvents.js`, `src/lib/supabase.js`, `src/sections/Admin.jsx`, `src/sections/Events.jsx`, `src/styles/global.css` (regras limitadas a admin/eventos).

Criados: `src/config/admin.js`, `src/hooks/useAdminSession.js`, `src/lib/eventRepository.js`, `src/utils/authRequest.js`, `src/utils/events.js`, `src/utils/supabaseConfig.js`, `tests/events.test.js`, `tests/events-rls.sql`, `tests/fixtures/admin.html`, `tests/fixtures/admin.jsx`, este relatório.

## Referências oficiais consultadas

- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange

## Reproduzir os testes isolados

`node --test tests/*.test.js` e `npm run build` não precisam de credenciais.

Para o teste RLS usar **apenas um novo container descartável**, nunca a base real: `docker run --detach --rm --network none --name dj-events-qa --env POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine`; copiar `supabase/events.sql` para `/tmp/events.sql` e `tests/events-rls.sql` para `/tmp/events-rls.sql` no container; executar `docker exec dj-events-qa psql -U postgres -v ON_ERROR_STOP=1 -f /tmp/events-rls.sql`. Terminar apenas esse container de teste com `docker stop dj-events-qa`.

A página `/tests/fixtures/admin.html` só é servida pelo dev server. Os seus registos são descartáveis e em memória; a identidade de teste usa uma chave `dj-admin-qa-user` em sessionStorage, separada do Supabase. Sair na fixture limpa essa identidade. Não é importada por `App.jsx` e não faz parte de `dist`.
