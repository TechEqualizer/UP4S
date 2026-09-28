import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';
import { Surface, Accent, ctaClass } from '@/components/site/ui';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/index';

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add any additional success tracking here
    setIsLoading(false);
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Processing your donation…</p>
        </div>
      </div>
    );
  }

  const impact = [
    'Professional filmmaking equipment and training',
    'Expert mentorship for at-risk youth',
    'Opportunities for creative expression and healing',
    'Brighter futures, one story at a time',
  ];

  return (
    <div className="relative isolate min-h-[80vh] bg-gray-50 px-4 py-16 sm:py-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(37,99,235,0.12),transparent_70%)]" />
      <Surface className="mx-auto max-w-2xl p-8 text-center shadow-xl shadow-gray-900/[0.04] sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
          <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
        </span>
        <h1 className="mt-8 text-balance font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Thank you for your <Accent>generous gift</Accent>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-gray-600">
          Your donation will make a real difference for young people in our community.
          A receipt is on its way to your inbox.
        </p>

        <div className="mt-10 rounded-2xl border border-gray-200/80 bg-gray-50 p-6 text-left">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Your gift provides</h2>
          <ul className="mt-4 space-y-3">
            {impact.map((line) => (
              <li key={line} className="flex items-start gap-3 text-gray-700">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={createPageUrl("Homepage")} className={ctaClass('primary', 'md')}>
            <Home className="h-4 w-4" aria-hidden="true" /> Return home
          </Link>
          <Link to={createPageUrl("Gallery")} className={ctaClass('secondary', 'md')}>
            View impact stories <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-10 border-t border-gray-100 pt-6 text-sm text-gray-500">
          Team UP4S is a 501(c)(3) nonprofit (EIN 92-2415944). Your donation is tax-deductible to the full extent allowed by law.
        </p>
      </Surface>
    </div>
  );
}
