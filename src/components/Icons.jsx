export function InstagramIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5"></rect>
      <circle cx="12" cy="12" r="4.2"></circle>
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"></circle>
    </svg>
  );
}

export function YouTubeIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5"></rect>
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none"></path>
    </svg>
  );
}

export function GoogleDriveIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" aria-hidden="true" focusable="false">
      <path fill="#0066da" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" />
      <path fill="#00ac47" d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 47.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" />
      <path fill="#ea4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 47.5c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 13.9z" />
      <path fill="#00832d" d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" />
      <path fill="#2684fc" d="M59.8 52H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h51.05c1.6 0 3.15-.45 4.5-1.2z" />
      <path fill="#ffba00" d="M73.4 26.5L60.65 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 52h27.45c0-1.55-.4-3.1-1.2-4.5z" />
    </svg>
  );
}

export function CalendarIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5"></rect>
      <path d="M3 9.5h18"></path>
      <path d="M8 3v3M16 3v3"></path>
    </svg>
  );
}
