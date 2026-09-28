import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Small building blocks shared by the admin dashboard tabs.

export function StatCard({ label, value, detail, icon: Icon, accent = 'text-blue-600 bg-blue-50', onClick, className }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm',
        className,
        onClick && 'transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-600 leading-snug">{label}</p>
        {Icon && (
          <span className={cn('hidden sm:inline-flex rounded-lg p-2 shrink-0', accent)}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums text-gray-900">{value}</p>
      {detail && <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2">{detail}</p>}
    </Comp>
  );
}

export function SectionHeader({ title, description, children }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-14 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />}
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const BADGE_STYLES = {
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-600/30',
  orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/20',
};

export function StatusBadge({ tone = 'gray', children, title }) {
  return (
    <span
      title={title}
      className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset', BADGE_STYLES[tone])}
    >
      {children}
    </span>
  );
}

export const PAYMENT_TONES = { completed: 'green', pending: 'yellow', expired: 'gray', failed: 'red', refunded: 'purple' };
export const REFERRAL_STATUS_TONES = { pending: 'yellow', reviewing: 'purple', approved: 'blue', completed: 'green', declined: 'gray' };
export const URGENCY_TONES = { low: 'gray', medium: 'yellow', high: 'orange', critical: 'red' };

// Client-side pagination. Resets to page 1 whenever `resetKey` changes (e.g. filters).
export function usePagination(items, pageSize = 25, resetKey) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [resetKey]);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize]
  );
  return { page: current, pageCount, setPage, pageItems, total: items.length, pageSize };
}

export function Pagination({ page, pageCount, setPage, total, pageSize }) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// RFC 4180 CSV: quote every field so commas, quotes and newlines survive.
export function downloadCsv(filename, columns, rows) {
  const escape = (value) => {
    if (value === null || value === undefined) return '""';
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const lines = [
    columns.map((c) => escape(c.label)).join(','),
    ...rows.map((row) => columns.map((c) => escape(c.value(row))).join(',')),
  ];
  // BOM so Excel opens UTF-8 (e.g. names with accents) correctly.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function matchesSearch(query, ...fields) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}
