---
name: ui-design
description: Team UP4S design system and UI rules. Use whenever building or changing any page, component, card, table, form or admin screen in this repo so new UI matches the existing professional look (colors, spacing, type, cards, media, admin shell).
---

# Team UP4S UI design rules

The site should feel calm, polished and trustworthy: a nonprofit that handles donations and
children's stories. Favor restraint — whitespace, one accent colour, subtle borders — over
decoration. Keep the existing colour theme; do not introduce new brand colours.

## Foundations

- **Colour.** Primary action = `blue-600` (hover `blue-700`); the public hero/CTA gradient is
  `from-blue-600 to-blue-700`. Neutrals are Tailwind `gray`. Status colours only via
  `StatusBadge` tones (`green`, `yellow`, `blue`, `purple`, `orange`, `red`, `gray`).
- **Type.** See Typography below. Admin: page title `text-lg sm:text-xl`, section title
  `text-base`, panel title `text-sm font-semibold`, meta text `text-xs text-gray-500`.
  Money and counts use `tabular-nums`.
- **Spacing.** 4px grid. Card padding `p-4`/`p-5`; list rows `px-5 py-3`/`py-3.5`; gaps between
  cards `gap-4`, between page sections `space-y-6`. Page gutters `px-4 sm:px-6 lg:px-8`.
- **Surfaces.** `rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]`.
  Hover lift = `hover:shadow-md`, never scale the whole card. Admin page background `bg-gray-50/70`.
- **Focus.** Every interactive element needs a visible `focus-visible:ring-2 ring-blue-600`.

## Typography

Three self-hosted families (loaded in `src/main.jsx` via `@fontsource`, no Google Fonts):

| Role | Family | Tailwind | Use |
| --- | --- | --- | --- |
| Display | Bricolage Grotesque (variable, optical size) | `font-display` | h1–h3, big numbers |
| Accent | Instrument Serif *italic* | `.accent` / `<Accent>` | 1–4 words inside a display heading |
| Body | Figtree (variable) | `font-sans` (default) | everything else |

- Display sizes are fluid: `text-display-2xl` (homepage hero only), `text-display-xl` (page h1),
  `text-display-lg` (section h2, CTA band), `text-display-md`. They carry their own line-height
  and negative tracking; don't add `tracking-tight`/`leading-*` on top.
- Weights: hero `font-extrabold`; other display headings `font-bold`; card titles
  `font-display text-xl/2xl font-bold tracking-tight`.
- Accent: `<Accent>` (blue) on light backgrounds, `<Accent tone="gold">` on dark/blue. One accent
  per heading, on the emotional phrase ("Dreams made *real*"). Never accent body text or buttons.
  Pull quotes use `font-serif italic`.
- Eyebrows (`Eyebrow`): tiny bold uppercase with wide tracking and a short leading rule.
- Ledes are `text-lg`, `text-gray-600`, max ~65 characters per line.
- New font-size utilities must be registered in `extendTailwindMerge` in `src/lib/utils.js`, or
  `cn()` will drop them as if they were colours.

## Media (the #1 source of broken layouts)

Uploaded photos are often portrait phone shots. An `aspect-*` box without `overflow-hidden`
grows to the image's natural height, so cards in a grid end up wildly different heights.

Always:

```jsx
<div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
  <SmartImage src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
</div>
```

- Use `SmartImage` (never a bare `<img>`) so failed/blocked media shows a tidy placeholder.
- Admin grids use `aspect-[4/3]`; event/video cards use `aspect-video` / `aspect-[16/9]`.
- Thumbnails in lists: fixed `h-12 w-12 rounded-lg overflow-hidden`.

## Cards and lists

- One title line (`truncate`, full text in `title=`) and one meta line joined with ` · `.
- Card actions are icon buttons (`IconButton` from `components/admin/dashboard-ui.jsx`) with
  descriptive `aria-label`s like `Edit {title}`; destructive ones use `tone="danger"`.
- Grids: `grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4` for media;
  cards must be equal height — never let content decide height.

## Admin

- `AdminShell` (`components/admin/AdminShell.jsx`) owns chrome: fixed `w-64` sidebar with
  section counts, sticky blurred top bar with page title, description and actions, mobile drawer.
  `Layout.jsx` renders AdminDashboard bare; don't add another nav.
- Section state lives in `?tab=`; Overview is the default and has no param.
- Page-level actions (Add, Export) go in the top bar via `actions`; use `size="sm"` buttons.
- Tables sit inside `Panel`; a filter toolbar row above the table
  (`border-b border-gray-100 px-4 py-3`); header cells are small uppercase gray.
- Empty states use `EmptyState`; loading uses skeletons shaped like the real content.
- Feedback via `toast` (sonner), never `alert()`. Confirm destructive actions.

## Public pages

Build from `src/components/site/ui.jsx`; don't hand-roll headings, bands or buttons:

- `PageHeader` opens every interior page (eyebrow, h1, lede, optional CTAs).
- `Section` (`tone="white" | "muted" | "dark"`) + `Container` give the `py-16 sm:py-24` rhythm
  and page gutters. Alternate white and muted sections.
- `SectionHeading` = eyebrow (small uppercase, blue; yellow on dark) + `font-display` headline +
  lede. Headlines are sentence case, `text-balance`. No multicolour gradient text.
- `ctaClass(variant, size)` for every button/link that looks like a button:
  `primary` (blue gradient, the Donate action, one per view), `accent` (yellow, Refer a Kid),
  `secondary` (white outline), `light` / `ghostLight` on photos and blue/dark bands.
- `CtaBand` closes a page; `Surface` is the standard white card.
- Icons sit in a tinted tile (`bg-blue-50 text-blue-600 ring-1 ring-blue-100`), never a rainbow
  of gradient squares.
- Gallery tiles use `MediaCard` / `MediaLightbox` from `components/gallery/MediaCard.jsx`.
- Impact numbers use `CountUp` (`components/site/CountUp.jsx`): counts once when scrolled into
  view, staggered by `delay`; years pass `from` (e.g. 2000) so they don't count from 0.
- Feedback is `toast` from sonner, never `alert()`.
- Respect `prefers-reduced-motion` for slideshows and animations.

## Checklist before shipping UI

1. No horizontal scroll at 390px wide.
2. Grid cards are equal height with portrait and landscape media mixed.
3. Keyboard: Tab reaches everything, Escape closes dialogs, focus is visible.
4. Long titles truncate instead of wrapping cards to different heights.
5. `npm run build` passes.
