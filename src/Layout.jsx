import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/index.ts";
import { NewsletterSubscriber } from "@/api/entities";
import { Heart, Menu, X, Mail, Phone, MapPin } from "lucide-react";
import DonationModal from "@/components/donation/DonationModal";
import { useAuth, signOut } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Home", page: "Homepage" },
  { label: "About", page: "About" },
  { label: "Gallery", page: "Gallery" },
  { label: "Support Us", page: "Fundraising" },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isAdminPage = currentPageName?.startsWith('Admin') ||
    ['TestingDashboard', 'ProductionChecklist', 'Login'].includes(currentPageName);
  const { session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationEvent, setDonationEvent] = useState(null);

  // Newsletter signup state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  // Global handler for opening the donation modal
  useEffect(() => {
    // Fundraising event cards pass { eventId, eventTitle } to donate toward that event.
    const handleOpenModal = (e) => {
      const { eventId, eventTitle } = e.detail || {};
      setDonationEvent(eventId ? { id: eventId, title: eventTitle } : null);
      setShowDonationModal(true);
    };
    window.addEventListener('openDonationModal', handleOpenModal);
    return () => {
      window.removeEventListener('openDonationModal', handleOpenModal);
    };
  }, []);

  // Scroll to top and close the mobile menu on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Shadow under the sticky nav once the page is scrolled
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock page scroll behind it, close on Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setIsMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isMenuOpen]);

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
                  src="/team-up4s-logo.png"
                  alt="Team UP4S Logo"
                  className="h-10 w-auto"
                />
                <span className="text-lg font-bold text-gray-700">Admin</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {session && (
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              )}
              <Link
                to={createPageUrl("Homepage")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                View Site
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Navigation */}
      <nav
        aria-label="Main"
        className={`bg-white/95 backdrop-blur-sm sticky top-0 z-50 transition-shadow duration-300 ${
          isScrolled ? 'shadow-md border-b border-transparent' : 'border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl("Homepage")} className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              <img
                src="/team-up4s-logo.png"
                alt="Team UP4S home"
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {NAV_ITEMS.map(({ label, page }) => {
                const active = currentPageName === page;
                return (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-3 py-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active ? 'text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                    {active && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-blue-600" />}
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to={createPageUrl("ReferKid")}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-5 lg:px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500"
              >
                Refer a Kid
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 lg:px-6 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
              >
                <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                Donate Now
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className="p-2 -mr-2 rounded-lg text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex justify-between items-center h-20 px-6 border-b border-gray-100">
              <img src="/team-up4s-logo.png" alt="" className="h-12 w-auto" />
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 rounded-lg text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="space-y-1">
                {[...NAV_ITEMS, { label: 'Refer a Kid', page: 'ReferKid' }].map(({ label, page }) => {
                  const active = currentPageName === page;
                  return (
                    <li key={page}>
                      <Link
                        to={createPageUrl(page)}
                        aria-current={active ? 'page' : undefined}
                        className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                          active ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('openDonationModal'));
                }}
                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full py-3.5 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                <Heart className="w-5 h-5 mr-2" aria-hidden="true" />
                Donate Now
              </button>
              <p className="text-center text-sm text-gray-500">501(c)(3) nonprofit · donations are tax-deductible</p>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src="/team-up4s-logo.png"
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
                    aria-label="Email address"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex-1 min-w-0 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting || !newsletterEmail.trim()}
                    className="shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
                  >
                    {isNewsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:col-span-2">
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
                    <a href="mailto:teamup4smi@gmail.com" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 min-w-0 break-all">
                      <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                      teamup4smi@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:5862448492" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
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
            <p>&copy; {new Date().getFullYear()} Team UP4S. All rights reserved. 501(c)(3) nonprofit organization. EIN: 92-2415944</p>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={showDonationModal} event={donationEvent} onClose={() => setShowDonationModal(false)} />
    </div>
  );
}