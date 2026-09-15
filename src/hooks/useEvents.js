import { useEffect, useState } from 'react';
import { DEFAULT_EVENTS, visibleEvents } from '../data/defaultEvents.js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase.js';

const PUBLIC_EVENT_FIELDS = 'id,date,name,location,info_url,is_visible,sort_order';

export function useEvents() {
  const [events, setEvents] = useState(() => visibleEvents(DEFAULT_EVENTS));
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    const loadEvents = async () => {
      const supabase = await getSupabaseClient();
      if (!supabase || !active) return;

      const { data, error } = await supabase
        .from('events')
        .select(PUBLIC_EVENT_FIELDS)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (!active) return;

      if (!error) setEvents(visibleEvents(data ?? []));
      setIsLoading(false);
    };

    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  return { events, isLoading, isRemote: isSupabaseConfigured };
}
