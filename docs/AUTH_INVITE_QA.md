# Ativação administrativa — DJ M4rquez

Data: 21/09/2026. Projeto exclusivo: `E:\Katia\dj-marquez-website`.
Branch `main`, checkpoint de código `cf79de1678c99b27e8eb03a8466fe4a8e4a507b0`.
Alterações desta ronda ainda locais, sem commit, push ou deploy.

## Implementado

- Rota dedicada `/auth/setup-password`, mantendo `detectSessionInUrl: false`.
- Aceita exclusivamente um `token_hash` opaco e `type=invite`. Rejeita parâmetros duplicados, outros tipos, fragmentos de sessão e destinos de redirecionamento fornecidos no URL.
- Remove query e fragmento da barra de endereço imediatamente após os capturar, antes da chamada de rede. Nunca transforma o hash numa sessão por código próprio: usa `supabase.auth.verifyOtp({ token_hash, type: 'invite' })`.
- O SDK estabelece a sessão; `auth.getUser()` revalida a identidade antes de mostrar o formulário. React StrictMode não consome o convite duas vezes.
- Password entre 12 e 128 caracteres, confirmação igual, loading e bloqueio de submits duplicados. O servidor continua a aplicar a política de passwords configurada no Auth.
- Envio exclusivamente através de `supabase.auth.updateUser({ password })`. A identidade é validada antes e depois. Sucesso redireciona para `/admin`, que executa a sua própria verificação.
- Password apenas no estado transitório do formulário; nunca em logs, URL, storage ou tabela. Limpa os campos no sucesso ou perda de sessão.
- Um marcador de ativação em `sessionStorage` contém apenas ID e instante de verificação, com validade de 30 minutos. Permite refresh depois de verificar o convite, exigindo nova validação da mesma identidade no servidor. Não é uma credencial nem concede permissões.
- Links inválidos, expirados ou reutilizados não recorrem silenciosamente à sessão anterior. Mostram mensagem curta e ligação para o login. Erros de rede/password não expõem mensagens técnicas ou tokens.
- Cabeçalhos apenas na rota de ativação: `Referrer-Policy: no-referrer`, `Cache-Control: no-store`, `X-Robots-Tag: noindex, nofollow`. A homepage e o YouTube conservam o comportamento anterior.
- `vercel.json` prepara rewrites para abertura direta/refresh de `/admin` e `/auth/setup-password`. Configuração preparada, ainda não validada num deployment.

## Autorização e alteração remota

Único projeto alterado: **PiriLight Studio / DJ-M4RQUEZ**, `zfmodhonrngbmdyyifnt`.

Migration aplicada e registada no Supabase:
`20260921192134_event_admin_confirmed_allowlist`.

O helper `private.is_event_admin()` exige cumulativamente:

1. `auth.uid()` correspondente a uma linha atual de `auth.users`;
2. email, normalizado para minúsculas, exatamente `lachefbino@gmail.com` ou `marquesandre112005@gmail.com`;
3. `email_confirmed_at IS NOT NULL`;
4. utilizador não anónimo.

Nem `app_metadata` nem `user_metadata` entram na decisão. O frontend repete a regra para UX; as políticas RLS são a proteção efetiva.

Só foi substituída a função. Não foram alterados tabela, dados, índices, grants ou as cinco políticas existentes de `events`. Função continua `SECURITY DEFINER`, com `search_path = ''`, sem execução direta por `anon`, e o schema `private` permanece fora da exposição pública.

Verificação remota após migration: RLS ativa; `anon` sem escrita; utilizador autenticado genérico, sem identidade aprovada, não passa no helper mesmo com metadados forjados. Zero eventos e zero contas aprovadas no momento da verificação. Advisor de segurança sem alertas. Não se criaram contas para provar CRUD na instância real.

O teste SQL numa base PostgreSQL descartável confirmou CRUD das duas identidades aprovadas e confirmadas **sem app_metadata**, bloqueio de terceiros/metadados forjados e perda de autorização ao retirar a confirmação do email. Container de QA removido no fim.

`supabase/events.sql` acompanha a regra atual para bootstrap. A migration incremental local tem o mesmo identificador da migration remota; não executar um `db push` indiscriminado para reconciliar o bootstrap antigo.

## Configuração manual no Dashboard

O estado atual destas definições do Auth não foi alterado nem verificado pelo conector. A configuração abaixo é a configuração a aplicar, não uma afirmação sobre o Dashboard atual.

Selecionar **PiriLight Studio → DJ-M4RQUEZ**, confirmando ref `zfmodhonrngbmdyyifnt`.

### Desenvolvimento local

Em **Authentication → URL Configuration**:

- **Site URL:** `http://127.0.0.1:5173` (origem, sem `/admin`, sem caminho de ativação e sem barra final).
- **Redirect URLs:** adicionar exatamente:
  - `http://127.0.0.1:5173/auth/setup-password`
  - `http://localhost:5173/auth/setup-password`

O template abaixo usa `SiteURL`; não depende de `RedirectTo`. As duas entradas de redirect ficam preparadas para os fluxos oficiais que usem esse parâmetro. Usar o mesmo hostname durante uma ativação: localhost e 127.0.0.1 têm storages/sessões distintos.

Estes endereços só chegam ao computador onde o site está a correr. Não enviar convites para serem abertos remotamente nesta fase.

### Invite User — template exato

Em **Authentication → Email Templates → Invite User**, manter ou adaptar o assunto e substituir o corpo por:

```html
<h2>Ativar acesso à agenda — DJ M4rquez</h2>
<p>Recebeste um convite para gerir a agenda do DJ M4rquez.</p>
<p>Abre a ligação abaixo para confirmar o convite e criar a tua password.</p>
<p><a href="{{ .SiteURL }}/auth/setup-password?token_hash={{ .TokenHash }}&amp;type=invite">Criar password</a></p>
<p>Se não esperavas este convite, podes ignorar esta mensagem.</p>
```

Não usar `ConfirmationURL` neste fluxo: queremos que a página dedicada faça a verificação oficial, em vez de receber automaticamente tokens de sessão no fragmento.

### Produção — ainda por confirmar

Não assumir nenhum dos domínios Vercel antigos. Depois de existir um deployment funcional e autorizado:

1. Confirmar a origem HTTPS efetiva e abertura direta/refresh das duas rotas.
2. Substituir o Site URL por essa origem **sem barra final**, por exemplo `https://DOMINIO-CONFIRMADO` (placeholder, não copiar literalmente).
3. Adicionar o redirect exato `https://DOMINIO-CONFIRMADO/auth/setup-password`.
4. O template acima acompanha automaticamente o novo Site URL.

Não desativar confirmação de email: a autorização exige identidade confirmada.

### Signups

Nenhuma alteração feita a **Allow new users to sign up**. Segundo a documentação oficial, desativar esta opção mantém o login de utilizadores já existentes. Podemos desativá-la depois de as duas contas estarem criadas, ativadas e com login validado. Não é necessário atribuir qualquer metadata role.

## Evidência de QA

| Verificação | Resultado |
| --- | --- |
| `node --test tests/*.test.js` | 27 testes passaram, zero falhas |
| Componentes React reais, cliente Auth simulado | Login anónimo, terceiro recusado, setup válido/expirado, confirmação de password, sucesso e perda de sessão passaram |
| Fluxo/utilitário | Parser estrito, token consumido uma vez, remoção do URL, marcador de refresh, revalidação, retry, concorrência e expiração passaram |
| PostgreSQL isolado | RLS/CRUD/allowlist/metadados/identidade não confirmada/revogação passaram |
| Supabase real | Helper e permissões inspecionados, migration aplicada, RLS ativa; sem criar utilizadores ou eventos |
| `npm.cmd run build` | Passou; inclui chunk da página de ativação |
| `git diff --check` | Passou, sem erros de whitespace |
| Rotas locais HTTP | `/admin` e `/auth/setup-password` respondem 200; HTML de ativação com os três cabeçalhos esperados |
| Refresh da ativação | Retoma de estado coberta nos testes; abertura direta coberta por HTTP. Refresh visual de browser pendente |
| Mobile 320 / 390 / 430 e desktop 1440 | **Pendente**: ferramenta de browser falha antes de abrir a página (`failed to write kernel assets`, erro de caminho do runtime). Testes de componentes não comprovam layout ou ausência de overflow |
| Convite real e entrega de email | Não executado: expressamente excluído desta ronda |
| Produção | Não publicada nem validada |

`.env.local` continua ignorado pelo Git. A configuração usa URL pública e chave publishable; não utiliza secret/service key no frontend. O build rejeita configuração privada nos campos de configuração Supabase. Não há password persistida pelo fluxo, nem logs acrescentados de tokens/passwords.

O diff conserva as alterações locais anteriores de Admin/Eventos; as alterações desta ronda limitam-se a ativação, autorização, estilos da página, rotas, testes, migration e documentação. Booking, WhatsApp, Hero, YouTube, Gallery, Arquivo e a ordem da homepage não foram alterados.

## Próximo passo, antes e durante os convites

Não enviar ainda. Primeiro concluir QA visual nos quatro tamanhos, confirmar deployment autorizado e aplicar/verificar Site URL, redirect e template de produção acima.

Depois, numa ronda explicitamente autorizada:

1. Abrir **Authentication → Users** no projeto correto e confirmar se cada email já existe. Se existir, não criar duplicado nem apagar a conta; verificar o estado antes de escolher recuperação ou continuação da ativação.
2. Para uma conta ausente, usar **Invite user** com `lachefbino@gmail.com`. Não adicionar metadata roles.
3. O titular abre o email, verifica o domínio, define a sua própria password na página e confirma entrada em `/admin`. Nunca partilhar passwords com a equipa/assistente.
4. Confirmar o login posterior e a autorização; qualquer criação de evento real para teste exige autorização própria. Só depois repetir para `marquesandre112005@gmail.com`.
5. Se o link expirar/já tiver sido usado, inspecionar o estado da conta antes de reenviar. Não fazer resets ou remover utilizadores às cegas.
6. Depois das duas ativações, desativar signups se essa decisão for confirmada e voltar a verificar login de ambas.

## Fontes oficiais consultadas

- [Supabase Auth email templates — TokenHash e convite](https://supabase.com/docs/guides/auth/auth-email-templates)
- [verifyOtp](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser)
- [Configuração geral — Allow new users to sign up](https://supabase.com/docs/guides/auth/general-configuration)

Métodos e comportamento de sessão também verificados no SDK instalado `@supabase/supabase-js 2.116.0`.
