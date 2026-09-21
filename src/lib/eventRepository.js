import { isApprovedAdmin } from '../config/admin.js';
import { authRequest } from '../utils/authRequest.js';
import { EVENT_FIELDS, UUID, eventPayload, sortEvents, validateEvent } from '../utils/events.js';

function requestSignal() { return AbortSignal.timeout(12000); }

export async function requireEventAdmin(client) {
  const { data, error } = await authRequest(client.auth.getUser());
  if (error || !isApprovedAdmin(data?.user)) throw new Error('A sessão expirou ou esta conta não tem autorização. Inicia sessão novamente.');
  return data.user;
}

export async function readEvents(client, { publicOnly = false, signal = requestSignal() } = {}) {
  let query = client.from('events').select(EVENT_FIELDS).order('sort_order', { ascending: true });
  if (publicOnly) query = query.eq('is_visible', true);
  const { data, error } = await query.abortSignal(signal);
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('A agenda devolveu uma resposta inválida.');
  return sortEvents(data);
}

export async function saveEvent(client, event, { isNew, others = [] }) {
  const errors = validateEvent(event, others);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  await requireEventAdmin(client);
  const payload = eventPayload(event);
  const query = isNew ? client.from('events').insert(payload) : client.from('events').update(payload).eq('id', event.id);
  const { data, error } = await query.select(EVENT_FIELDS).abortSignal(requestSignal()).single();
  if (error) throw error;
  if (data?.id !== event.id) throw new Error('O servidor não confirmou a gravação. Recarrega a lista antes de tentar novamente.');
  return data;
}

export async function deleteEvent(client, id) {
  if (!UUID.test(id || '')) throw new Error('Identificador de evento inválido.');
  await requireEventAdmin(client);
  const { data, error } = await client.from('events').delete().eq('id', id).select('id').abortSignal(requestSignal()).single();
  if (error) throw error;
  if (data?.id !== id) throw new Error('A eliminação não foi confirmada. O evento pode ter sido alterado por outra pessoa.');
}

export function eventError(error) {
  if (error?.code === '23505') return 'Este evento já existe. Recarrega a lista antes de tentar novamente.';
  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) return 'Acesso recusado. Confirma a sessão e as permissões administrativas.';
  if (error?.code === 'PGRST116') return 'O registo não está disponível ou não tens permissão. Recarrega a lista.';
  if (error instanceof Error && !/fetch|network|timeout|abort/i.test(error.message)) return error.message;
  return 'Não foi possível confirmar a operação. Os dados foram mantidos; verifica a ligação e recarrega a lista antes de repetir.';
}
