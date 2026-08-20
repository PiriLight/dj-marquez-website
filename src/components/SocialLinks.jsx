import { InstagramIcon, YouTubeIcon } from './Icons.jsx';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/m4rquezdj/', Icon: InstagramIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@m4rquezdj', Icon: YouTubeIcon },
];

const ICON_SIZES = { Instagram: 19, YouTube: 20 };
const ICON_SIZES_SM = { Instagram: 15, YouTube: 16 };

/**
 * Social icon row. `size="large"` matches the hero's glass circles,
 * `size="small"` matches the footer's compact circles. The row centres itself,
 * so it stays balanced whatever the platform count is.
 */
export default function SocialLinks({ size = 'large', gap }) {
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
