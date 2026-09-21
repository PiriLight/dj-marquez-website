import { useEffect, useRef, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, supabaseConfigurationError } from '../lib/supabase.js';
import { useAdminSession, authRequest } from '../hooks/useAdminSession.js';
import { isApprovedAdmin } from '../config/admin.js';
import { readEvents, saveEvent, deleteEvent, eventError } from '../lib/eventRepository.js';
import { displayEventDate, eventDate, sortEvents, validateEvent } from '../utils/events.js';

function Feedback({ value }) {
  return value?.message ? <p className={`m4rq-admin-feedback is-${value.type}`} role={value.type === 'error' ? 'alert' : 'status'}>{value.message}</p> : null;
}

function EventEditor({ client, onSignOut, signingOut }) {
  const [events, setEvents] = useState([]);
  const [draft, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState('load');
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const active = useRef(false);
  const lock = useRef(false);
  const request = useRef(null);
  const revision = useRef(0);
  const disabled = !!busy || signingOut;

  async function load() {
    if (lock.current) return;
    lock.current = true;
    const ticket = ++revision.current;
    setBusy('load');
    setFeedback(null);
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const rows = await readEvents(client, { signal: controller.signal });
      if (active.current && ticket === revision.current && !controller.signal.aborted) { setEvents(rows); setLoaded(true); }
    } catch (error) {
      if (active.current && ticket === revision.current) setFeedback({ type: 'error', message: eventError(error) });
    } finally {
      clearTimeout(timeout);
      if (ticket === revision.current) { lock.current = false; if (active.current) setBusy(''); }
    }
  }

  useEffect(() => {
    active.current = true;
    load();
    return () => { active.current = false; revision.current++; request.current?.abort(); lock.current = false; };
  }, [client]);

  function edit(event) {
    setDraft({ ...event, date: eventDate(event.date) || '', info_url: event.info_url || '' });
    setIsNew(false); setErrors({}); setFeedback(null); setDeleting(null);
  }
  function add() {
    setDraft({ id: crypto.randomUUID(), date: '', name: '', location: '', info_url: '', is_visible: false, sort_order: Math.max(-1, ...events.map((event) => event.sort_order || 0)) + 1 });
    setIsNew(true); setErrors({}); setFeedback(null); setDeleting(null);
  }
  async function save(event) {
    event.preventDefault();
    if (lock.current || signingOut) return;
    const issues = validateEvent(draft, events);
    setErrors(issues);
    if (Object.keys(issues).length) {
      setFeedback({ type: 'error', message: Object.values(issues)[0] });
      event.currentTarget.elements.namedItem(Object.keys(issues)[0])?.focus();
      return;
    }
    lock.current = true; setBusy('save'); setFeedback(null);
    try {
      const saved = await saveEvent(client, draft, { isNew, others: events });
      if (!active.current) return;
      setEvents((rows) => sortEvents([...rows.filter((row) => row.id !== saved.id), saved]));
      setDraft(null);
      setFeedback({ type: 'success', message: saved.is_visible ? 'Evento guardado. As datas de hoje e futuras aparecem na agenda pública.' : 'Evento guardado como não publicado.' });
    } catch (error) {
      if (active.current) setFeedback({ type: 'error', message: eventError(error) });
    } finally { lock.current = false; if (active.current) setBusy(''); }
  }
  async function remove() {
    if (lock.current || !deleting || signingOut) return;
    const id = deleting.id;
    lock.current = true; setBusy('delete'); setFeedback(null);
    try {
      await deleteEvent(client, id);
      if (!active.current) return;
      setEvents((rows) => rows.filter((event) => event.id !== id));
      setDeleting(null);
      setFeedback({ type: 'success', message: 'Evento eliminado.' });
    } catch (error) {
      if (active.current) setFeedback({ type: 'error', message: eventError(error) });
    } finally { lock.current = false; if (active.current) setBusy(''); }
  }

  return <section className="m4rq-admin-panel" aria-labelledby="admin-title" aria-busy={disabled}>
    <header className="m4rq-admin-header">
      <div><p className="m4rqx-eyebrow">Editor privado</p><h1 id="admin-title">Próximos Eventos</h1></div>
      <div className="m4rq-admin-actions"><a href="/" target="_blank" rel="noopener noreferrer">Ver site</a><button type="button" disabled={disabled} onClick={onSignOut}>Sair</button></div>
    </header>
    <p>As datas são apresentadas por ordem cronológica. Os eventos passados ficam aqui para consulta.</p>
    <Feedback value={feedback} />
    {busy === 'load' && <p role="status">A carregar eventos…</p>}
    {!loaded && !busy && <button type="button" onClick={load}>Tentar carregar novamente</button>}
    {loaded && !draft && <div className="m4rq-admin-actions"><button type="button" className="m4rqx-primary-cta" onClick={add} disabled={disabled}>Criar evento</button><button type="button" onClick={load} disabled={disabled}>Atualizar lista</button></div>}
    {draft && <form className="m4rq-admin-edit" onSubmit={save} noValidate>
      <fieldset className="m4rq-admin-event" disabled={disabled}>
        <legend>{isNew ? 'Criar evento' : 'Editar evento'}</legend>
        <div className="m4rq-admin-grid">
          {[['date', 'Data', 'date'], ['name', 'Nome do evento', 'text'], ['location', 'Local', 'text'], ['info_url', 'Mais informações — URL (opcional)', 'url']].map(([name, label, type]) => <label key={name} className={name === 'info_url' ? 'm4rq-admin-url' : ''}>
            <span>{label}</span><input name={name} type={type} value={draft[name]} maxLength={name === 'info_url' ? 2048 : 160} required={name !== 'info_url'} onChange={(event) => setDraft({ ...draft, [name]: event.target.value })} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `event-${name}-error` : undefined} />
            {errors[name] && <span className="m4rq-admin-field-error" id={`event-${name}-error`}>{errors[name]}</span>}
          </label>)}
          <label className="m4rq-admin-toggle"><input type="checkbox" checked={draft.is_visible} onChange={(event) => setDraft({ ...draft, is_visible: event.target.checked })} /><span>Publicado no site</span></label>
        </div>
      </fieldset>
      <div className="m4rq-admin-footer-actions"><button type="submit" className="m4rqx-primary-cta" disabled={disabled}>{busy === 'save' ? 'A guardar…' : 'Guardar evento'}</button><button type="button" disabled={disabled} onClick={() => { setDraft(null); setErrors({}); }}>Cancelar edição</button></div>
    </form>}
    {loaded && events.length === 0 && <p>Sem eventos guardados. Cria a primeira data quando estiver confirmada.</p>}
    <div className="m4rq-admin-events">
      {events.map((event) => <article className="m4rq-admin-list-event" key={event.id}>
        <div><p>{displayEventDate(event.date)} · {event.is_visible ? 'Publicado' : 'Não publicado'}</p><h2>{event.name}</h2><p>{event.location}</p></div>
        <div className="m4rq-admin-actions"><button type="button" onClick={() => edit(event)} disabled={disabled || !!draft || !!deleting}>Editar<span className="m4rq-sr-only"> {event.name}</span></button><button type="button" onClick={() => setDeleting(event)} disabled={disabled || !!draft || !!deleting}>Apagar<span className="m4rq-sr-only"> {event.name}</span></button></div>
        {deleting?.id === event.id && <div className="m4rq-admin-delete-confirm" role="group" aria-label="Confirmar eliminação">
          <p>Eliminar “{event.name}”? Esta ação não pode ser anulada.</p><div className="m4rq-admin-actions"><button type="button" onClick={remove} disabled={disabled}>{busy === 'delete' ? 'A eliminar…' : 'Confirmar eliminação'}</button><button type="button" onClick={() => setDeleting(null)} disabled={disabled}>Cancelar</button></div>
        </div>}
      </article>)}
    </div>
  </section>;
}

export default function Admin({ clientFactory = getSupabaseClient, configured = isSupabaseConfigured } = {}) {
  const auth = useAdminSession(clientFactory, configured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const lock = useRef(false);
  async function signIn(event) {
    event.preventDefault();
    if (lock.current || !auth.client) return;
    lock.current = true; setBusy(true); setFeedback(null);
    try {
      const { error } = await authRequest(auth.client.auth.signInWithPassword({ email: email.trim(), password }));
      if (error) throw error;
      setPassword('');
    } catch { setFeedback({ type: 'error', message: 'Não foi possível iniciar sessão. Confirma os dados e a ligação.' }); }
    finally { lock.current = false; setBusy(false); }
  }
  async function signOut() {
    if (lock.current || !auth.client) return;
    lock.current = true; setBusy(true); setFeedback(null);
    try {
      const { error } = await authRequest(auth.client.auth.signOut({ scope: 'local' }));
      if (error) throw error;
      setPassword('');
    } catch { setFeedback({ type: 'error', message: 'Não foi possível terminar a sessão. Tenta novamente.' }); }
    finally { lock.current = false; setBusy(false); }
  }
  return <main className="m4rq-admin-shell">
    {!configured ? <section className="m4rq-admin-panel"><p className="m4rqx-eyebrow">Área privada</p><h1>Agenda indisponível</h1><p>A ligação ao serviço de eventos ainda não está configurada.</p><p className="m4rq-admin-note">{supabaseConfigurationError}</p><a href="/">Voltar ao site</a></section>
      : auth.status === 'checking' ? <p role="status">A verificar sessão…</p>
        : auth.status === 'authorized' && isApprovedAdmin(auth.user) ? <><Feedback value={feedback} /><EventEditor key={auth.user.id} client={auth.client} onSignOut={signOut} signingOut={busy} /></>
          : auth.status === 'anonymous' ? <form className="m4rq-admin-panel m4rq-admin-login" onSubmit={signIn} aria-labelledby="admin-title">
            <p className="m4rqx-eyebrow">Área privada</p><h1 id="admin-title">Próximos Eventos</h1><p>Inicia sessão com uma conta autorizada.</p>
            <label><span>Email</span><input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} /></label>
            <label><span>Palavra-passe</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={busy} /></label>
            <Feedback value={feedback} /><button type="submit" className="m4rqx-primary-cta" disabled={busy || !auth.client}>{busy ? 'A entrar…' : 'Entrar'}</button><a href="/">Voltar ao site</a>
          </form> : <section className="m4rq-admin-panel"><p className="m4rqx-eyebrow">Área privada</p><h1>{auth.status === 'denied' ? 'Acesso recusado' : 'Sessão não verificada'}</h1><p>{auth.error || 'Esta conta não está autorizada a gerir eventos.'}</p><Feedback value={feedback} /><div className="m4rq-admin-actions">{auth.status === 'error' && <button type="button" onClick={auth.retry} disabled={busy}>Verificar novamente</button>}<button type="button" onClick={signOut} disabled={busy || !auth.client}>Terminar sessão</button><a href="/">Voltar ao site</a></div></section>}
  </main>;
}
