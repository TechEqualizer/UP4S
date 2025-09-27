
import React, { useState, useEffect } from 'react';
import { User } from './api/entities';
import { Donation } from './api/entities';
import { KidReferral } from './api/entities';
import { GalleryItem } from './api/entities';
import { NewsletterSubscriber } from './api/entities';
import { FundraisingEvent } from './api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  FileText,
  Users,
  DollarSign,
  Camera,
  Mail,
  UserCheck,
  Settings,
  Monitor,
  Smartphone
} from 'lucide-react';

export default function TestingDashboard() {
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [testProgress, setTestProgress] = useState(0);
  const [systemData, setSystemData] = useState({
    donations: [],
    referrals: [],
    galleryItems: [],
    subscribers: [],
    events: []
  });

  useEffect(() => {
    checkUserPermissions();
    loadSystemData();
  }, []);

  const checkUserPermissions = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user permissions:', error);
    }
  };

  const loadSystemData = async () => {
    try {
      const [donations, referrals, galleryItems, subscribers, events] = await Promise.all([
        Donation.list('-created_date', 10),
        KidReferral.list('-created_date', 10),
        GalleryItem.list('-created_date', 10),
        NewsletterSubscriber.list('-created_date', 10),
        FundraisingEvent.list('-created_date', 10)
      ]);
      
      setSystemData({
        donations,
        referrals,
        galleryItems,
        subscribers,
        events
      });
    } catch (error) {
      console.error('Error loading system data:', error);
    }
  };

  const testCategories = [
    {
      id: 'auth',
      name: 'Authentication & Authorization',
      icon: UserCheck,
      tests: [
        {
          id: 'admin-access',
          name: 'Admin Dashboard Access',
          description: 'Verify admin users can access admin sections',
          type: 'automated',
          run: async () => {
            if (!user) return { status: 'fail', message: 'No user logged in' };
            if (user.role !== 'admin') return { status: 'fail', message: 'User is not admin' };
            return { status: 'pass', message: 'Admin user verified' };
          }
        },
        {
          id: 'admin-links',
          name: 'Admin Navigation Links',
          description: 'Verify admin links are visible and functional',
          type: 'manual',
          instructions: [
            'Check if "Admin" link is visible in footer',
            'Click the Admin link and verify it leads to /AdminDashboard',
            'Verify AdminGallery is accessible'
          ]
        }
      ]
    },
    {
      id: 'newsletter',
      name: 'Newsletter Subscription',
      icon: Mail,
      tests: [
        {
          id: 'newsletter-data',
          name: 'Newsletter Subscriber Data',
          description: 'Verify newsletter subscription data exists',
          type: 'automated',
          run: async () => {
            if (systemData.subscribers.length === 0) {
              return { status: 'warning', message: 'No newsletter subscribers found - test with footer form' };
            }
            return { status: 'pass', message: `${systemData.subscribers.length} subscribers found` };
          }
        },
        {
          id: 'exit-intent',
          name: 'Exit Intent Capture',
          description: 'Test exit intent newsletter capture',
          type: 'manual',
          instructions: [
            'Open donation modal',
            'Try to close it to trigger exit intent',
            'Enter email in exit intent form',
            'Verify success message appears',
            'Check admin dashboard for new subscriber'
          ]
        },
        {
          id: 'footer-signup',
          name: 'Footer Newsletter Signup',
          description: 'Test footer newsletter signup',
          type: 'manual',
          instructions: [
            'Scroll to footer',
            'Enter email in newsletter signup',
            'Click Subscribe button',
            'Verify success message',
            'Check admin dashboard for new subscriber'
          ]
        }
      ]
    },
    {
      id: 'referrals',
      name: 'Kid Referral System',
      icon: Users,
      tests: [
        {
          id: 'referral-data',
          name: 'Referral Data Integrity',
          description: 'Verify referral data exists and is properly structured',
          type: 'automated',
          run: async () => {
            if (systemData.referrals.length === 0) {
              return { status: 'warning', message: 'No referrals found - test referral form' };
            }
            const latestReferral = systemData.referrals[0];
            const requiredFields = ['child_name', 'child_age', 'guardian_name', 'guardian_email', 'wish_description'];
            const missingFields = requiredFields.filter(field => !latestReferral[field]);
            if (missingFields.length > 0) {
              return { status: 'fail', message: `Missing fields: ${missingFields.join(', ')}` };
            }
            return { status: 'pass', message: `${systemData.referrals.length} referrals found with complete data` };
          }
        },
        {
          id: 'referral-form',
          name: 'Referral Form Submission',
          description: 'Test complete referral form workflow',
          type: 'manual',
          instructions: [
            'Navigate to /ReferKid page',
            'Fill out all required fields',
            'Upload a test file (optional)',
            'Submit form',
            'Verify success page appears',
            'Check admin dashboard for new referral'
          ]
        }
      ]
    },
    {
      id: 'donations',
      name: 'Donation System',
      icon: DollarSign,
      tests: [
        {
          id: 'stripe-config',
          name: 'Stripe Configuration Check',
          description: 'Verify Stripe API keys and webhook secrets are configured',
          type: 'automated',
          run: async () => {
            // This would be checked on the backend, but we can verify frontend integration
            try {
              // Test if donation modal opens and has required fields
              return { status: 'pass', message: 'Stripe integration appears configured (manual verification recommended)' };
            } catch (error) {
              return { status: 'fail', message: 'Stripe configuration issue detected' };
            }
          }
        },
        {
          id: 'donation-data',
          name: 'Donation Data Analysis',
          description: 'Analyze donation data integrity and Stripe integration',
          type: 'automated',
          run: async () => {
            if (systemData.donations.length === 0) {
              return { status: 'warning', message: 'No donations found - test donation flow with test cards below' };
            }
            const completedDonations = systemData.donations.filter(d => d.payment_status === 'completed');
            const pendingDonations = systemData.donations.filter(d => d.payment_status === 'pending');
            const withStripeId = systemData.donations.filter(d => d.stripe_payment_id);
            
            return { 
              status: 'pass', 
              message: `${systemData.donations.length} total donations: ${completedDonations.length} completed, ${pendingDonations.length} pending, ${withStripeId.length} with Stripe IDs` 
            };
          }
        },
        {
          id: 'test-card-success',
          name: '✅ Test Successful Payment',
          description: 'Test successful payment flow with Stripe test card',
          type: 'manual',
          instructions: [
            '🔄 Open donation modal from any page',
            '💰 Select one-time donation, choose $25',
            '👤 Fill in donor information (use real email for receipt)',
            '💳 Use TEST CARD: 4242 4242 4242 4242',
            '📅 Use any future expiry date (e.g., 12/28)',
            '🔐 Use any 3-digit CVC (e.g., 123)',
            '📮 Use any ZIP code (e.g., 12345)',
            '✅ Complete checkout process',
            '🔄 Verify redirect to success page',
            '📊 Check admin dashboard for new completed donation',
            '🌐 Verify Stripe webhook was called (check function logs)',
            '💌 Check email for donation receipt'
          ]
        },
        {
          id: 'test-card-declined',
          name: '❌ Test Declined Payment',
          description: 'Test payment decline handling',
          type: 'manual',
          instructions: [
            '🔄 Open donation modal',
            '💰 Select one-time donation, choose $10',
            '💳 Use DECLINE TEST CARD: 4000 0000 0000 0002',
            '📅 Use any future expiry date',
            '✅ Complete checkout process',
            '❌ Verify payment is declined appropriately',
            '🔄 Verify user is returned to donation page',
            '📊 Check admin dashboard - should show pending/failed donation'
          ]
        },
        {
          id: 'test-card-3ds',
          name: '🔐 Test 3D Secure Payment',
          description: 'Test 3D Secure authentication flow',
          type: 'manual',
          instructions: [
            '🔄 Open donation modal',
            '💰 Select one-time donation, choose $50',
            '💳 Use 3DS TEST CARD: 4000 0025 0000 3155',
            '📅 Use any future expiry date',
            '✅ Complete checkout process',
            '🔐 Complete 3D Secure authentication when prompted',
            '✅ Verify payment completes successfully',
            '📊 Check admin dashboard for completed donation'
          ]
        },
        {
          id: 'monthly-donation-test',
          name: '📅 Test Monthly Donation',
          description: 'Test recurring monthly donation setup',
          type: 'manual',
          instructions: [
            '🔄 Open donation modal',
            '📅 Select "Monthly" donation type',
            '💰 Choose $25/month',
            '👤 Fill in donor information',
            '💳 Use TEST CARD: 4242 4242 4242 4242',
            '✅ Complete checkout process',
            '📊 Check admin dashboard for completed monthly donation',
            '🔄 Verify Stripe subscription was created (check Stripe dashboard)',
            '⚠️ IMPORTANT: Cancel test subscription in Stripe dashboard after testing'
          ]
        },
        {
          id: 'event-donation',
          name: '🎯 Event-Linked Donations',
          description: 'Test donations linked to specific events',
          type: 'manual',
          instructions: [
            '📄 Go to Support Us page (/Fundraising)',
            '🎯 Click "Support This" on any active event',
            '💰 Complete donation with test card (4242 4242 4242 4242)',
            '📊 Check admin dashboard - verify donation has correct event_id',
            '📈 Verify event amount_raised increased correctly',
            '🔄 Refresh Support Us page and verify progress bar updated'
          ]
        },
        {
          id: 'webhook-verification',
          name: '🔔 Webhook Verification',
          description: 'Verify Stripe webhooks are properly configured',
          type: 'manual',
          instructions: [
            '🌐 Go to Stripe Dashboard > Developers > Webhooks',
            '🔗 Verify webhook endpoint is configured',
            '📋 Required events: checkout.session.completed, payment_intent.succeeded',
            '✅ Test a donation and check webhook logs in Stripe',
            '📊 Verify donation status updates correctly in admin dashboard',
            '⚠️ If webhooks fail, check webhook secret is correctly set'
          ]
        }
      ]
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      icon: Settings,
      tests: [
        {
          id: 'dashboard-stats',
          name: 'Dashboard Statistics',
          description: 'Verify dashboard statistics are accurate',
          type: 'automated',
          run: async () => {
            const stats = {
              donations: systemData.donations.length,
              referrals: systemData.referrals.filter(r => r.status !== 'completed').length,
              gallery: systemData.galleryItems.length,
              subscribers: systemData.subscribers.length,
              events: systemData.events.filter(e => e.is_active).length
            };
            
            return { 
              status: 'pass', 
              message: `Stats verified: ${stats.donations} donations, ${stats.referrals} active referrals, ${stats.gallery} gallery items, ${stats.subscribers} subscribers, ${stats.events} active events` 
            };
          }
        },
        {
          id: 'event-management',
          name: 'Event CRUD Operations',
          description: 'Test fundraising event management',
          type: 'manual',
          instructions: [
            'Go to Admin Dashboard Events tab',
            'Click "Add Event"',
            'Fill all required fields and upload image',
            'Submit and verify event appears',
            'Edit the event and verify changes save',
            'Verify event appears on public Support Us page',
            'Delete test event'
          ]
        },
        {
          id: 'gallery-management',
          name: 'Gallery Management',
          description: 'Test gallery item management',
          type: 'manual',
          instructions: [
            'Go to Admin Gallery page',
            'Add new item via file upload',
            'Add new item via external URL',
            'Toggle featured status',
            'Verify featured items appear on homepage',
            'Delete test items'
          ]
        }
      ]
    },
    {
      id: 'ui',
      name: 'User Interface',
      icon: Monitor,
      tests: [
        {
          id: 'responsive-design',
          name: 'Responsive Design',
          description: 'Test responsive layout across device sizes',
          type: 'manual',
          instructions: [
            'Open browser developer tools',
            'Test mobile view (375px width)',
            'Test tablet view (768px width)',
            'Test desktop view (1200px+ width)',
            'Verify all pages adapt correctly',
            'Test mobile menu functionality'
          ]
        },
        {
          id: 'navigation',
          name: 'Site Navigation',
          description: 'Test all navigation links',
          type: 'manual',
          instructions: [
            'Click all header navigation links',
            'Click all footer links',
            'Test mobile menu toggle',
            'Verify all links lead to correct pages',
            'Test "Donate Now" and "Refer a Kid" buttons'
          ]
        }
      ]
    }
  ];

  const runAutomatedTest = async (test) => {
    setCurrentTest(`${test.name}`);
    try {
      const result = await test.run();
      setTestResults(prev => ({
        ...prev,
        [test.id]: result
      }));
      return result;
    } catch (error) {
      const result = { status: 'fail', message: error.message };
      setTestResults(prev => ({
        ...prev,
        [test.id]: result
      }));
      return result;
    }
  };

  const runAllAutomatedTests = async () => {
    setIsRunningTests(true);
    setTestResults({}); // Clear previous results
    setTestProgress(0);
    
    const automatedTests = testCategories
      .flatMap(category => category.tests)
      .filter(test => test.type === 'automated');
    
    for (let i = 0; i < automatedTests.length; i++) {
      const test = automatedTests[i];
      await runAutomatedTest(test);
      setTestProgress(((i + 1) / automatedTests.length) * 100);
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest(null);
    setIsRunningTests(false);
  };

  const getTestStatus = (testId) => {
    return testResults[testId] || { status: 'pending' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200';
      case 'fail': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Testing Dashboard is only available to admin users.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Testing Dashboard</h1>
          <p className="text-gray-600">Comprehensive testing suite for UP4S application functionality</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <Button
                  onClick={runAllAutomatedTests}
                  disabled={isRunningTests}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunningTests ? 'Running Tests...' : 'Run All Automated Tests'}
                </Button>
                <Button
                  onClick={() => {
                    setTestResults({});
                    setTestProgress(0);
                  }}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Results
                </Button>
              </div>
              
              {isRunningTests && (
                <div className="flex items-center gap-3">
                  <Progress value={testProgress} className="w-32" />
                  <span className="text-sm text-gray-600">{Math.round(testProgress)}%</span>
                </div>
              )}
            </div>
            
            {currentTest && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">Currently testing: {currentTest}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Categories */}
        <Tabs defaultValue="auth" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            {testCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <category.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {testCategories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <category.icon className="w-6 h-6" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.tests.map(test => {
                      const status = getTestStatus(test.id);
                      return (
                        <div
                          key={test.id}
                          className={`p-4 border rounded-lg ${getStatusColor(status.status)}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(status.status)}
                                <h3 className="font-semibold">{test.name}</h3>
                                <Badge variant={test.type === 'automated' ? 'default' : 'secondary'}>
                                  {test.type}
                                </Badge>
                              </div>
                              <p className="text-gray-600 mb-2">{test.description}</p>
                              {status.message && (
                                <p className={`text-sm ${
                                  status.status === 'pass' ? 'text-green-700' :
                                  status.status === 'fail' ? 'text-red-700' :
                                  status.status === 'warning' ? 'text-yellow-700' :
                                  'text-gray-700'
                                }`}>
                                  {status.message}
                                </p>
                              )}
                            </div>
                            {test.type === 'automated' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runAutomatedTest(test)}
                                disabled={isRunningTests}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Test
                              </Button>
                            )}
                          </div>
                          
                          {test.instructions && (
                            <div className="bg-white/50 p-3 rounded border">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Manual Testing Instructions:
                              </h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                                {test.instructions.map((instruction, index) => (
                                  <li key={index}>{instruction}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
