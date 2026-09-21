import { useEffect, useState } from 'react';
import { isApprovedAdmin } from '../config/admin.js';
import { authRequest } from '../utils/authRequest.js';
export { authRequest } from '../utils/authRequest.js';

export function useAdminSession(clientFactory, configured) {
  const [client, setClient] = useState(null);
  const [auth, setAuth] = useState({ status: configured ? 'checking' : 'unconfigured', user: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!configured) return undefined;
    let active = true;
    let revision = 0;
    let subscription;
    let deferred;
    const verify = async (connection, session, ticket) => {
      try {
        if (!session) {
          if (active && ticket === revision) setAuth({ status: 'anonymous', user: null, error: '' });
          return;
        }
        // Presence comes from getSession; identity/role must be verified by Auth.
        const { data, error } = await authRequest(connection.auth.getUser());
        if (!active || ticket !== revision) return;
        if (error) throw error;
        const user = data?.user;
        setAuth({ status: isApprovedAdmin(user) ? 'authorized' : 'denied', user, error: '' });
      } catch {
        if (active && ticket === revision) setAuth({ status: 'error', user: null, error: 'Não foi possível validar a sessão. Tenta novamente ou termina a sessão.' });
      }
    };
    const schedule = (connection, session) => {
      const ticket = ++revision;
      clearTimeout(deferred);
      if (!session) { setAuth({ status: 'anonymous', user: null, error: '' }); return; }
      setAuth((previous) => previous.status === 'authorized' && previous.user?.id === session.user?.id ? previous : ({ ...previous, status: 'checking', error: '' }));
      // Supabase callbacks hold an auth lock: defer all further Auth calls.
      deferred = setTimeout(() => verify(connection, session, ticket), 0);
    };
    setAuth((previous) => ({ ...previous, status: 'checking', error: '' }));
    clientFactory().then(async (connection) => {
      if (!active || !connection) return;
      setClient(connection);
      subscription = connection.auth.onAuthStateChange((_event, session) => { if (active) schedule(connection, session); }).data.subscription;
      const ticket = revision;
      const { data, error } = await authRequest(connection.auth.getSession());
      if (!active || revision !== ticket) return;
      if (error) throw error;
      schedule(connection, data.session);
    }).catch(() => { if (active) setAuth({ status: 'error', user: null, error: 'Não foi possível ligar ao serviço de autenticação.' }); });
    return () => { active = false; revision++; clearTimeout(deferred); subscription?.unsubscribe(); };
  }, [clientFactory, configured, attempt]);
  return { client, ...auth, retry: () => setAttempt((value) => value + 1) };
}
