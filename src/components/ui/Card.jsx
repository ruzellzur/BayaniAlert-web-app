import { forwardRef } from 'react';

/**
 * Card Component
 *
 * A flexible card container with variants and padding options.
 *
 * @param {string} variant - default | elevated | interactive
 * @param {string} padding - none | sm | md | lg
 * @param {boolean} interactive - Adds hover effects and cursor pointer
 * @param {function} onClick - Click handler
 */
const Card = forwardRef(({
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick,
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const baseStyles = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  };

  const variantStyles = {
    default: {
      boxShadow: 'var(--card-shadow)',
    },
    elevated: {
      boxShadow: 'var(--elevation-3)',
    },
    interactive: {
      boxShadow: 'var(--card-shadow)',
      cursor: 'pointer',
    },
  };

  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: 'var(--space-3)' },
    md: { padding: 'var(--space-4)' },
    lg: { padding: 'var(--space-6)' },
  };

  const interactiveStyles = interactive || onClick ? {
    cursor: 'pointer',
  } : {};

  const handleMouseEnter = (e) => {
    if (interactive || onClick) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--elevation-3)';
      e.currentTarget.style.borderColor = 'var(--accent)';
    }
  };

  const handleMouseLeave = (e) => {
    if (interactive || onClick) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = variantStyles[variant]?.boxShadow || 'var(--card-shadow)';
      e.currentTarget.style.borderColor = 'var(--border)';
    }
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...paddingStyles[padding],
        ...interactiveStyles,
        ...style,
      }}
      className={`card card-${variant} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
