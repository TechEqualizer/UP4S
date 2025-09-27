import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/index";
import { User } from "@/api/entities";
import { NewsletterSubscriber } from "@/api/entities";
import { Heart, Camera, Users, Settings, BarChart3, Menu, X, TestTube } from "lucide-react";
import DonationModal from "../components/donation/DonationModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isAdminPage = currentPageName?.startsWith('Admin') || currentPageName === 'TestingDashboard';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [user, setUser] = useState(null);

  // Newsletter signup state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  // Fetch user on component mount/path change
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        // User not logged in or session expired - this is OK for public pages
        setUser(null);
      }
    };
    fetchUser();
  }, [location.pathname]); // Re-fetch on path change to ensure user status is up-to-date

  // Global handler for opening the donation modal
  useEffect(() => {
    const handleOpenModal = () => setShowDonationModal(true);
    window.addEventListener('openDonationModal', handleOpenModal);
    return () => {
      window.removeEventListener('openDonationModal', handleOpenModal);
    };
  }, []);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Newsletter signup handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsNewsletterSubmitting(true);

    try {
      await NewsletterSubscriber.create({
        email: newsletterEmail.trim().toLowerCase(),
        subscription_source: 'footer'
      });

      alert("Thank you for subscribing! You'll receive inspiring stories from the kids we help.");
      setNewsletterEmail('');
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        alert('This email is already subscribed. Thank you!');
        setNewsletterEmail('');
      } else {
        alert('There was an error subscribing. Please try again.');
      }
    }

    setIsNewsletterSubmitting(false);
  };

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link to={createPageUrl("Homepage")} className="flex items-center gap-3 group">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689f4e044d22f613693763ee/d50ebdb68_TeamUP4s2.png"
                  alt="Team UP4S Logo"
                  className="h-10 w-auto"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
                <span className="text-lg font-bold text-gray-700">Admin</span>
              </Link>

              <div className="flex gap-4">
                <Link
                  to={createPageUrl("AdminDashboard")}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPageName === 'AdminDashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Dashboard
                </Link>
                <Link
                  to={createPageUrl("AdminGallery")}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPageName === 'AdminGallery'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Gallery
                </Link>
                <Link
                  to={createPageUrl("TestingDashboard")}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPageName === 'TestingDashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TestTube className="w-4 h-4 inline mr-2" />
                  Testing
                </Link>
              </div>
            </div>

            <Link
              to={createPageUrl("Homepage")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Site
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <style>
        {`
          :root {
            --up4s-blue: #004aad;
            --up4s-gold: #ffcc33;
            --up4s-gray-50: #fafafa;
            --up4s-gray-100: #f5f5f5;
            --up4s-gray-900: #1a1a1a;
          }

          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }

          .animate-slide-up {
            animation: slideUp 0.8s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes swipe-line {
            0% {
              transform: translateX(-105%) translateY(-50%);
              opacity: 0;
            }
            30% {
              opacity: 1;
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: translateX(105%) translateY(-50%);
              opacity: 0;
            }
          }

          .has-line-swipe::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--up4s-gold);
            box-shadow: 0 0 8px var(--up4s-gold);
            opacity: 0;
            animation: swipe-line 1.2s ease-in-out forwards;
            animation-delay: inherit; /* Inherit delay from parent */
          }

          .gradient-text {
            background: linear-gradient(135deg, var(--up4s-blue), var(--up4s-gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .btn-primary {
            background: linear-gradient(135deg, var(--up4s-blue), #0056cc);
            transition: all 0.3s ease;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 74, 173, 0.3);
          }

          .btn-gold {
            background: linear-gradient(135deg, var(--up4s-gold), #ffd700);
            transition: all 0.3s ease;
          }

          .btn-gold:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 204, 51, 0.4);
          }

          @keyframes slide-in-right {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slide-in-right 0.3s ease-out;
          }
        `}
      </style>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Homepage")} className="group">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689f4e044d22f613693763ee/d50ebdb68_TeamUP4s2.png"
                alt="Team UP4S Logo"
                className="h-16 w-auto sm:h-18 transition-transform duration-300 group-hover:scale-105"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                }}
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to={createPageUrl("Homepage")} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link to={createPageUrl("About")} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </Link>
              <Link to={createPageUrl("Gallery")} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Gallery
              </Link>
              <Link to={createPageUrl("Fundraising")} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Support Us
              </Link>
              <Link to={createPageUrl("ReferKid")} className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Refer a Kid
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to={createPageUrl("ReferKid")} className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold btn-gold">
                Refer a Kid
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold btn-primary"
              >
                Donate Now
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div
            className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2">
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="flex flex-col space-y-6">
              <Link to={createPageUrl("Homepage")} className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to={createPageUrl("About")} className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to={createPageUrl("Gallery")} className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
              <Link to={createPageUrl("Fundraising")} className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Support Us</Link>
              <Link to={createPageUrl("ReferKid")} className="text-lg text-gray-700 hover:text-blue-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>Refer a Kid</Link>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col gap-4">
              <Link to={createPageUrl("ReferKid")} onClick={() => setIsMenuOpen(false)} className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 w-full py-3 rounded-full font-semibold btn-gold text-lg text-center">
                Refer a Kid
              </Link>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openDonationModal'));
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full py-3 rounded-full font-semibold btn-primary text-lg"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689f4e044d22f613693763ee/d50ebdb68_TeamUP4s2.png"
                    alt="Team UP4S Logo"
                    className="h-18 w-auto"
                    style={{
                      filter: 'brightness(0.9) contrast(1.1) drop-shadow(0 2px 8px rgba(255,255,255,0.1))'
                    }}
                  />
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Creating dreams on film for kids facing life's toughest challenges.
                Your gift helps bring a child's creative vision to life and share it with the world.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Team UP4S is a 501(c)(3) nonprofit organization.
                All donations are tax-deductible to the full extent allowed by law.
                <br />EIN: 92-2415944
              </p>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Stay Connected</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Email address for newsletter"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting || !newsletterEmail.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 rounded-lg font-semibold btn-primary disabled:opacity-50"
                  >
                    {isNewsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-2">
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-3">
                  <li><Link to={createPageUrl("About")} className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to={createPageUrl("Gallery")} className="text-gray-300 hover:text-white transition-colors">Gallery</Link></li>
                  <li><Link to={createPageUrl("Fundraising")} className="text-gray-300 hover:text-white transition-colors">Support Us</Link></li>
                  <li><Link to={createPageUrl("ReferKid")} className="text-gray-300 hover:text-white transition-colors">Refer a Kid</Link></li>
                  {user && user.role === 'admin' && (
                    <li><Link to={createPageUrl("AdminDashboard")} className="text-gray-300 hover:text-white transition-colors">Admin</Link></li>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal & Contact</h4>
                <ul className="space-y-3">
                  <li><Link to={createPageUrl("PrivacyPolicy")} className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to={createPageUrl("TermsOfService")} className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><a href="mailto:teamup4smi@gmail.com" className="text-gray-300 hover:text-white transition-colors">teamup4smi@gmail.com</a></li>
                  <li><a href="tel:5862448492" className="text-gray-300 hover:text-white transition-colors">586-244-8492</a></li>
                  <li className="pt-2 text-gray-400 text-sm">
                    PO Box 480012<br />
                    New Haven, MI 48048
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Team UP4S. All rights reserved. 501(c)(3) nonprofit organization. EIN: 92-2415944</p>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />
    </div>
  );
}