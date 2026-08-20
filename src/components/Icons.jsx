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

export function CalendarIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5"></rect>
      <path d="M3 9.5h18"></path>
      <path d="M8 3v3M16 3v3"></path>
    </svg>
  );
}
