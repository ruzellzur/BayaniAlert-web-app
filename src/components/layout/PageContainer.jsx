import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageContainer Component
 *
 * A consistent page wrapper with proper spacing, scrolling, and animations.
 * Handles page transitions and scroll restoration.
 *
 * @param {string} variant - default | auth | dashboard
 * @param {string} maxWidth - max-width for content (default: 640px)
 * @param {boolean} animate - Enable page enter animation (default: true)
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

  const baseStyles = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
  };

  const variantStyles = {
    default: {
      padding: 'var(--space-1) var(--space-5) 100px',
    },
    auth: {
      padding: 0,
    },
    dashboard: {
      padding: 'var(--space-1) var(--space-5) 100px',
    },
  };

  const maxWidthStyles = maxWidth ? { maxWidth } : {};

  const animationStyles = animate ? {
    animation: 'pageEnter var(--duration-base) var(--ease-out) forwards',
  } : {};

  return (
    <div
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...maxWidthStyles,
        ...animationStyles,
        ...style,
      }}
      className={`page-container page-${variant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * PageHeader Component
 *
 * A consistent page header with title and optional actions.
 */
export function PageHeader({ title, subtitle, actions, children, style = {} }) {
  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-3)',
    padding: 'var(--space-5) var(--space-5) var(--space-4)',
    position: 'sticky',
    top: 0,
    background: 'var(--bg)',
    zIndex: 'var(--z-sticky)',
    ...style,
  };

  const titleStyles = {
    flex: 1,
    minWidth: 0,
  };

  return (
    <header style={headerStyles}>
      <div style={titleStyles}>
        {title && <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600 }}>{title}</h2>}
        {subtitle && <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>{subtitle}</p>}
        {children}
      </div>
      {actions && <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>{actions}</div>}
    </header>
  );
}

/**
 * PageContent Component
 *
 * Main content area with proper spacing.
 */
export function PageContent({ children, style = {} }) {
  return (
    <div style={{ padding: '0 var(--space-5)', ...style }}>
      {children}
    </div>
  );
}

/**
 * Section Component
 *
 * A section with label and optional action link.
 */
export function Section({ title, action, actionLabel, children, style = {} }) {
  const sectionStyles = {
    margin: 'var(--space-6) 0 var(--space-3)',
    ...style,
  };

  const labelStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-3)',
  };

  return (
    <section style={sectionStyles}>
      {title && (
        <div style={labelStyles}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600 }}>{title}</h3>
          {action && (
            <button
              onClick={action}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--ink-soft)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {actionLabel || 'See all'}
            </button>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default PageContainer;
