import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/index.ts";
import { NewsletterSubscriber } from "@/api/entities";
import { Heart, Menu, X, Mail, Phone, MapPin } from "lucide-react";
import DonationModal from "../components/donation/DonationModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isAdminPage = currentPageName?.startsWith('Admin') || currentPageName === 'TestingDashboard';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Newsletter signup state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

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
                />
                <span className="text-lg font-bold text-gray-700">Admin</span>
              </Link>
            </div>

            <Link
              to={createPageUrl("Homepage")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm hover:from-blue-700 hover:to-blue-800 transition-all"
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
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Homepage")} className="group">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689f4e044d22f613693763ee/d50ebdb68_TeamUP4s2.png"
                alt="Team UP4S Logo"
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
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
              <Link 
                to={createPageUrl("ReferKid")} 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105"
              >
                Refer a Kid
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
              >
                <Heart className="w-4 h-4 mr-2 inline" />
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
              <Link 
                to={createPageUrl("ReferKid")} 
                onClick={() => setIsMenuOpen(false)} 
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 w-full py-3 rounded-full font-semibold text-lg text-center hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                Refer a Kid
              </Link>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openDonationModal'));
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full py-3 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                <Heart className="w-5 h-5 mr-2 inline" />
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
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/689f4e044d22f613693763ee/d50ebdb68_TeamUP4s2.png"
                  alt="Team UP4S Logo"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
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
                    required
                  />
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting || !newsletterEmail.trim()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
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
                  <li><Link to={createPageUrl("AdminDashboard")} className="text-gray-300 hover:text-white transition-colors">Admin</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Contact & Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="mailto:teamup4smi@gmail.com" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      teamup4smi@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:5862448492" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      586-244-8492
                    </a>
                  </li>
                  <li className="text-gray-400 text-sm flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      PO Box 480012<br />
                      New Haven, MI 48048
                    </span>
                  </li>
                  <li><Link to={createPageUrl("PrivacyPolicy")} className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to={createPageUrl("TermsOfService")} className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
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