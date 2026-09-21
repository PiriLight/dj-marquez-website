import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BOOKING_CONTACTS, SITE_LINKS } from '../config/site.js';
import { BOOKING_FIELDS, bookingLinks, localDate, validateBooking } from '../utils/booking.js';

export default function BookingForm({ onClose }) {
  const dialogRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [readyLink, setReadyLink] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
    const issues = validateBooking(values);
    setErrors(issues);
    setReadyLink(null);
    if (Object.keys(issues).length) {
      setStatus('Revê os campos assinalados antes de continuar.');
      form.elements.namedItem(Object.keys(issues)[0])?.focus();
      return;
    }
    const channel = event.nativeEvent.submitter?.value || 'whatsapp';
    const url = bookingLinks(values, BOOKING_CONTACTS)[channel];
    if (!url) {
      setStatus(channel === 'email' ? 'O contacto de email ainda não está disponível. Podes enviar o pedido por WhatsApp.' : 'O WhatsApp está temporariamente indisponível. Contacta a Beat Wave.');
      return;
    }
    setReadyLink({ url, channel });
    setStatus('Mensagem pronta. Revê e confirma o envio na aplicação que abriste. O pedido ainda não foi enviado pelo site.');
    if (channel === 'whatsapp') window.open(url, '_blank', 'noopener,noreferrer');
    else window.location.href = url;
  }

  return createPortal(
    <dialog ref={dialogRef} className="m4rq-booking-dialog" aria-labelledby="booking-form-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="m4rq-booking-sheet">
        <header className="m4rq-booking-form-header">
          <div><p className="m4rqx-eyebrow">Booking / DJ Sets</p><h2 id="booking-form-title" tabIndex={-1} autoFocus>Agendar artista</h2></div>
          <button type="button" className="m4rq-booking-close" aria-label="Fechar ficha de booking" onClick={onClose}>×</button>
        </header>
        <form noValidate onSubmit={submit} onChange={() => { setReadyLink(null); setStatus(''); }}>
          <p className="m4rq-booking-help">Conta-nos o essencial da tua noite. Os campos com * são obrigatórios; indica pelo menos um telefone ou email.</p>
          {BOOKING_FIELDS.map((group, index) => (
            <fieldset key={group.title}>
              <legend><span aria-hidden="true">0{index + 1}</span> {group.title}</legend>
              <div className="m4rq-booking-fields">
                {group.fields.map((field) => {
                  const props = { id: `booking-${field.name}`, name: field.name, required: field.required, 'aria-invalid': !!errors[field.name], 'aria-describedby': errors[field.name] ? `booking-${field.name}-error` : undefined };
                  return <div key={field.name} className={field.multiline ? 'm4rq-booking-field is-wide' : 'm4rq-booking-field'}>
                    <label htmlFor={props.id}>{field.label}{field.required ? ' *' : ''}</label>
                    {field.options ? <select {...props}>{field.options.map((option) => <option key={option}>{option}</option>)}</select>
                      : field.multiline ? <textarea {...props} rows={3} maxLength={1000} />
                        : <input {...props} type={field.type || 'text'} autoComplete={field.autoComplete || 'off'} min={field.type === 'date' ? localDate() : field.min} step={field.step} maxLength={160} />}
                    {errors[field.name] && <span id={`booking-${field.name}-error`} className="m4rq-booking-error">{errors[field.name]}</span>}
                  </div>;
                })}
              </div>
            </fieldset>
          ))}
          <div className="m4rq-booking-actions">
            <p role="status" aria-live="polite" className="m4rq-booking-status">{status}</p>
            <button type="submit" name="channel" value="whatsapp" className="m4rqx-primary-cta">Enviar pedido por WhatsApp <span aria-hidden="true">↗</span></button>
            <button type="submit" name="channel" value="email" className="m4rq-booking-email" disabled={!BOOKING_CONTACTS.email}>Enviar por email</button>
            {!BOOKING_CONTACTS.email && <p className="m4rq-booking-help">Email ainda indisponível. O booking está disponível por WhatsApp.</p>}
            {readyLink && <a className="m4rqx-video-fallback" href={readyLink.url} target={readyLink.channel === 'whatsapp' ? '_blank' : undefined} rel="noopener noreferrer">Se a aplicação não abriu, abre a mensagem preparada ↗</a>}
            <p className="m4rq-booking-help">Os dados ficam apenas nesta ficha até a fechares. Ao continuar, são partilhados com a aplicação escolhida.</p>
            <a className="m4rq-booking-agency-link" href={SITE_LINKS.agency} target="_blank" rel="noopener noreferrer">Representação / Booking · Beat Wave ↗</a>
          </div>
        </form>
      </div>
    </dialog>, document.body,
  );
}
