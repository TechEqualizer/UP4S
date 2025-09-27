
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Privacy Policy</CardTitle>
            <p className="text-gray-600">Last updated: January 2024</p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2>Introduction</h2>
            <p>
              Team UP4S ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a donation.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact information (email, phone, address)</li>
              <li>Payment information for donations (processed securely through Stripe)</li>
              <li>Information provided in referral forms</li>
              <li>Newsletter subscription preferences</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>Log data and usage information</li>
              <li>Cookies and similar technologies</li>
              <li>Device and browser information</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <ul>
              <li>Process donations and issue tax receipts</li>
              <li>Communicate about our programs and impact</li>
              <li>Send newsletters (with your consent)</li>
              <li>Process kid referrals and coordinate services</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties except:
            </p>
            <ul>
              <li>To trusted service providers who assist in operating our website</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information, including encryption for sensitive data and secure payment processing through Stripe.
            </p>

            <h2>Your Rights</h2>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Unsubscribe from communications</li>
            </ul>

            <h2>Children's Privacy</h2>
            <p>
              We do not knowingly collect personal information from children under 13 without parental consent. Our referral process requires guardian consent.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
              <br /><strong>Email:</strong> <a href="mailto:teamup4smi@gmail.com">teamup4smi@gmail.com</a>
              <br /><strong>Phone:</strong> <a href="tel:5862448492">586-244-8492</a>
              <br /><strong>Mailing Address:</strong> PO Box 480012, New Haven, MI 48048
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
