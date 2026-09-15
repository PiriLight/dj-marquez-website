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

export function visibleEvents(events) {
  return [...events]
    .filter((event) => event.is_visible && event.date && event.name && event.location)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
