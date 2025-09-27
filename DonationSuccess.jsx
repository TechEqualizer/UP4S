import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full text-center">
        <CardContent className="p-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Thank You for Your Generous Gift!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Your donation has been successfully processed and will make a real difference 
            in the lives of disadvantaged youth in our community. You'll receive an email 
            receipt shortly.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Your Impact
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Provides professional filmmaking equipment and training</p>
              <p>• Supports expert mentorship for at-risk youth</p>
              <p>• Creates opportunities for creative expression and healing</p>
              <p>• Helps build brighter futures, one story at a time</p>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700">
              <Link to={createPageUrl("Homepage")}>
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to={createPageUrl("Gallery")}>
                View Impact Stories
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Team UP4S is a 501(c)(3) nonprofit organization (EIN: 92-2415944).
              <br />
              Your donation is tax-deductible to the full extent allowed by law.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}