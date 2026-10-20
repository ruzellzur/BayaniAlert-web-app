import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast Component
 *
 * A notification toast with auto-dismiss and animations.
 *
 * @param {string} message - Toast message
 * @param {number} duration - Duration in ms (default: 3000)
 * @param {function} onDismiss - Callback when dismissed
 * @param {string} variant - default | success | error | warning
 */
export function Toast({
  message,
  duration = 3000,
  onDismiss,
  variant = 'default',
  visible = true
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible && message) {
      // Trigger animation
      requestAnimationFrame(() => {
        setShow(true);
      });

      // Auto dismiss
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          onDismiss?.();
        }, 250); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message, duration, onDismiss]);

  if (!message) return null;

  const baseStyles = {
    position: 'fixed',
    left: '20px',
    right: '20px',
    bottom: '96px',
    padding: '13px 16px',
    borderRadius: '14px',
    fontSize: '13px',
    fontWeight: 600,
    textAlign: 'center',
    boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
    zIndex: 'var(--z-toast)',
    transform: show ? 'translateY(0)' : 'translateY(20px)',
    opacity: show ? 1 : 0,
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    maxWidth: '400px',
    margin: '0 auto',
  };

  const variantStyles = {
    default: {
      background: 'var(--strong)',
      color: 'var(--on-strong)',
    },
    success: {
      background: 'var(--grad-safe)',
      color: '#fff',
    },
    error: {
      background: 'var(--grad-danger)',
      color: '#fff',
    },
    warning: {
      background: 'var(--grad-accent)',
      color: 'var(--accent-ink)',
    },
  };

  return createPortal(
    <div
      style={{ ...baseStyles, ...variantStyles[variant] }}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>,
    document.body
  );
}

export default Toast;
