import { useEffect, useState } from 'react';
import { DEFAULT_EVENTS } from '../data/defaultEvents.js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';
import { readEvents } from '../lib/eventRepository.js';
import { lisbonDate, upcomingEvents } from '../utils/events.js';

export function useEvents({ clientFactory = getSupabaseClient, configured = isSupabaseConfigured } = {}) {
  const [rows, setRows] = useState(configured ? [] : DEFAULT_EVENTS);
  const [source, setSource] = useState(configured ? 'loading' : 'unconfigured');
  const [loading, setLoading] = useState(configured);
  const [today, setToday] = useState(lisbonDate);
  useEffect(() => {
    let active = true;
    let controller;
    let busy = false;
    let timeout;
    let lastLoad = 0;
    const load = async () => {
      setToday(lisbonDate());
      if (!configured || busy) return;
      busy = true;
      lastLoad = Date.now();
      controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const client = await clientFactory();
        if (!active) return;
        const data = await readEvents(client, { publicOnly: true, signal: controller.signal });
        if (active) { setRows(data); setSource('remote'); }
      } catch {
        if (active) {
          setRows(DEFAULT_EVENTS);
          setSource('fallback');
          console.warn('[agenda] Não foi possível atualizar os eventos; fallback local ativo.');
        }
      } finally { clearTimeout(timeout); busy = false; if (active) setLoading(false); }
    };
    const refresh = () => { if (!document.hidden && Date.now() - lastLoad > 1000) load(); };
    load();
    const interval = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { active = false; clearInterval(interval); clearTimeout(timeout); controller?.abort(); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [clientFactory, configured]);
  return { events: upcomingEvents(rows, today), isLoading: loading, source, today, isRemote: source === 'remote' };
}
