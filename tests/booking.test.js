import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingLinks, bookingMessage, validateBooking } from '../src/utils/booking.js';

const valid = { event: 'São João & verão', date: '2027-06-24', city: 'Lisboa', name: 'Teste QA', email: 'qa@example.test', notes: 'Som + luz\nObrigado!', budget: '2500' };
const today = '2026-09-21';

test('minimum booking needs event, date, city, name and one reply channel', () => {
  assert.deepEqual(Object.keys(validateBooking({}, today)), ['event', 'date', 'city', 'name', 'phone']);
  assert.deepEqual(validateBooking(valid, today), {});
  assert.deepEqual(validateBooking({ ...valid, email: '', phone: '+351 900 000 000' }, today), {});
});
test('invalid email, phone, past date, audience and budget are rejected', () => {
  const errors = validateBooking({ ...valid, date: '2020-01-01', email: 'invalid', phone: 'abc', audience: '1.5', budget: '-1' }, today);
  for (const key of ['date', 'email', 'phone', 'audience', 'budget']) assert.ok(errors[key]);
});
test('all four groups, local date and optional values are legible', () => {
  const message = bookingMessage(valid);
  for (const text of ['INFORMAÇÕES DO EVENTO', 'CONTACTO', 'TÉCNICA / PALCO', 'ORÇAMENTO / NOTAS', '24/06/2027', '2500 €', 'A confirmar']) assert.ok(message.includes(text));
});
test('WhatsApp safely encodes accents, ampersands, plus signs and newlines', () => {
  const links = bookingLinks(valid, { whatsapp: '351913235224' });
  const url = new URL(links.whatsapp);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/351913235224');
  assert.equal(url.searchParams.get('text'), bookingMessage(valid));
  assert.equal([...url.searchParams].length, 1);
  assert.equal(links.email, null);
});
test('email has a separate subject/body and remains unavailable without configuration', () => {
  const url = new URL(bookingLinks(valid, { email: 'booking@example.test' }).email);
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.searchParams.get('subject'), 'Pedido de booking — DJ M4rquez');
  assert.equal(url.searchParams.get('body'), bookingMessage(valid));
  assert.deepEqual(bookingLinks(valid, {}), { whatsapp: null, email: null });
  assert.deepEqual(bookingLinks(valid, { whatsapp: 'abc', email: 'x@example.test?bcc=other' }), { whatsapp: null, email: null });
});
