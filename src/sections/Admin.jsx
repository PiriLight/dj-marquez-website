import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';

const EVENT_FIELDS = 'id,date,name,location,info_url,is_visible,sort_order';

function blankEvent(sortOrder) {
  return {
    id: crypto.randomUUID(),
    date: '',
    name: '',
    location: '',
    info_url: '',
    is_visible: false,
    sort_order: sortOrder,
  };
}

function validateEvents(events) {
  for (const [index, event] of events.entries()) {
    if (!event.date.trim() || !event.name.trim() || !event.location.trim()) {
      return `Preenche a data, o evento e a localização no Evento ${String(index + 1).padStart(2, '0')}.`;
    }

    if (event.info_url.trim()) {
      try {
        const url = new URL(event.info_url);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol');
      } catch {
        return `O URL do Evento ${String(index + 1).padStart(2, '0')} deve começar por http:// ou https://.`;
      }
    }
  }

  return '';
}

function EventFields({ event, index, onChange }) {
  const update = (field, value) => onChange(index, { ...event, [field]: value });

  return (
    <fieldset className="m4rq-admin-event">
      <legend>Evento {String(index + 1).padStart(2, '0')}</legend>
      <div className="m4rq-admin-grid">
        <label>
          <span>Data</span>
          <input value={event.date} onChange={(e) => update('date', e.target.value)} placeholder="26 AGO 2026" required />
        </label>
        <label>
          <span>Evento</span>
          <input value={event.name} onChange={(e) => update('name', e.target.value)} placeholder="Midnight" required />
        </label>
        <label>
          <span>Localização</span>
          <input value={event.location} onChange={(e) => update('location', e.target.value)} placeholder="Marteleira" required />
        </label>
        <label className="m4rq-admin-url">
          <span>Mais informações — URL</span>
          <input
            type="url"
            value={event.info_url ?? ''}
            onChange={(e) => update('info_url', e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />
        </label>
        <label className="m4rq-admin-toggle">
          <input type="checkbox" checked={event.is_visible} onChange={(e) => update('is_visible', e.target.checked)} />
          <span>Visível no site</span>
        </label>
      </div>
    </fieldset>
  );
}

export default function Admin() {
  const [supabase, setSupabase] = useState(null);
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const isAdmin = session?.user?.app_metadata?.role === 'admin';

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;
    let subscription;

    getSupabaseClient().then((client) => {
      if (!active || !client) return;
      setSupabase(client);
      client.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setCheckingSession(false);
      });

      const authState = client.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        setCheckingSession(false);
      });
      subscription = authState.data.subscription;
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAdmin || !supabase) return undefined;

    let active = true;
    setBusy(true);
    supabase
      .from('events')
      .select(EVENT_FIELDS)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        setBusy(false);
        if (error) {
          setFeedback({ type: 'error', message: 'Não foi possível carregar os eventos.' });
          return;
        }
        setEvents(data ?? []);
      });

    return () => {
      active = false;
    };
  }, [isAdmin, supabase]);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setFeedback({ type: '', message: '' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setFeedback({ type: 'error', message: 'Não foi possível iniciar sessão. Confirma os dados e tenta novamente.' });
  };

  const updateEvent = (index, value) => {
    setEvents((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
    setFeedback({ type: '', message: '' });
  };

  const saveEvents = async (event) => {
    event.preventDefault();
    const validationError = validateEvents(events);
    if (validationError) {
      setFeedback({ type: 'error', message: validationError });
      return;
    }

    setBusy(true);
    setFeedback({ type: '', message: '' });
    const timestamp = new Date().toISOString();
    const payload = events.map((item, index) => ({
      id: item.id,
      date: item.date.trim(),
      name: item.name.trim(),
      location: item.location.trim(),
      info_url: item.info_url.trim() || null,
      is_visible: item.is_visible,
      sort_order: index,
      updated_at: timestamp,
    }));
    const { data, error } = await supabase.from('events').upsert(payload, { onConflict: 'id' }).select(EVENT_FIELDS);
    setBusy(false);

    if (error) {
      setFeedback({ type: 'error', message: 'Não foi possível guardar as alterações.' });
      return;
    }

    setEvents([...(data ?? payload)].sort((a, b) => a.sort_order - b.sort_order));
    setFeedback({ type: 'success', message: 'Alterações guardadas. O site público já pode ler estes eventos.' });
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="m4rq-admin-shell">
        <section className="m4rq-admin-panel" aria-labelledby="admin-title">
          <p className="m4rqx-eyebrow">Área privada</p>
          <h1 id="admin-title">Próximos Eventos</h1>
          <p>A área está preparada, mas o projeto ainda não tem uma ligação Supabase configurada.</p>
          <p className="m4rq-admin-note">
            Define <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, aplica o ficheiro{' '}
            <code>supabase/events.sql</code> e atribui <code>app_metadata.role = admin</code> ao utilizador autorizado.
          </p>
          <a href="/">Voltar ao site</a>
        </section>
      </main>
    );
  }

  if (checkingSession) {
    return <main className="m4rq-admin-shell"><p role="status">A verificar sessão…</p></main>;
  }

  if (!session) {
    return (
      <main className="m4rq-admin-shell">
        <form className="m4rq-admin-panel m4rq-admin-login" onSubmit={signIn} aria-labelledby="admin-title">
          <p className="m4rqx-eyebrow">Área privada</p>
          <h1 id="admin-title">Próximos Eventos</h1>
          <p>Inicia sessão com a conta administrativa do artista.</p>
          <label><span>Email</span><input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label><span>Palavra-passe</span><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {feedback.message && <p className={`m4rq-admin-feedback is-${feedback.type}`} role="alert">{feedback.message}</p>}
          <button type="submit" className="m4rqx-primary-cta" disabled={busy}>{busy ? 'A entrar…' : 'Entrar'}</button>
          <a href="/">Voltar ao site</a>
        </form>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="m4rq-admin-shell">
        <section className="m4rq-admin-panel" aria-labelledby="admin-title">
          <p className="m4rqx-eyebrow">Área privada</p>
          <h1 id="admin-title">Acesso não autorizado</h1>
          <p>Esta conta não tem a função administrativa necessária.</p>
          <button type="button" onClick={() => supabase.auth.signOut()}>Terminar sessão</button>
        </section>
      </main>
    );
  }

  return (
    <main className="m4rq-admin-shell">
      <form className="m4rq-admin-panel" onSubmit={saveEvents} noValidate>
        <header className="m4rq-admin-header">
          <div>
            <p className="m4rqx-eyebrow">Editor privado</p>
            <h1>Próximos Eventos</h1>
          </div>
          <div className="m4rq-admin-actions">
            <a href="/" target="_blank" rel="noreferrer">Ver site</a>
            <button type="button" onClick={() => supabase.auth.signOut()}>Sair</button>
          </div>
        </header>

        {busy && events.length === 0 ? (
          <p role="status">A carregar eventos…</p>
        ) : (
          <div className="m4rq-admin-events">
            {events.map((item, index) => <EventFields key={item.id} event={item} index={index} onChange={updateEvent} />)}
          </div>
        )}

        {feedback.message && (
          <p className={`m4rq-admin-feedback is-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
            {feedback.message}
          </p>
        )}

        <div className="m4rq-admin-footer-actions">
          <button type="button" onClick={() => setEvents((current) => [...current, blankEvent(current.length)])}>Adicionar evento</button>
          <button type="submit" className="m4rqx-primary-cta" disabled={busy || events.length === 0}>{busy ? 'A guardar…' : 'Guardar alterações'}</button>
        </div>
      </form>
    </main>
  );
}
