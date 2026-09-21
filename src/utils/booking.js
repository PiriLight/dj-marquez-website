export const BOOKING_FIELDS = [
  { title: 'Informações do evento', fields: [
    { name: 'event', label: 'Nome / tipo de evento', required: true },
    { name: 'date', label: 'Data', type: 'date', required: true },
    { name: 'time', label: 'Hora prevista', type: 'time' },
    { name: 'city', label: 'Local / cidade', required: true },
    { name: 'venue', label: 'Nome do espaço' },
    { name: 'audience', label: 'Número aproximado de pessoas', type: 'number', min: 1 },
  ] },
  { title: 'Contacto', fields: [
    { name: 'name', label: 'Nome', required: true, autoComplete: 'name' },
    { name: 'phone', label: 'Telefone / WhatsApp', type: 'tel', autoComplete: 'tel' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  ] },
  { title: 'Técnica / Palco', fields: [
    { name: 'sound', label: 'Existe sistema de som?', options: ['A confirmar', 'Sim', 'Não'] },
    { name: 'booth', label: 'Existe cabine / mesa para DJ?', options: ['A confirmar', 'Sim', 'Não'] },
    { name: 'equipment', label: 'Equipamento disponível' },
    { name: 'technical', label: 'Informação técnica adicional', multiline: true },
  ] },
  { title: 'Orçamento / Notas', fields: [
    { name: 'budget', label: 'Orçamento disponível (€)', type: 'number', min: 0, step: '0.01' },
    { name: 'notes', label: 'Notas / informações adicionais', multiline: true },
  ] },
];

export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function validateBooking(values, today = localDate()) {
  const errors = {};
  for (const field of BOOKING_FIELDS.flatMap((group) => group.fields)) {
    const value = (values[field.name] || '').trim();
    if (field.required && !value) errors[field.name] = 'Preenche este campo.';
    if (value.length > (field.multiline ? 1000 : 160)) errors[field.name] = 'Encurta este texto, por favor.';
    if (field.type === 'number' && value && (!Number.isFinite(Number(value)) || Number(value) < field.min || (field.name === 'audience' && !Number.isInteger(Number(value))))) {
      errors[field.name] = `Introduz um número válido, igual ou superior a ${field.min}.`;
    }
  }
  if (values.date && (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(Date.parse(values.date)) || values.date < today)) errors.date = 'Escolhe uma data a partir de hoje.';
  if (!values.phone && !values.email) errors.phone = 'Indica um telefone ou email para podermos responder.';
  if (values.phone && !/^\+?[\d\s().-]+$/.test(values.phone)) errors.phone = 'Introduz um telefone válido, com indicativo.';
  if (values.phone && !/^\d{7,15}$/.test(values.phone.replace(/\D/g, ''))) errors.phone = 'Introduz um telefone válido, com indicativo.';
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Introduz um email válido.';
  return errors;
}

export function bookingMessage(values) {
  return ['PEDIDO DE BOOKING — DJ M4RQUEZ', ...BOOKING_FIELDS.map((group) => (
    `${group.title.toLocaleUpperCase('pt-PT')}\n${group.fields.map((field) => {
      let value = values[field.name] || 'A confirmar';
      if (field.name === 'date' && values.date) value = values.date.split('-').reverse().join('/');
      if (field.name === 'budget' && values.budget) value += ' €';
      return `${field.label}: ${value}`;
    }).join('\n')}`
  ))].join('\n\n');
}

export function bookingLinks(values, contacts) {
  const message = bookingMessage(values);
  const phone = contacts.whatsapp?.replace(/[\s+().-]/g, '') || '';
  const email = contacts.email?.trim() || '';
  return {
    whatsapp: /^[1-9]\d{6,14}$/.test(phone) ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null,
    email: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) ? `mailto:${email}?subject=${encodeURIComponent('Pedido de booking — DJ M4rquez')}&body=${encodeURIComponent(message)}` : null,
  };
}
