/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer effect.
 *
 * @param {string} variant - text | circle | rect | card
 * @param {number} width - Width in pixels or string
 * @param {number} height - Height in pixels or string
 * @param {number} lines - Number of text lines (for text variant)
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style = {}
}) {
  const baseStyles = {
    background: 'linear-gradient(90deg, var(--surface-alt) 0%, var(--surface) 20%, var(--surface-alt) 40%, var(--surface) 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: '8px',
  };

  const variantStyles = {
    text: {
      height: '14px',
      width: width || '100%',
      marginBottom: lines > 1 ? '8px' : 0,
    },
    circle: {
      width: width || 40,
      height: height || 40,
      borderRadius: '50%',
    },
    rect: {
      width: width || '100%',
      height: height || 100,
      borderRadius: '12px',
    },
    card: {
      width: width || '100%',
      height: height || 120,
      borderRadius: '18px',
    },
  };

  const linesArray = Array.from({ length: lines }, (_, i) => i);

  return (
    <>
      {variant === 'text' && lines > 1 ? (
        linesArray.map((i) => (
          <div
            key={i}
            style={{
              ...baseStyles,
              ...variantStyles.text,
              width: i === lines - 1 ? '70%' : '100%',
            }}
            className={className}
          />
        ))
      ) : (
        <div
          style={{ ...baseStyles, ...variantStyles[variant], ...style }}
          className={className}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default Skeleton;
