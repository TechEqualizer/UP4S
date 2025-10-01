import React, { useState } from 'react';
import { X, Heart, CreditCard, Loader2 } from 'lucide-react';
import { createStripeCheckout } from '@/api/functions';

export default function DonationModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setAmount(value);
  };

  const handleDonate = async () => {
    if (!amount || amount <= 0 || !donorInfo.name || !donorInfo.email) {
      alert('Please fill in all required fields and select an amount.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const checkoutData = {
        amount: parseFloat(amount),
        donation_type: donationType,
        donor_name: donorInfo.name,
        donor_email: donorInfo.email,
        fund_designation: 'general',
        success_url: `${window.location.origin}/DonationSuccess`,
        cancel_url: window.location.href
      };

      const { checkout_url } = await createStripeCheckout(checkoutData);
      
      // Redirect to Stripe Checkout
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Donation error:', error);
      alert('There was an error processing your donation. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          disabled={isProcessing}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Make a Donation</h2>
          <p className="text-gray-600">
            Help us create dreams on film for kids facing life's toughest challenges
          </p>
        </div>

        {/* Donation Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Donation Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDonationType('one-time')}
              className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                donationType === 'one-time'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              disabled={isProcessing}
            >
              One-time
            </button>
            <button
              onClick={() => setDonationType('monthly')}
              className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                donationType === 'monthly'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              disabled={isProcessing}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Amount
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {predefinedAmounts.map((presetAmount) => (
              <button
                key={presetAmount}
                onClick={() => handleAmountSelect(presetAmount)}
                className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                  amount == presetAmount
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                disabled={isProcessing}
              >
                ${presetAmount}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              $
            </span>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              min="1"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Donor Information */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={donorInfo.name}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="Enter your full name"
              required
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={donorInfo.email}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
              placeholder="Enter your email address"
              required
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDonate}
            disabled={!amount || amount <= 0 || !donorInfo.name || !donorInfo.email || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                {donationType === 'monthly' ? `Donate $${amount || '0'}/month` : `Donate $${amount || '0'}`}
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            Team UP4S is a 501(c)(3) nonprofit. Your donation is tax-deductible.
            <br />
            You'll be redirected to Stripe for secure payment processing.
          </p>
        </div>
      </div>
    </div>
  );
}