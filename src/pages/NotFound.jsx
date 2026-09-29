import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';
import { createPageUrl } from '@/index';
import { Container, Eyebrow, Accent, ctaClass } from '@/components/site/ui';

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-gray-50">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(37,99,235,0.14),transparent_70%)]" />
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <p aria-hidden="true" className="font-display text-[clamp(6rem,4rem+10vw,11rem)] font-extrabold leading-none tracking-[-0.04em] text-gray-900/[0.07]">
          404
        </p>
        <Eyebrow className="-mt-6 sm:-mt-10">Page not found</Eyebrow>
        <h1 className="mt-4 max-w-2xl font-display text-display-lg font-bold text-gray-900">
          This scene <Accent>didn&rsquo;t make the cut</Accent>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-gray-600">
          The page you&rsquo;re looking for has moved or never existed. The stories are still rolling, though.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className={ctaClass('primary', 'lg')}>
            <Home className="h-5 w-5" aria-hidden="true" /> Back to home
          </Link>
          <Link to={createPageUrl('Gallery')} className={ctaClass('secondary', 'lg')}>
            See their stories <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
