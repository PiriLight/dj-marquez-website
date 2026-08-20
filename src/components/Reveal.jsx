import { useReveal } from '../hooks/useReveal.js';

/**
 * Fade-up-on-scroll wrapper. Renders `as` (default div) with the
 * m4rq-reveal / m4rq-visible classes driven by useReveal.
 */
export default function Reveal({ as: Tag = 'div', className = '', style, children, ...rest }) {
  const [ref, visible] = useReveal();
  const classes = ['m4rq-reveal', visible ? 'm4rq-visible' : '', className].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}
