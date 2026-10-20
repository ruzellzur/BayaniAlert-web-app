import { forwardRef } from 'react';

/**
 * Button Component
 *
 * A reusable button with multiple variants and states.
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
  const baseStyles = {
    border: 'none',
    borderRadius: '13px',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
    opacity: disabled ? 0.6 : 1,
    fontFamily: 'var(--font-body)',
    textDecoration: 'none',
  };

  const sizeStyles = {
    sm: { padding: '8px 12px', fontSize: '13px', borderRadius: '10px' },
    md: { padding: '12px 16px', fontSize: '14.5px' },
    lg: { padding: '14px 20px', fontSize: '15px', borderRadius: '15px' },
  };

  const variantStyles = {
    primary: {
      background: 'var(--grad-primary)',
      color: 'var(--on-strong)',
      boxShadow: '0 6px 16px rgba(27,42,74,0.28)',
    },
    accent: {
      background: 'var(--grad-accent)',
      color: 'var(--accent-ink)',
      boxShadow: '0 6px 16px rgba(226,154,59,0.35)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink)',
      border: '1.5px solid var(--border)',
    },
    safe: {
      background: 'var(--grad-safe)',
      color: '#fff',
      boxShadow: '0 6px 16px rgba(63,125,88,0.32)',
    },
    danger: {
      background: 'var(--grad-danger)',
      color: '#fff',
      boxShadow: '0 6px 16px rgba(193,68,60,0.32)',
    },
  };

  const blockStyles = block ? { width: '100%' } : {};

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...blockStyles,
      }}
      className={`btn btn-${variant} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          width={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          height={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
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
