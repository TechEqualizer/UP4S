import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const EIN = '92-2415944';

// Reassurance shown before people hand over payment details. Only claims that are
// true for Team UP4S: Stripe processes every payment (the site never sees card
// numbers), it's a registered 501(c)(3), and gifts are tax-deductible.
export default function TrustRow({ variant = 'full', tone = 'light', className }) {
  const muted = tone === 'dark' ? 'text-gray-300' : 'text-gray-500';
  const strong = tone === 'dark' ? 'text-white' : 'text-gray-800';

  if (variant === 'compact') {
    return (
      <div className={cn('text-center text-xs', muted, className)}>
        <p className="flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Secure checkout by <span className={cn('font-semibold', strong)}>Stripe</span> · 501(c)(3) · Tax-deductible</span>
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border px-4 py-4 text-xs', tone === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200/80 bg-gray-50/80', muted, className)}>
      <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <Lock className={cn('mt-0.5 h-4 w-4 shrink-0', tone === 'dark' ? 'text-green-400' : 'text-green-600')} aria-hidden="true" />
          <span>
            <span className={cn('block font-semibold', strong)}>Secure checkout, powered by Stripe</span>
            Encrypted end to end. We never see or store your card details.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <ShieldCheck className={cn('mt-0.5 h-4 w-4 shrink-0', tone === 'dark' ? 'text-blue-300' : 'text-blue-600')} aria-hidden="true" />
          <span>
            <span className={cn('block font-semibold', strong)}>501(c)(3) nonprofit</span>
            EIN {EIN}. Your gift is tax-deductible to the extent allowed by law.
          </span>
        </p>
      </div>
    </div>
  );
}
