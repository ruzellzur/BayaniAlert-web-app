import { forwardRef } from 'react';

/**
 * Chip Component
 *
 * A filter chip with active state.
 *
 * @param {boolean} active - Active/selected state
 * @param {function} onClick - Click handler
 */
const Chip = forwardRef(({
  active = false,
  onClick,
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = {
    border: `1.5px solid ${active ? 'transparent' : 'var(--border)'}`,
    background: active ? 'var(--grad-primary)' : 'var(--surface)',
    color: active ? 'var(--on-strong)' : 'var(--ink-soft)',
    fontSize: '12.5px',
    fontWeight: 600,
    padding: '7px 13px',
    borderRadius: '999px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  };

  const handleMouseEnter = (e) => {
    if (!active) {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.color = 'var(--accent)';
    }
  };

  const handleMouseLeave = (e) => {
    if (!active) {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.color = 'var(--ink-soft)';
    }
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={baseStyles}
      className={`chip ${active ? 'active' : ''} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
});

Chip.displayName = 'Chip';

export default Chip;
