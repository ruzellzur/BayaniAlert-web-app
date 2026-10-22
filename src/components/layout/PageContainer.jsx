import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageContainer Component
 *
 * Renders the prototype's `.screen` wrapper. Screens are the scrolling region
 * inside `.app`, so all padding/scroll behaviour comes from the stylesheet.
 * The `auth` variant reuses `.auth-wrap` for the login/register screens.
 *
 * @param {string} variant - default | auth | dashboard
 * @param {string} maxWidth - optional max-width override
 * @param {boolean} animate - Enable the screen enter animation (default: true)
 * @param {string} className - Additional classes
 */
export function PageContainer({
  variant = 'default',
  maxWidth,
  animate = true,
  children,
  className = '',
  style = {},
  ...props
}) {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const classes = [
    'screen',
    'active',
    variant === 'auth' ? 'auth-wrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = {
    ...(maxWidth ? { maxWidth } : {}),
    ...(animate ? {} : { animation: 'none' }),
    ...style,
  };

  return (
    <div className={classes} style={mergedStyle} {...props}>
      {children}
    </div>
  );
}

/**
 * Section Component
 *
 * A section with the prototype's `.section-label` header.
 */
export function Section({ title, action, actionLabel, children, style = {} }) {
  return (
    <section style={style}>
      {title && (
        <div className="section-label">
          <h3>{title}</h3>
          {action && (
            <span onClick={action} role="button" tabIndex={0}>
              {actionLabel || 'See all'}
            </span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default PageContainer;
