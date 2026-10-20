import { forwardRef, useState } from 'react';

/**
 * Input Component
 *
 * A form input with label, validation, and error states.
 *
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} hint - Helper text
 * @param {boolean} required - Required field
 * @param {boolean} disabled - Disabled state
 * @param {string} type - Input type (text, email, password, etc.)
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  required = false,
  disabled = false,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px',
  };

  const labelStyles = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ink-soft)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const inputStyles = {
    border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '12px',
    padding: '11px 13px',
    fontFamily: 'var(--font-body)',
    fontSize: '13.5px',
    background: 'var(--surface)',
    color: 'var(--ink)',
    width: '100%',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const errorStyles = {
    fontSize: '11px',
    color: 'var(--danger)',
    fontWeight: 600,
    marginTop: '2px',
  };

  const hintStyles = {
    fontSize: '11px',
    color: 'var(--ink-soft)',
    marginTop: '2px',
  };

  const handleFocus = (e) => {
    setFocused(true);
    e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)';
    e.target.style.boxShadow = error ? 'var(--focus-ring-danger)' : 'var(--focus-ring)';
  };

  const handleBlur = (e) => {
    setFocused(false);
    e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        required={required}
        style={inputStyles}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id || props.name}-error` : hint ? `${props.id || props.name}-hint` : undefined}
        {...props}
      />
      {error && (
        <div id={`${props.id || props.name}-error`} style={errorStyles} role="alert">
          {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${props.id || props.name}-hint`} style={hintStyles}>
          {hint}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
