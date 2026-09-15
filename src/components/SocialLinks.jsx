import { InstagramIcon, YouTubeIcon } from './Icons.jsx';
import { SITE_LINKS } from '../config/site.js';

const SOCIALS = [
  { label: 'Instagram', handle: '@m4rquezdj', href: SITE_LINKS.instagram, Icon: InstagramIcon, accent: '#e1306c' },
  { label: 'YouTube', handle: 'Ver canal', href: SITE_LINKS.youtube, Icon: YouTubeIcon, accent: '#ff3b3b' },
];

const ICON_SIZES = { Instagram: 19, YouTube: 20 };
const ICON_SIZES_SM = { Instagram: 15, YouTube: 16 };
const ICON_SIZES_LABELED = { Instagram: 22, YouTube: 23 };

/**
 * Social link row. `size="large"` matches the hero's glass circles,
 * `size="small"` matches the (icon-only) compact circles, `size="labeled"` is
 * the larger icon + name + handle treatment used in the footer. The row
 * centres itself, so it stays balanced whatever the platform count is.
 */
export default function SocialLinks({ size = 'large', gap }) {
  if (size === 'labeled') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: gap ?? 14, justifyContent: 'center' }}>
        {SOCIALS.map(({ label, handle, href, Icon, accent }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}: ${handle}`}
            className="m4rqx-social-labeled"
            style={{
              '--m4rqx-social-accent': accent,
              flex: '1 1 216px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 20px',
              background: 'rgba(20,15,12,0.4)',
              border: '1px solid rgba(245,240,232,0.16)',
              color: '#f5f0e8',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            <span
              className="m4rqx-social-labeled-icon"
              aria-hidden="true"
              style={{ display: 'inline-flex', color: '#f0dcc0', transition: 'color 0.2s ease' }}
            >
              <Icon size={ICON_SIZES_LABELED[label]} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#f5f0e8' }}>
                {label}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>{handle}</span>
            </span>
          </a>
        ))}
      </div>
    );
  }

  const isLarge = size === 'large';
  const dim = isLarge ? 46 : 36;
  const iconSizes = isLarge ? ICON_SIZES : ICON_SIZES_SM;
  const className = isLarge ? 'm4rq-social' : 'm4rq-social m4rq-social-sm';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: gap ?? (isLarge ? 22 : 14) }}>
      {SOCIALS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={className}
          style={{
            width: dim,
            height: dim,
            background: 'rgba(20,15,12,0.4)',
            backdropFilter: isLarge ? 'blur(6px)' : undefined,
            border: `${isLarge ? 1.5 : 1.5}px solid rgba(207,138,63,${isLarge ? 0.55 : 0.5})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f0dcc0',
            textDecoration: 'none',
            transition: isLarge
              ? 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
              : 'transform 0.2s ease, border-color 0.2s ease',
          }}
        >
          <Icon size={iconSizes[label]} />
        </a>
      ))}
    </div>
  );
}
