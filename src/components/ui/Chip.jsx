import { forwardRef } from 'react';

/**
 * Chip Component
 *
 * Styling comes entirely from the prototype stylesheet (.chip / .chip.active).
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
}, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={`chip ${active ? 'active' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
));

Chip.displayName = 'Chip';

export default Chip;
