import { forwardRef } from 'react';

/**
 * Input Component
 *
 * Renders the prototype's `.field > label + input` structure so the
 * stylesheet drives every visual property.
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
  id,
  name,
  ...props
}, ref) => {
  const inputId = id || name;
  const describedBy = error
    ? `${inputId || 'field'}-error`
    : hint
      ? `${inputId || 'field'}-hint`
      : undefined;

  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        disabled={disabled}
        required={required}
        className={error ? 'field-error' : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <span id={describedBy} className="error-text" role="alert">
          {error}
        </span>
      )}
      {hint && !error && (
        <span id={describedBy} className="error-text" style={{ color: 'var(--ink-soft)' }}>
          {hint}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
