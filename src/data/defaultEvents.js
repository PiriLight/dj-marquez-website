import { upcomingEvents } from '../utils/events.js';

export const DEFAULT_EVENTS = Object.freeze([
  {
    id: 'midnight-marteleira-2026-08-26',
    date: '26 AGO 2026',
    name: 'Midnight',
    location: 'Marteleira',
    info_url: '',
    is_visible: true,
    sort_order: 0,
  },
]);

export const visibleEvents = upcomingEvents;
