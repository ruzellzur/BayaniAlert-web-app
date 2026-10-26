import { forwardRef } from 'react';

/**
 * Card Component
 *
 * Styling comes entirely from the prototype stylesheet (.card).
 *
 * @param {string} variant - default | elevated | interactive
 * @param {string} padding - none | sm | md | lg (only `none` is honoured;
 *   every other value uses the prototype's 16px card padding)
 * @param {boolean} interactive - Adds hover affordance
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
  const classes = [
    'card',
    variant === 'elevated' ? 'card-elevated' : '',
    variant === 'interactive' ? 'card-interactive' : '',
    interactive || onClick ? 'card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = padding === 'none' ? { padding: 0, ...style } : style;

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={classes}
      style={mergedStyle}
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
