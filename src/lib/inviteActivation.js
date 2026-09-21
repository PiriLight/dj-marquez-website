import { isApprovedAdmin } from '../config/admin.js';
import { authRequest } from '../utils/authRequest.js';

export const SETUP_MARKER = 'dj-m4rquez:invite-setup';
export const SETUP_MAX_AGE = 30 * 60 * 1000;
export class SetupError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// Token hashes are opaque values, never decoded as sessions/JWTs. No redirects
// or other OTP types are accepted by this invitation-only page.
export function parseInviteUrl(href) {
  const url = new URL(href);
  if (url.hash) return { kind: 'invalid' };
  const params = url.searchParams;
  if (![...params].length) return { kind: 'resume' };
  if ([...params.keys()].some((key) => !['token_hash', 'type'].includes(key)) || params.getAll('type').length !== 1 || params.get('type') !== 'invite' || params.getAll('token_hash').length !== 1) return { kind: 'invalid' };
  const tokenHash = params.get('token_hash');
  return /^[A-Za-z0-9_-]{32,256}$/.test(tokenHash || '') ? { kind: 'invite', tokenHash } : { kind: 'invalid' };
}

export function passwordErrors(password, confirmation) {
  const errors = {};
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) errors.password = 'Usa entre 12 e 128 caracteres. Podes escolher uma frase longa.';
  if (password !== confirmation) errors.confirmation = 'As passwords não coincidem.';
  return errors;
}

export function setupErrorMessage(error) {
  if (error?.code === 'unauthorized') return 'Esta conta não está autorizada a gerir a agenda.';
  if (error?.code === 'unconfigured') return 'A ativação está temporariamente indisponível. Contacta a equipa responsável pelo site.';
  if (error?.code === 'missing') return 'Abre o link de convite recebido por email para criar a tua password.';
  if (['invalid', 'otp_expired', 'otp_disabled', 'session_missing', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error?.code)) return 'Este convite já não é válido ou expirou. Pede um novo convite à equipa responsável pelo site.';
  if (['weak_password', 'same_password', 'validation_failed'].includes(error?.code)) return 'Escolhe uma password diferente e mais forte, de acordo com os requisitos indicados.';
  if (error?.code === 'over_request_rate_limit' || error?.status === 429) return 'Foram feitas demasiadas tentativas. Aguarda alguns minutos antes de tentar novamente.';
  return 'Não foi possível confirmar a operação. Verifica a ligação. Se estavas a guardar a password, tenta iniciar sessão; caso contrário, volta a abrir o convite.';
}

async function checkedUser(client, expectedId) {
  const { data, error } = await authRequest(client.auth.getUser());
  if (error) throw error;
  if (!data?.user) throw new SetupError('session_missing');
  if (!isApprovedAdmin(data.user) || (expectedId && data.user.id !== expectedId)) throw new SetupError('unauthorized');
  return data.user;
}

// One controller per page load: StrictMode must never consume a one-time link
// twice. Only a non-secret user ID/timestamp marker survives a page refresh.
export function createInviteActivation({ clientFactory, href, replaceUrl, storage, now = Date.now }) {
  let invite = parseInviteUrl(href);
  replaceUrl(new URL(href).pathname); // Remove query/hash immediately, also on errors.
  let startPromise;
  let ready;
  let submitting = false;
  let cancelled = false;
  const clear = () => { try { storage.removeItem(SETUP_MARKER); } catch { /* storage may be blocked */ } };
  function marker() {
    try {
      const saved = JSON.parse(storage.getItem(SETUP_MARKER));
      const age = now() - saved?.verifiedAt;
      return typeof saved?.userId === 'string' && Number.isFinite(age) && age >= 0 && age < SETUP_MAX_AGE ? saved : null;
    } catch { return null; }
  }
  return {
    start() {
      if (!startPromise) startPromise = (async () => {
        try {
          if (invite.kind === 'invalid') throw new SetupError('invalid');
          const client = await clientFactory();
          if (!client) throw new SetupError('unconfigured');
          let expectedId;
          let verifiedAt;
          if (invite.kind === 'invite') {
            clear();
            const { data, error } = await authRequest(client.auth.verifyOtp({ token_hash: invite.tokenHash, type: 'invite' }));
            if (error) throw error;
            if (!data?.session?.user?.id) throw new SetupError('invalid');
            expectedId = data.session.user.id;
            verifiedAt = now();
          } else {
            const saved = marker();
            if (!saved) throw new SetupError('missing');
            expectedId = saved.userId;
            verifiedAt = saved.verifiedAt;
          }
          const user = await checkedUser(client, expectedId);
          if (cancelled) throw new SetupError('session_expired');
          if (invite.kind === 'invite') {
            try { storage.setItem(SETUP_MARKER, JSON.stringify({ userId: user.id, verifiedAt })); } catch { /* activation still works; refresh cannot resume */ }
          }
          ready = { client, user, verifiedAt };
          return ready;
        } catch (error) {
          clear();
          throw error;
        } finally { invite = { kind: 'consumed' }; }
      })();
      return startPromise;
    },
    async finish(password, confirmation) {
      if (submitting) throw new SetupError('busy');
      if (!ready) throw new SetupError('session_missing');
      const errors = passwordErrors(password, confirmation);
      if (Object.keys(errors).length) throw new SetupError('validation_failed');
      submitting = true;
      const context = ready;
      try {
        if (now() - context.verifiedAt >= SETUP_MAX_AGE) throw new SetupError('session_expired');
        await checkedUser(context.client, context.user.id);
        if (cancelled || ready !== context) throw new SetupError('session_expired');
        const { data, error } = await authRequest(context.client.auth.updateUser({ password }));
        if (error) throw error;
        if (data?.user?.id !== context.user.id) throw new SetupError('unauthorized');
        const user = await checkedUser(context.client, context.user.id);
        if (cancelled || ready !== context) throw new SetupError('session_expired');
        clear();
        ready = undefined;
        return user;
      } catch (error) {
        if (['unauthorized', 'session_missing', 'session_expired'].includes(error?.code)) { clear(); ready = undefined; }
        throw error;
      } finally { submitting = false; }
    },
    cancel() { cancelled = true; clear(); ready = undefined; },
  };
}
