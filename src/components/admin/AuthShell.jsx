import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

// Split-screen frame for sign-in and access screens: brand photo panel on large
// screens, the form on the right. Photo panel is hidden on phones.
export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative isolate hidden w-[46%] max-w-2xl overflow-hidden bg-gray-950 lg:flex lg:flex-col">
        <img
          src="/hero/kids-group.jpg"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
          style={{ objectPosition: 'center 35%' }}
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/30" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_30rem_at_0%_100%,rgba(37,99,235,0.35),transparent_70%)]" />

        <div className="p-10">
          <Link to="/" className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <img src="/team-up4s-logo.png" alt="Team UP4S home" className="h-14 w-auto" />
          </Link>
        </div>

        <div className="mt-auto p-10 pb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-400">Team UP4S admin</p>
          <blockquote className="mt-4 max-w-md text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-white">
            Every child deserves to tell their story.
          </blockquote>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-300">
            Manage referrals, volunteers, donations, events and the gallery for the kids and families we serve.
          </p>
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link to="/" className="rounded-lg lg:hidden">
            <img src="/team-up4s-logo.png" alt="Team UP4S home" className="h-11 w-auto" />
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="flex items-center justify-center gap-1.5 px-6 pb-8 text-xs text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Restricted to authorized Team UP4S staff
        </p>
      </main>
    </div>
  );
}
