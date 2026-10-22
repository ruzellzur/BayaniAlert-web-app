import { forwardRef } from 'react';

/**
 * Tag Component
 *
 * Styling comes entirely from the prototype stylesheet
 * (.tag / .tag-pending / .tag-accepted / .tag-declined).
 *
 * @param {string} variant - pending | accepted | declined
 */
const Tag = forwardRef(({
  variant = 'pending',
  children,
  className = '',
  ...props
}, ref) => (
  <span
    ref={ref}
    className={`tag tag-${variant} ${className}`}
    {...props}
  >
    {children}
  </span>
));

Tag.displayName = 'Tag';

export default Tag;
