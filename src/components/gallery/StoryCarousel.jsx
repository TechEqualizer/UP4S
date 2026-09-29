import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { MediaCard } from '@/components/gallery/MediaCard';
import { cn } from '@/lib/utils';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

// Netflix-style row of stories. Advances one card every `interval` ms and loops
// seamlessly (the list is rendered twice; after passing the first copy the row
// jumps back by exactly one copy's width, which looks identical). Pauses on hover,
// keyboard focus, touch/drag, when off screen, when the tab is hidden, when
// `paused` is set (e.g. a story is open) and for reduced motion. Swipe and arrow
// buttons always work; a pause button satisfies WCAG 2.2.2.
export default function StoryCarousel({ items, onOpen, paused = false, interval = 4500, label = 'Stories' }) {
  const regionRef = useRef(null);
  const scrollerRef = useRef(null);
  const idleTimer = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  const [reduced] = useState(prefersReducedMotion);
  const [tick, setTick] = useState(0); // restarts the timer after every move
  const [active, setActive] = useState(0);

  const count = items.length;
  const loop = count >= 4;
  const slides = loop ? [...items, ...items] : items;
  const autoplay = loop && !reduced && !userPaused;
  const isPaused = !autoplay || paused || hovered || focused || interacting || !inView || !pageVisible;

  const stepWidth = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.children.length < 2) return el?.clientWidth ?? 0;
    return el.children[1].offsetLeft - el.children[0].offsetLeft;
  }, []);

  // Instant scroll with snapping off, so a loop jump is invisible.
  const jumpTo = useCallback((left) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';
    el.scrollLeft = left;
    requestAnimationFrame(() => {
      el.style.scrollSnapType = '';
      el.style.scrollBehavior = '';
    });
  }, []);

  const move = useCallback((direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = stepWidth();
    if (loop) {
      const copyWidth = step * count;
      // Going back from the very start: hop into the second copy first.
      if (direction < 0 && el.scrollLeft < step / 2) jumpTo(el.scrollLeft + copyWidth);
      // Going forward near the end of the second copy: hop back one copy first.
      if (direction > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - step / 2) jumpTo(el.scrollLeft - copyWidth);
    }
    requestAnimationFrame(() => el.scrollBy({ left: direction * step, behavior: reduced ? 'auto' : 'smooth' }));
    setTick((t) => t + 1);
  }, [count, jumpTo, loop, reduced, stepWidth]);

  // Keep the position inside the first copy and track which story is first in view.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    let frame = 0;
    let settle;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const step = stepWidth();
        if (step) setActive(Math.round(el.scrollLeft / step) % Math.max(count, 1));
      });
      clearTimeout(settle);
      settle = setTimeout(() => {
        const copyWidth = stepWidth() * count;
        if (loop && copyWidth && el.scrollLeft >= copyWidth - 1) jumpTo(el.scrollLeft - copyWidth);
      }, 160);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [count, jumpTo, loop, stepWidth]);

  // Only run while on screen and while the tab is visible.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
      : null;
    if (observer) observer.observe(el); else setInView(true);
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // A swapped icon under the cursor can swallow the mouseleave event; re-check the
  // real hover state so the row never stays paused after the pointer has gone.
  useEffect(() => {
    if (!hovered) return undefined;
    const check = setInterval(() => {
      if (regionRef.current && !regionRef.current.matches(':hover')) setHovered(false);
    }, 1000);
    return () => clearInterval(check);
  }, [hovered]);

  // The timer: one move per interval while not paused.
  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setTimeout(() => move(1), interval);
    return () => clearTimeout(timer);
  }, [isPaused, tick, interval, move]);

  // Touch, drag or trackpad scrolling pauses autoplay until the person has been idle a few seconds.
  const noteInteraction = () => {
    setInteracting(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setInteracting(false);
      setTick((t) => t + 1);
    }, 5000);
  };
  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const arrow = 'absolute top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-lg ring-1 ring-gray-900/10 backdrop-blur transition hover:scale-105 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:flex';

  return (
    <div
      ref={regionRef}
      className="group/carousel relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    >
      <div
        ref={scrollerRef}
        onPointerDown={noteInteraction}
        onTouchStart={noteInteraction}
        onWheel={(e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) noteInteraction(); }}
        className={cn(
          // Full-bleed to the page gutters; vertical room for the hover zoom.
          '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 py-6 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-8 lg:px-8',
          'scroll-px-4 sm:scroll-px-6 lg:scroll-px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          // Soft fade where cards run off the edges on large screens.
          'lg:[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]'
        )}
      >
        {slides.map((item, index) => {
          const clone = index >= count;
          return (
            <div
              key={`${item.id}-${clone ? 'b' : 'a'}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(index % count) + 1} of ${count}`}
              aria-hidden={clone || undefined}
              {...(clone ? { inert: '' } : {})}
              className={cn(
                'w-[82%] shrink-0 snap-start transition-transform duration-300 ease-out min-[480px]:w-[60%] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]',
                '[@media(hover:hover)]:hover:z-10 [@media(hover:hover)]:hover:scale-[1.05]'
              )}
            >
              <MediaCard item={item} onOpen={onOpen} className="h-full" />
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button type="button" onClick={() => move(-1)} aria-label="Previous story" className={cn(arrow, '-left-3 opacity-0 group-hover/carousel:opacity-100 lg:-left-5')}>
            <ChevronLeft className="pointer-events-none h-6 w-6" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next story" className={cn(arrow, '-right-3 opacity-0 group-hover/carousel:opacity-100 lg:-right-5')}>
            <ChevronRight className="pointer-events-none h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}

      {loop && (
        <div className="mt-1 flex items-center gap-4">
          {!reduced && (
            <button
              type="button"
              onClick={() => { setUserPaused((v) => !v); setTick((t) => t + 1); }}
              aria-label={userPaused ? 'Play stories' : 'Pause stories'}
              aria-pressed={userPaused}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {userPaused
                ? <Play className="pointer-events-none ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                : <Pause className="pointer-events-none h-4 w-4 fill-current" aria-hidden="true" />}
            </button>
          )}
          {/* Segmented position indicator; the current segment fills with the timer. */}
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {items.map((item, index) => (
              <span key={item.id} className="relative h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                {index === active && (
                  <span
                    key={tick}
                    className="absolute inset-0 origin-left rounded-full bg-blue-600"
                    style={autoplay
                      ? { animation: `hero-progress ${interval}ms linear forwards`, animationPlayState: isPaused ? 'paused' : 'running' }
                      : undefined}
                  />
                )}
              </span>
            ))}
          </div>
          <p className="shrink-0 text-sm tabular-nums text-gray-500">
            {active + 1} <span className="text-gray-300">/</span> {count}
          </p>
        </div>
      )}
    </div>
  );
}
