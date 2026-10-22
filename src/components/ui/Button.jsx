import { forwardRef } from 'react';

/**
 * Button Component
 *
 * Styling comes entirely from the prototype stylesheet (.btn / .btn-*),
 * so the rendered result is pixel-identical to the prototype's markup.
 *
 * @param {string} variant - primary | accent | ghost | safe | danger
 * @param {string} size - sm | md | lg
 * @param {boolean} loading - Shows loading spinner
 * @param {boolean} disabled - Disables the button
 * @param {boolean} block - Full width button
 * @param {ReactNode} children - Button content
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  block = false,
  children,
  className = '',
  ...props
}, ref) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          width={spinnerSize}
          height={spinnerSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
