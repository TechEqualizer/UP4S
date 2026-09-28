
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">Terms of Service</CardTitle>
            <p className="text-gray-600">Last updated: January 2024</p>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>About Team UP4S</h2>
            <p>
              Team UP4S is a 501(c)(3) nonprofit organization (EIN: 92-2415944) dedicated to creating dreams on film for kids facing life's toughest challenges.
            </p>

            <h2>Donations</h2>
            <ul>
              <li>All donations are tax-deductible to the full extent allowed by law</li>
              <li>Donations are processed securely through Stripe</li>
              <li>Monthly donations can be cancelled at any time</li>
              <li>Refund requests must be submitted within 30 days</li>
              <li>You will receive a tax receipt for donations over $250</li>
            </ul>

            <h2>Referral Process</h2>
            <ul>
              <li>Referrals must be submitted with guardian consent</li>
              <li>All referral information is kept confidential</li>
              <li>We reserve the right to decline referrals that don't meet our criteria</li>
              <li>Photo/video releases are required for any published content</li>
            </ul>

            <h2>Intellectual Property</h2>
            <p>
              The content on this website, including text, graphics, logos, and images, is protected by copyright and other intellectual property laws.
            </p>

            <h2>User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Submit false or misleading information</li>
              <li>Harass other users or staff</li>
            </ul>

            <h2>Disclaimers</h2>
            <ul>
              <li>The website is provided "as is" without warranties</li>
              <li>We are not liable for any damages arising from use of the website</li>
              <li>External links are provided for convenience and we don't control their content</li>
            </ul>

            <h2>Contact Information</h2>
            <p>
              For questions about these Terms of Service:
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
