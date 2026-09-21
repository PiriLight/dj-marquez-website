import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase.js';
import { createInviteActivation, passwordErrors, setupErrorMessage } from '../lib/inviteActivation.js';

let browserActivation;
function getBrowserActivation() {
  if (!browserActivation) browserActivation = createInviteActivation({
    clientFactory: getSupabaseClient,
    href: window.location.href,
    replaceUrl: (path) => window.history.replaceState(null, '', path),
    storage: { getItem: (key) => window.sessionStorage.getItem(key), setItem: (key, value) => window.sessionStorage.setItem(key, value), removeItem: (key) => window.sessionStorage.removeItem(key) },
  });
  return browserActivation;
}
const goToAdmin = () => window.location.replace('/admin');

export default function SetupPassword({ activation, onComplete = goToAdmin }) {
  const [flow] = useState(() => activation || getBrowserActivation());
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const active = useRef(false);
  const lock = useRef(false);
  useEffect(() => {
    let mounted = true;
    let subscription;
    active.current = true;
    flow.start().then(({ client, user }) => {
      if (!mounted) return;
      setStatus('ready');
      subscription = client.auth.onAuthStateChange((_event, session) => {
        if (mounted && (!session || session.user?.id !== user.id)) {
          flow.cancel(); setPassword(''); setConfirmation('');
          setStatus('error'); setMessage(setupErrorMessage({ code: 'session_expired' }));
        }
      }).data.subscription;
    }).catch((error) => { if (mounted) { setStatus('error'); setMessage(setupErrorMessage(error)); } });
    return () => { mounted = false; active.current = false; subscription?.unsubscribe(); };
  }, [flow]);

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const issues = passwordErrors(password, confirmation);
    setErrors(issues); setMessage('');
    if (Object.keys(issues).length) { event.currentTarget.elements.namedItem(Object.keys(issues)[0])?.focus(); return; }
    lock.current = true; setStatus('saving');
    try {
      await flow.finish(password, confirmation);
      if (!active.current) return;
      setPassword(''); setConfirmation(''); setStatus('success');
      onComplete();
    } catch (error) {
      if (active.current) {
        const fatal = ['unauthorized', 'session_missing', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error?.code);
        setStatus(fatal ? 'error' : 'ready'); setMessage(setupErrorMessage(error));
        if (fatal) { setPassword(''); setConfirmation(''); }
      }
    } finally { lock.current = false; }
  }
  const showForm = status === 'ready' || status === 'saving';
  return <main className="m4rq-admin-shell m4rq-setup-shell">
    <section className="m4rq-admin-panel m4rq-admin-login m4rq-setup-panel" aria-labelledby="setup-title" aria-busy={status === 'checking' || status === 'saving'}>
      <p className="m4rqx-eyebrow">DJ M4rquez · Área privada</p>
      <h1 id="setup-title">{status === 'error' ? 'Ativação da conta' : status === 'success' ? 'Conta preparada' : 'Criar password'}</h1>
      {status === 'checking' && <p role="status">A verificar o convite…</p>}
      {message && <p className="m4rq-admin-feedback is-error" role="alert">{message}</p>}
      {showForm && <>
        <p>Define a tua password para aceder à gestão da agenda.</p>
        <form onSubmit={submit} noValidate className="m4rq-setup-form">
          <p id="setup-password-help">Usa entre 12 e 128 caracteres. Uma frase longa é uma boa opção.</p>
          {[['password', 'Nova password', password, setPassword], ['confirmation', 'Confirmar password', confirmation, setConfirmation]].map(([name, label, value, setter]) => <div key={name}>
            <label htmlFor={`setup-${name}`}>{label}</label>
            <input id={`setup-${name}`} name={name} type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={value} disabled={status === 'saving'} onChange={(event) => { setter(event.target.value); setErrors((current) => ({ ...current, [name]: '' })); }} aria-invalid={!!errors[name]} aria-describedby={[name === 'password' ? 'setup-password-help' : '', errors[name] ? `setup-${name}-error` : ''].filter(Boolean).join(' ') || undefined} />
            {errors[name] && <p className="m4rq-admin-field-error" id={`setup-${name}-error`}>{errors[name]}</p>}
          </div>)}
          <button type="submit" className="m4rqx-primary-cta" disabled={status === 'saving'}>{status === 'saving' ? 'A guardar…' : 'Guardar password'}</button>
        </form>
      </>}
      {status === 'success' && <p role="status">Password definida. A abrir a gestão da agenda…</p>}
      {status !== 'saving' && <a href="/admin" onClick={() => flow.cancel()}>Voltar ao login</a>}
    </section>
  </main>;
}
