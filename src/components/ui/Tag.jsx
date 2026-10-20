import { forwardRef } from 'react';

/**
 * Tag Component
 *
 * A status tag with color variants.
 *
 * @param {string} variant - pending | accepted | declined
 */
const Tag = forwardRef(({
  variant = 'pending',
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    fontWeight: 600,
    padding: '4px 9px',
    borderRadius: '999px',
  };

  const variantStyles = {
    pending: {
      background: 'var(--surface-alt)',
      color: 'var(--ink-soft)',
    },
    accepted: {
      background: 'var(--safe-bg)',
      color: 'var(--safe)',
    },
    declined: {
      background: 'var(--danger-bg)',
      color: 'var(--danger)',
    },
  };

  return (
    <span
      ref={ref}
      style={{ ...baseStyles, ...variantStyles[variant] }}
      className={`tag tag-${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Tag.displayName = 'Tag';

export default Tag;
