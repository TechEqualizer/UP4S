import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/index.ts";
import { NewsletterSubscriber } from "@/api/entities";
import { Heart, Menu, X, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ctaClass } from "@/components/site/ui";
import DonationModal from "@/components/donation/DonationModal";
import { useAuth, signOut } from "@/lib/auth";

// Browser-tab / search-result titles per page.
const PAGE_TITLES = {
  Homepage: "Team UP4S · Film & media arts for Metro Detroit youth",
  About: "About us · Team UP4S",
  Gallery: "Gallery · Team UP4S",
  Fundraising: "Support us · Team UP4S",
  ReferKid: "Refer a kid · Team UP4S",
  PrivacyPolicy: "Privacy policy · Team UP4S",
  TermsOfService: "Terms of service · Team UP4S",
  DonationSuccess: "Thank you · Team UP4S",
  AdminDashboard: "Admin · Team UP4S",
  Login: "Sign in · Team UP4S",
};

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

  useEffect(() => {
    document.title = PAGE_TITLES[currentPageName] ?? "Team UP4S";
  }, [currentPageName]);

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

      toast.success("You're subscribed!", { description: "We'll send you stories from the kids we help." });
      setNewsletterEmail('');
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        toast.success('You’re already subscribed. Thank you!');
        setNewsletterEmail('');
      } else {
        toast.error('We couldn’t subscribe you. Please try again.');
      }
    }

    setIsNewsletterSubmitting(false);
  };

  // The dashboard and sign-in page render their own full-screen shells.
  if (currentPageName === 'AdminDashboard' || currentPageName === 'Login') return <>{children}</>;

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

  const openDonate = () => window.dispatchEvent(new CustomEvent('openDonationModal'));
  const footerLink = 'text-sm text-gray-400 transition-colors hover:text-white';

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
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? 'border-gray-200/80 bg-white/85 shadow-[0_1px_12px_rgba(16,24,40,0.06)] backdrop-blur-lg supports-[backdrop-filter]:bg-white/75'
            : 'border-transparent bg-white'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-[height] duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            <Link to={createPageUrl("Homepage")} className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              <img
                src="/team-up4s-logo.png"
                alt="Team UP4S home"
                className={`w-auto transition-all duration-300 ${isScrolled ? 'h-11' : 'h-14'}`}
              />
            </Link>

            <div className="hidden items-center gap-1 rounded-full border border-gray-200/80 bg-gray-50/80 p-1 md:flex">
              {NAV_ITEMS.map(({ label, page }) => {
                const active = currentPageName === page;
                return (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Link to={createPageUrl("ReferKid")} className={ctaClass('accent', 'sm', 'shadow-none')}>
                Refer a Kid
              </Link>
              <button type="button" onClick={openDonate} className={ctaClass('primary', 'sm', 'shadow-none')}>
                <Heart className="h-4 w-4" aria-hidden="true" />
                Donate
              </button>
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <button type="button" onClick={openDonate} className={ctaClass('primary', 'sm', 'shadow-none px-3.5')}>
                <Heart className="h-4 w-4" aria-hidden="true" />
                Donate
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className="-mr-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
          <div className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl animate-slide-in-right">
            <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
              <img src="/team-up4s-logo.png" alt="" className="h-11 w-auto" />
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="-mr-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="h-6 w-6" />
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
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                          active ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                        <ArrowRight className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-300'}`} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex flex-col gap-3 border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openDonate();
                }}
                className={ctaClass('primary', 'lg', 'w-full')}
              >
                <Heart className="h-5 w-5" aria-hidden="true" />
                Donate Now
              </button>
              <p className="text-center text-xs text-gray-500">501(c)(3) nonprofit · donations are tax-deductible</p>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <img src="/team-up4s-logo.png" alt="Team UP4S" className="h-14 w-auto" />
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-gray-400">
                Creating dreams on film for kids facing life&apos;s toughest challenges.
                Your gift helps bring a child&apos;s creative vision to life and share it with the world.
              </p>

              <div className="mt-8 max-w-md">
                <h4 className="text-sm font-semibold text-white">Stories in your inbox</h4>
                <p className="mt-1 text-sm text-gray-400">Occasional updates from the kids and families we serve.</p>
                <form onSubmit={handleNewsletterSubmit} className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 focus-within:border-white/25">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    aria-label="Email address"
                    className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isNewsletterSubmitting || !newsletterEmail.trim()}
                    className={ctaClass('light', 'sm', 'shrink-0 shadow-none')}
                  >
                    {isNewsletterSubmitting ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-7">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Explore</h4>
                <ul className="mt-4 space-y-3">
                  <li><Link to={createPageUrl("About")} className={footerLink}>About us</Link></li>
                  <li><Link to={createPageUrl("Gallery")} className={footerLink}>Gallery</Link></li>
                  <li><Link to={createPageUrl("Fundraising")} className={footerLink}>Support us</Link></li>
                  <li><Link to={createPageUrl("ReferKid")} className={footerLink}>Refer a kid</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Contact</h4>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a href="mailto:teamup4smi@gmail.com" className={`${footerLink} flex min-w-0 items-center gap-2 break-all`}>
                      <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                      teamup4smi@gmail.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:5862448492" className={`${footerLink} flex items-center gap-2`}>
                      <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                      586-244-8492
                    </a>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>PO Box 480012<br />New Haven, MI 48048</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Organization</h4>
                <ul className="mt-4 space-y-3">
                  <li><Link to={createPageUrl("PrivacyPolicy")} className={footerLink}>Privacy policy</Link></li>
                  <li><Link to={createPageUrl("TermsOfService")} className={footerLink}>Terms of service</Link></li>
                  <li><Link to={createPageUrl("AdminDashboard")} className={footerLink}>Admin sign in</Link></li>
                </ul>
                <p className="mt-6 text-xs leading-relaxed text-gray-500">
                  501(c)(3) nonprofit · EIN 92-2415944. Donations are tax-deductible to the full extent allowed by law.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-8 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Team UP4S. All rights reserved.</p>
            <p>Made with care in Metro Detroit.</p>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={showDonationModal} event={donationEvent} onClose={() => setShowDonationModal(false)} />
    </div>
  );
}
