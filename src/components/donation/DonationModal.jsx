import React, { useEffect, useRef, useState } from 'react';
import { X, Heart, CreditCard, Loader2, Lock } from 'lucide-react';
import { createStripeCheckout } from '@/api/functions';
import { ctaClass } from '@/components/site/ui';

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

const inputClass =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 disabled:bg-gray-50';

function choiceClass(selected) {
  return `h-12 rounded-xl border font-semibold tabular-nums transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 ${
    selected
      ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
      : 'border-gray-300 bg-white text-gray-700 shadow-sm hover:border-gray-400'
  }`;
}

export default function DonationModal({ isOpen, onClose, event }) {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  // Parent passes a new onClose each render; keep the latest without re-running effects.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const processingRef = useRef(isProcessing);
  processingRef.current = isProcessing;

  // While open: lock page scroll, close on Escape, and start focus inside the dialog.
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape' && !processingRef.current) onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector('button[aria-pressed]')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setAmount(value);
    setError('');
  };

  const numericAmount = parseFloat(amount);
  const hasAmount = Number.isFinite(numericAmount) && numericAmount >= 1;
  const amountLabel = hasAmount
    ? `$${numericAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : '';

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!hasAmount) {
      setError('Please choose an amount of at least $1.');
      return;
    }
    if (!donorInfo.name.trim() || !donorInfo.email.trim()) {
      setError('Please enter your name and email address.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const checkoutData = {
        amount: numericAmount,
        donation_type: donationType,
        donor_name: donorInfo.name.trim(),
        donor_email: donorInfo.email.trim(),
        fund_designation: 'general',
        event_id: event?.id,
        success_url: `${window.location.origin}/DonationSuccess`,
        cancel_url: window.location.href
      };

      const { checkout_url } = await createStripeCheckout(checkoutData);

      // Redirect to Stripe Checkout
      window.location.href = checkout_url;
    } catch (err) {
      console.error('Donation error:', err);
      setError('Something went wrong starting your donation. Please try again, or email teamup4smi@gmail.com.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fade-in"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto shadow-2xl ring-1 ring-black/5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          disabled={isProcessing}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 ring-1 ring-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-blue-600" aria-hidden="true" />
          </div>
          <h2 id="donation-title" className="font-display text-2xl font-bold tracking-tight text-gray-900 mb-2">Make a donation</h2>
          <p className="text-gray-600">
            {event
              ? <>Supporting <span className="font-semibold text-gray-900">{event.title}</span></>
              : "Help us create dreams on film for kids facing life's toughest challenges"}
          </p>
        </div>

        <form onSubmit={handleDonate} noValidate>
          <fieldset className="mb-6" disabled={isProcessing}>
            <legend className="block text-sm font-medium text-gray-700 mb-3">Donation type</legend>
            <div className="grid grid-cols-2 gap-2">
              {[['one-time', 'One-time'], ['monthly', 'Monthly']].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={donationType === value}
                  onClick={() => setDonationType(value)}
                  className={choiceClass(donationType === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-6" disabled={isProcessing}>
            <legend className="block text-sm font-medium text-gray-700 mb-3">Amount</legend>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  aria-pressed={Number(amount) === presetAmount && !customAmount}
                  onClick={() => handleAmountSelect(presetAmount)}
                  className={`${choiceClass(Number(amount) === presetAmount && !customAmount)} px-1 text-sm sm:text-base`}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>

            <label htmlFor="donation-custom-amount" className="sr-only">Custom amount in dollars</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium" aria-hidden="true">
                $
              </span>
              <input
                id="donation-custom-amount"
                type="number"
                inputMode="decimal"
                placeholder="Other amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className={`${inputClass} pl-8`}
                min="1"
                step="any"
              />
            </div>
          </fieldset>

          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="donation-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full name <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="donation-name"
                type="text"
                autoComplete="name"
                value={donorInfo.name}
                onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass}
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <label htmlFor="donation-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address <span className="text-red-600" aria-hidden="true">*</span>
              </label>
              <input
                id="donation-email"
                type="email"
                autoComplete="email"
                value={donorInfo.email}
                onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                className={inputClass}
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className={ctaClass('primary', 'lg', 'w-full disabled:cursor-not-allowed')}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Redirecting to secure checkout…
              </>
            ) : hasAmount ? (
              <>
                <CreditCard className="w-5 h-5" aria-hidden="true" />
                {donationType === 'monthly' ? `Donate ${amountLabel}/month` : `Donate ${amountLabel}`}
              </>
            ) : (
              'Choose an amount'
            )}
          </button>

          <p className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            Secure payment by Stripe · Tax-deductible 501(c)(3)
          </p>
        </form>
      </div>
    </div>
  );
}
