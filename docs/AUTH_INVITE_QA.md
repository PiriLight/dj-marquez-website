# Ativação administrativa — DJ M4rquez

Data: 22/09/2026. Projeto exclusivo: `E:\Katia\dj-marquez-website`.
Branch `main`, produção no commit `e9ca9c0dd93abdec35a680eb35dc9cc79c32571a`.
Alterações desta ronda continuam locais, sem commit, push ou novo deployment.

## Allowlist e RLS

A allowlist final tem exatamente:

- `lachefbino@gmail.com`
- `marquesandre112005@gmail.com`
- `afonsosantoscs@gmail.com`

O frontend mantém a lista centralizada em `src/config/admin.js`. A migration
`20260922000447_add_afonso_event_admin.sql` foi aplicada ao projeto
**PiriLight Studio / DJ-M4RQUEZ** (`zfmodhonrngbmdyyifnt`) e está representada
localmente com a mesma versão registada no Supabase.

O helper `private.is_event_admin()` exige cumulativamente:

1. `auth.uid()` correspondente a uma linha atual de `auth.users`;
2. email confirmado pertencente à allowlist;
3. utilizador não anónimo.

`user_metadata` e `app_metadata.role` não participam na autorização. A tabela
`public.events`, os dados, os grants e as cinco policies não foram recriados nem
alterados. A RLS continua ativa.

Verificação remota após a migration:

- zero eventos e zero eventos QA;
- cinco policies preservadas;
- `anon` não executa o helper nem escreve;
- `authenticated` só executa o helper, ficando sujeito à identidade real em
  `auth.users`;
- JWT com metadata forjada e `sub` sem utilizador real devolveu `false`;
- advisor de segurança sem alertas.

## Auth de produção

Configuração guardada no Dashboard:

- **Site URL:** `https://dj-marquez-website-three.vercel.app`
- **Redirect URLs:**
  - `https://dj-marquez-website-three.vercel.app/auth/setup-password`
  - `http://127.0.0.1:5173/auth/setup-password`
  - `http://localhost:5173/auth/setup-password`

Novos signups permanecem ativos, conforme pedido.

## Implementação do convite

A rota `/auth/setup-password` aceita apenas `token_hash` opaco e
`type=invite`, remove o token do URL antes da chamada de rede e usa
`supabase.auth.verifyOtp({ token_hash, type: 'invite' })`. A password é definida
por `supabase.auth.updateUser({ password })`, nunca é inventada ou persistida
pela aplicação, e o utilizador é revalidado antes e depois da alteração.

O template compatível, confirmado na documentação atual do Supabase, é:

```html
<h2>Ativar acesso à agenda — DJ M4rquez</h2>
<p>Recebeste um convite para gerir a agenda do DJ M4rquez.</p>
<p>Abre a ligação abaixo para confirmar o convite e criar a tua password.</p>
<p><a href="{{ .SiteURL }}/auth/setup-password?token_hash={{ .TokenHash }}&amp;type=invite">Criar password</a></p>
<p>Se não esperavas este convite, podes ignorar esta mensagem.</p>
```

O projeto foi criado em setembro de 2026 no plano Free e usa o SMTP padrão.
O Dashboard bloqueia a edição dos templates e mostra a exigência **Set up
custom SMTP to edit templates**. O template Invite User atual é o padrão com
`{{ .ConfirmationURL }}`, incompatível com a implementação acima, que mantém
`detectSessionInUrl: false` e rejeita fragmentos de sessão.

Por segurança, o convite para `afonsosantoscs@gmail.com` não foi enviado. Uma
consulta prévia a `auth.users` confirmou que esta conta ainda não existe. Também
não foram criadas ou convidadas as outras duas contas.

## Estado do QA real

Concluído:

- allowlist de três emails no frontend e RLS;
- migration aplicada e verificada;
- bloqueio de anon, terceiros, utilizador não confirmado e metadata forjada;
- Site URL e três redirects configurados;
- produção Vercel e rotas `/admin` e `/auth/setup-password` verificadas na ronda
  de deployment.

Pendente por depender do template/SMTP e da intervenção do titular:

- envio e abertura do convite do Afonso;
- definição da password pelo Afonso;
- login, refresh, persistência, logout e novo login;
- CRUD real do evento temporário e confirmação de limpeza;
- ativação posterior de `lachefbino@gmail.com` e
  `marquesandre112005@gmail.com`;
- eventual desativação de novos signups após as três contas estarem concluídas.

## Fontes oficiais consultadas

- [Supabase Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase verifyOtp](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Supabase inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail)
- [Supabase changelog](https://supabase.com/changelog.md) — desde 03/06/2026,
  novos projetos Free com SMTP padrão não podem personalizar templates Auth.
