# Ativação remota Supabase — DJ M4rquez

> Registo histórico da primeira ativação remota. As indicações abaixo sobre
> `app_metadata.role` e ausência do fluxo de convite foram posteriormente
> substituídas por `AUTH_INVITE_QA.md` e pela migration
> `20260921192134_event_admin_confirmed_allowlist.sql`.

## Âmbito e autorização

Projeto exclusivo: PiriLight Studio / DJ-M4RQUEZ / `zfmodhonrngbmdyyifnt` / `eu-west-1`.
Ativação autorizada pelo pedido de `fd436c70-b730-4065-aa67-b61c7f853f52/Texto colado.txt`.
Git: `main`, checkpoint publicado `cf79de1678c99b27e8eb03a8466fe4a8e4a507b0`; alterações locais anteriores preservadas. Sem commit, push ou deploy.
Este relatório atualiza o estado remoto descrito como pendente em `ADMIN_EVENTS_QA.md`; os resultados anteriores desse relatório mantêm-se como histórico.

## Executado remotamente

Antes da aplicação, foi reconfirmada a ausência de `public.events`, do schema `private` e das duas contas aprovadas. O ficheiro `supabase/events.sql` foi relido: apenas objetos/grants/políticas de eventos, sem apagar dados, sem modificar Auth e sem objetos fora do âmbito.

Aplicada a migração `create_events_with_approved_admin_rls`, com o SQL preparado, pelo conector Supabase. Resultado: sucesso. Inspeção posterior confirmou:

- `public.events`: `id uuid`, `date text`, `name text`, `location text`, `info_url text` opcional, `is_visible boolean`, `sort_order integer`, `created_at`/`updated_at timestamptz`.
- Chave primária UUID e índice único `events_pkey`; constraint `events_info_url_http` para HTTP(S). Restantes defaults/NOT NULL correspondem ao ficheiro local.
- RLS ativa desde a criação; nunca desativada.
- Cinco políticas, sem políticas adicionais: leitura pública dos visíveis; SELECT administrativo; INSERT administrativo; UPDATE com USING e WITH CHECK; DELETE administrativo.
- `anon`: apenas SELECT. `authenticated`: SELECT/INSERT/UPDATE/DELETE sujeitos à RLS, não autorização de escrita irrestrita.
- Helper `private.is_event_admin()`: SECURITY DEFINER, `search_path = ''`, consulta apenas a identidade associada a `auth.uid()`, email aprovado/confirmado, não anónimo e papel admin em `auth.users.raw_app_meta_data`. Não usa `user_metadata` nem confia num papel forjado no pedido.
- `anon` sem EXECUTE no helper; `authenticated` só pode obter o booleano da sua própria identidade. Nenhuma destas roles tem SELECT direto em `auth.users`.
- Schema privado não exposto: leitura da API com `Accept-Profile: private` devolveu `406 / PGRST106 / Invalid schema: private`.
- Security Advisor: lista de lints vazia.

## Testes remotos realizados

Testes negativos executados numa transação terminada com ROLLBACK, usando SET LOCAL ROLE para testar efetivamente as roles PostgreSQL. Não foram criadas contas nem fabricados tokens de login.

- `anon`: SELECT permitido; INSERT, UPDATE e DELETE recusados por permissões.
- `authenticated` genérico, sem identidade administrativa, incluindo claim `user_metadata.role=admin`: helper devolveu false; INSERT recusado por RLS.
- UPDATE e DELETE genéricos devolveram zero linhas numa tabela vazia. Os predicados RLS de ambas as operações foram inspecionados; isto **não substitui** um teste com registos e sessões reais.
- API pública, usando apenas a publishable key configurada: `200`, resultado `[]`, sem `PGRST205`.
- Contagem final em `public.events`: **0**, igual ao estado inicial após criação da tabela. Nenhum evento QA persistiu; não houve evento a eliminar.

O ciclo positivo de criar/ler/editar/apagar UM evento QA fica pendente: não existe ainda um administrador ativo e não foi usada uma role privilegiada para contornar essa limitação.

## Auth e ações humanas pendentes

| Conta | Existe | Convite enviado nesta ronda | Email confirmado | app_metadata.role |
|---|---|---|---|---|
| lachefbino@gmail.com | Não | Não | Não aplicável | Não aplicável |
| marquesandre112005@gmail.com | Não | Não | Não aplicável | Não aplicável |

O conector disponível não disponibiliza convite/criação de utilizadores nem atualização administrativa de Auth. Não foram recolhidas chaves secretas, inventadas passwords, gerados hashes ou escritas alterações diretamente em `auth.users`.

Próximo passo humano: abrir Authentication > Users no projeto correto:
https://supabase.com/dashboard/project/zfmodhonrngbmdyyifnt/auth/users

Continuar pelo fluxo oficial de convite, verificando antes o destino do link e a forma de definição da password. O cliente atual usa login por password com `detectSessionInUrl: false`; a aceitação automática de convites e um formulário de definição de password não foram implementados/validados nesta ronda. Não declarar o convite funcional apenas por conseguir enviá-lo. A atribuição de `app_metadata.role=admin` deverá ser feita por um fluxo administrativo oficial, mantendo a allowlist. Confirmação do email pelos titulares; nunca confirmação artificial para QA.

Login real, refresh/logout autenticados e CRUD positivo pelo `/admin` continuam pendentes até esta ativação Auth estar concluída.

## Segurança e configuração local

- `.env.local` aponta apenas para o projeto confirmado e usa uma publishable key ativa. `git check-ignore .env.local` confirmou a exclusão.
- Scan dos bundles gerados: zero chaves `sb_secret_...` ou JWTs com papel `service_role`.
- Frontend continua sem SELECT público de Auth, sem credenciais administrativas e sem alterações aos links externos. O tratamento de URLs HTTP(S) e `noopener noreferrer` foi preservado.
- Booking, WhatsApp, YouTube, Hero, Gallery, Archive, ordem das secções e design não foram modificados.
- Evolution não foi consultado nem alterado.

## QA local final

- `node --test tests/*.test.js`: **12/12 passaram**.
- `npm.cmd run build`: passou.
- `git diff --check`: passou; avisos LF/CRLF normais do Git em Windows.
- Servidor local iniciado em `http://127.0.0.1:5173/` com a configuração real.
- Leitura equivalente à homepage via API real: `200 []`; agenda vazia legítima, não fallback por erro de schema.
- O browser automatizado não iniciou nesta ronda (`failed to write kernel assets`, caminho indisponível), mesmo após um reset da ferramenta. Não foi possível repetir a inspeção visual/console da homepage nem do login. Os testes visuais da ronda anterior não foram apresentados como validação atual da integração real.

## Ficheiros desta ronda

Nenhum código de aplicação alterado. Criado este relatório; `.env.local` já tinha sido criado e continua ignorado. O SQL preparado não foi reescrito. Nenhum commit, push ou deploy.
