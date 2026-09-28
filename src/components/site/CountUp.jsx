import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Splits "150+" into { prefix: '', number: 150, suffix: '+' } so only the digits animate.
function parse(value) {
  const match = String(value).match(/^(\D*)([\d,]+)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], number: Number(match[2].replace(/,/g, '')), suffix: match[3] };
}

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Counts up to `value` the first time it scrolls into view.
// `from` sets the starting number (e.g. a year counts up from 2000, not 0).
// Screen readers always get the final value; the final text also reserves the width,
// so centred numbers don't shift while digits are added.
export default function CountUp({ value, from = 0, duration = 1800, delay = 0, className }) {
  const parsed = parse(value);
  const ref = useRef(null);
  const [current, setCurrent] = useState(() => (parsed && !prefersReducedMotion() ? from : parsed?.number));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!parsed || prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }
    const node = ref.current;
    let frame;
    let timeout;
    const start = () => {
      setVisible(true);
      timeout = setTimeout(() => {
        const startedAt = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          setCurrent(Math.round(from + (parsed.number - from) * easeOutExpo(progress)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, delay);
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
    // Run once per value; `parsed` is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, from, duration, delay]);

  if (!parsed) return <span className={className}>{value}</span>;

  const formatted = parsed.number >= 10000 ? current.toLocaleString('en-US') : String(current);

  return (
    <span ref={ref} className={cn('relative inline-grid tabular-nums', className)}>
      <span className="sr-only">{value}</span>
      {/* Invisible final value keeps the box at its final width. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">{value}</span>
      <span
        aria-hidden="true"
        className={cn(
          'col-start-1 row-start-1 transition-[opacity,transform] duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {parsed.prefix}{formatted}{parsed.suffix}
      </span>
    </span>
  );
}
