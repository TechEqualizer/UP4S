import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import { useAuth, signOut } from '@/lib/auth';
import { cn } from '@/lib/utils';

// App shell for the admin dashboard: fixed sidebar on desktop, slide-over drawer on mobile.
// `items` is [{ id, label, icon, count }]; the active item is controlled by the parent.
export default function AdminShell({ items, active, onSelect, title, description, actions, children }) {
  const { session } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const select = (id) => {
    onSelect(id);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/team-up4s-logo.png" alt="Team UP4S" className="h-9 w-auto" />
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Admin</span>
        </Link>
      </div>

      <nav aria-label="Dashboard sections" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map(({ id, label, icon: Icon, count }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => select(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500')} aria-hidden="true" />
              <span className="flex-1 text-left">{label}</span>
              {count != null && (
                <span className={cn(
                  'min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-gray-200 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <ExternalLink className="h-[18px] w-[18px] text-gray-400" aria-hidden="true" /> View site
        </a>
        {session && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-semibold uppercase text-white">
              {session.user.email?.[0] ?? '?'}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-gray-700" title={session.user.email}>{session.user.email}</p>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/70">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-gray-900/40 animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="-ml-1.5 rounded-md p-1.5 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{title}</h1>
              {description && <p className="hidden truncate text-sm text-gray-500 sm:block">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
