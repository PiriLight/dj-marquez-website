const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
export const EVENT_FIELDS = 'id,date,name,location,info_url,is_visible,sort_order';
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function lisbonDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// Keep the existing text column; read the legacy PT format, write ISO calendar dates.
export function eventDate(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim().toUpperCase();
  let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) {
    const legacy = /^(\d{1,2})\s+([A-Z]{3})\s+(\d{4})$/.exec(text);
    if (!legacy || !MONTHS.includes(legacy[2])) return null;
    match = [text, legacy[3], String(MONTHS.indexOf(legacy[2]) + 1).padStart(2, '0'), legacy[1].padStart(2, '0')];
  }
  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
  if (Number(year) < 1900 || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== `${year}-${month}-${day}`) return null;
  return `${year}-${month}-${day}`;
}

export function displayEventDate(value) {
  const iso = eventDate(value);
  if (!iso) return 'Data por corrigir';
  const [year, month, day] = iso.split('-');
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function safeEventUrl(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048 || /[\u0000-\u0020\u007f]/.test(value.trim())) return null;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

const clean = (value) => typeof value === 'string' ? value.trim() : '';
const signature = (event) => [eventDate(event.date), clean(event.name), clean(event.location)].map((part) => String(part).normalize('NFKC').replace(/\s+/g, ' ').toLocaleLowerCase('pt-PT')).join('|');

export function validateEvent(event, others = []) {
  const errors = {};
  if (!UUID.test(event.id || '')) errors.id = 'Identificador inválido. Recarrega a lista antes de continuar.';
  if (!eventDate(event.date)) errors.date = 'Escolhe uma data válida.';
  for (const key of ['name', 'location']) {
    if (!clean(event[key]) || clean(event[key]).length > 160) errors[key] = 'Preenche este campo (máximo de 160 caracteres).';
  }
  if (clean(event.info_url) && !safeEventUrl(event.info_url)) errors.info_url = 'Usa um URL http:// ou https:// válido, sem credenciais.';
  if (typeof event.is_visible !== 'boolean') errors.is_visible = 'Confirma a visibilidade do evento.';
  if (!Number.isInteger(event.sort_order) || event.sort_order < 0) errors.sort_order = 'A ordem do evento é inválida.';
  if (!Object.keys(errors).length && others.some((other) => other.id !== event.id && signature(other) === signature(event))) errors.duplicate = 'Já existe um evento com esta data, nome e local. Edita o existente.';
  return errors;
}

export function eventPayload(event) {
  return { id: event.id, date: eventDate(event.date), name: clean(event.name), location: clean(event.location), info_url: safeEventUrl(event.info_url), is_visible: event.is_visible, sort_order: event.sort_order, updated_at: new Date().toISOString() };
}

export function sortEvents(events) {
  return [...events].sort((a, b) => (eventDate(a.date) || '9999-12-31').localeCompare(eventDate(b.date) || '9999-12-31') || (a.sort_order ?? 0) - (b.sort_order ?? 0) || String(a.id).localeCompare(String(b.id)));
}

export function upcomingEvents(events, today = lisbonDate()) {
  return sortEvents(events.filter((event) => event?.is_visible === true && eventDate(event.date) >= today && clean(event.name) && clean(event.location)))
    .map((event) => ({ ...event, date: eventDate(event.date), name: clean(event.name), location: clean(event.location), info_url: safeEventUrl(event.info_url) }));
}
