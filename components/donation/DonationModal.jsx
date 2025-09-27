import React, { useState } from 'react';
import { X, Heart, CreditCard } from 'lucide-react';

export default function DonationModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
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
    if (!amount || amount <= 0) return;
    
    setIsProcessing(true);
    
    // Simulate donation processing
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      alert(`Thank you for your donation of $${amount}! Your support helps us create dreams on film for kids facing life's toughest challenges.`);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
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
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDonate}
            disabled={!amount || amount <= 0 || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Donate ${amount || '0'}
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            Team UP4S is a 501(c)(3) nonprofit. Your donation is tax-deductible.
          </p>
        </div>
      </div>
    </div>
  );
}