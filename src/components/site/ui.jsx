import React from 'react';
import { cn } from '@/lib/utils';

// Shared building blocks for the public site. See .claude/skills/ui-design/SKILL.md.

const CTA_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const CTA_VARIANTS = {
  // Main action (Donate). One per view.
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-700/30 focus-visible:ring-blue-600',
  // Refer a Kid
  accent:
    'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20 hover:from-yellow-500 hover:to-yellow-500 focus-visible:ring-yellow-500',
  secondary:
    'border border-gray-300 bg-white text-gray-900 shadow-sm hover:border-gray-400 hover:bg-gray-50 focus-visible:ring-blue-600',
  // On photos / dark bands
  light: 'bg-white text-gray-900 shadow-lg hover:bg-gray-100 focus-visible:ring-white focus-visible:ring-offset-gray-900',
  ghostLight:
    'border border-white/40 bg-white/5 text-white backdrop-blur-sm hover:border-white/70 hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-gray-900',
};

const CTA_SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-12 px-7 text-base sm:h-14 sm:px-8',
};

export function ctaClass(variant = 'primary', size = 'md', className) {
  return cn(CTA_BASE, CTA_VARIANTS[variant], CTA_SIZES[size], className);
}

export function Container({ className, children, size = 'default' }) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', size === 'narrow' ? 'max-w-3xl' : 'max-w-7xl', className)}>
      {children}
    </div>
  );
}

export function Section({ className, children, id, tone = 'white', ...props }) {
  const tones = { white: 'bg-white', muted: 'bg-gray-50', dark: 'bg-gray-950 text-white' };
  return (
    <section id={id} className={cn('py-16 sm:py-24', tones[tone], className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({ children, tone = 'light', className }) {
  return (
    <p className={cn(
      'inline-flex items-center gap-2.5 font-sans text-xs font-bold uppercase tracking-[0.22em]',
      tone === 'dark' ? 'text-yellow-400' : 'text-blue-600',
      className
    )}>
      <span aria-hidden="true" className={cn('h-px w-6', tone === 'dark' ? 'bg-yellow-400/70' : 'bg-blue-600/60')} />
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, lede, align = 'center', tone = 'light', action, className, as: H = 'h2' }) {
  const centered = align === 'center';
  return (
    <div className={cn(
      'mb-10 sm:mb-14',
      action ? 'flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between' : '',
      centered && !action && 'mx-auto max-w-3xl text-center',
      className
    )}>
      <div className={cn(!centered && 'max-w-2xl')}>
        {eyebrow && <Eyebrow tone={tone} className="mb-3">{eyebrow}</Eyebrow>}
        <H className={cn(
          'font-display text-display-lg font-bold',
          tone === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          {title}
        </H>
        {lede && (
          <p className={cn(
            'mt-5 text-pretty text-lg leading-relaxed sm:text-[1.1875rem]',
            tone === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            {lede}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Top band for interior pages (About, Gallery, Support Us, Refer a Kid).
export function PageHeader({ eyebrow, title, lede, children, className }) {
  return (
    <header className={cn('relative isolate overflow-hidden border-b border-gray-100 bg-gray-50', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(37,99,235,0.12),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(to_right,rgb(229_231_235)_1px,transparent_1px),linear-gradient(to_bottom,rgb(229_231_235)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
      />
      <Container className="py-16 text-center sm:py-24">
        {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
        <h1 className="mx-auto max-w-4xl font-display text-display-xl font-bold text-gray-900">
          {title}
        </h1>
        {lede && <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-gray-600 sm:text-xl">{lede}</p>}
        {children && <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">{children}</div>}
      </Container>
    </header>
  );
}

// Serif italic accent for a word or phrase inside a display heading.
// tone: 'brand' (blue), 'gold' (yellow, for dark backgrounds) or 'inherit'.
export function Accent({ children, tone = 'brand' }) {
  const colors = { brand: 'text-blue-600', gold: 'text-yellow-400', inherit: '' };
  return <em className={cn('accent', colors[tone])}>{children}</em>;
}

export function Surface({ as: Comp = 'div', className, children, ...props }) {
  return (
    <Comp
      className={cn('rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]', className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

// Closing call-to-action card (blue gradient) used at the bottom of public pages.
export function CtaBand({ eyebrow, title, lede, children, footer }) {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-6 py-16 text-center shadow-2xl shadow-blue-900/20 sm:px-16 sm:py-24">
        <div aria-hidden="true" className="absolute -top-24 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        {eyebrow && <Eyebrow tone="dark" className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="mx-auto max-w-3xl font-display text-display-lg font-bold text-white">{title}</h2>
        {lede && <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-blue-100">{lede}</p>}
        {children && <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
        {footer && <div className="mt-10 flex flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-blue-100/90 sm:flex-row">{footer}</div>}
      </div>
    </section>
  );
}
