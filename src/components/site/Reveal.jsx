import React, { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Fades content up once as it scrolls into view. Uses inline styles so the settled
// state is `transform: none` (a leftover transform would trap position:fixed children).
export default function Reveal({ as: Comp = 'div', delay = 0, className, style, children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (shown) return undefined;
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Comp
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(24px)',
        transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
      }}
      {...props}
    >
      {children}
    </Comp>
  );
}
