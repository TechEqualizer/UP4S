import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Donation, KidReferral, GalleryItem, NewsletterSubscriber, FundraisingEvent } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import SmartImage from '@/components/ui/smart-image';
import {
  DollarSign, Users, Camera, Mail, Download, Eye, Plus, Edit, Trash2, Play, Target,
  Calendar, MapPin, CalendarDays, Heart, ExternalLink, LayoutGrid, ListOrdered, RefreshCw, Star, Paperclip,
  LayoutDashboard, Images, ArrowRight,
} from 'lucide-react';
import { format, isThisMonth } from 'date-fns';
import GalleryForm from '@/components/admin/GalleryForm';
import GalleryReorderList from '@/components/admin/GalleryReorderList';
import ReferralDetailModal from '@/components/admin/ReferralDetailModal';
import EventForm from '@/components/admin/EventForm';
import AdminShell from '@/components/admin/AdminShell';
import { getVideoThumbnail } from '@/components/gallery/VideoEmbed';
import { formatCurrency } from '@/lib/utils';
import {
  StatCard, SectionHeader, SearchInput, EmptyState, StatusBadge, Pagination, usePagination, Panel, IconButton,
  downloadCsv, matchesSearch, PAYMENT_TONES, REFERRAL_STATUS_TONES, URGENCY_TONES,
} from '@/components/admin/dashboard-ui';

const TABS = ['overview', 'referrals', 'donations', 'events', 'gallery', 'subscribers'];
const URGENCY_RANK = { critical: 0, high: 1, medium: 2, low: 3 };
const MAX_ROWS = 1000;

function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, pattern);
}

const amountOf = (donation) => Number(donation.amount) || 0;

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const setActiveTab = (tab) => setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true });

  const [donations, setDonations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Forms
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryViewMode, setGalleryViewMode] = useState('grid');

  // Referrals
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralSearch, setReferralSearch] = useState('');
  const [referralStatus, setReferralStatus] = useState('open');
  const [referralUrgency, setReferralUrgency] = useState('all');

  // Donations / subscribers
  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatus, setDonationStatus] = useState('all');
  const [subscriberSearch, setSubscriberSearch] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [donationsData, referralsData, galleryData, subscribersData, eventsData] = await Promise.all([
        Donation.list('-created_date', MAX_ROWS),
        KidReferral.list('-created_date', MAX_ROWS),
        GalleryItem.list('display_order', MAX_ROWS),
        NewsletterSubscriber.list('-created_date', MAX_ROWS),
        FundraisingEvent.list('-event_date', MAX_ROWS),
      ]);
      setDonations(donationsData);
      setReferrals(referralsData);
      // Same order as the public gallery: display_order, then newest first
      setGallery([...galleryData].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) || new Date(b.created_date) - new Date(a.created_date)
      ));
      setSubscribers(subscribersData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoadError(error?.message || 'Could not load dashboard data.');
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const eventTitles = useMemo(() => Object.fromEntries(events.map((e) => [e.id, e.title])), [events]);
  const completedDonations = donations.filter((d) => d.payment_status === 'completed');
  const raisedAllTime = completedDonations.reduce((sum, d) => sum + amountOf(d), 0);
  const thisMonth = completedDonations.filter((d) => d.created_date && isThisMonth(new Date(d.created_date)));
  const raisedThisMonth = thisMonth.reduce((sum, d) => sum + amountOf(d), 0);
  const openReferrals = referrals.filter((r) => ['pending', 'reviewing'].includes(r.status));
  const pendingReferrals = referrals.filter((r) => r.status === 'pending');
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => e.is_active && e.event_date && new Date(e.event_date) >= now)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  const activeSubscribers = subscribers.filter((s) => s.is_active);

  const filteredReferrals = referrals.filter((r) => {
    const statusMatch =
      referralStatus === 'all' ||
      (referralStatus === 'open' ? ['pending', 'reviewing'].includes(r.status) : r.status === referralStatus);
    const urgencyMatch = referralUrgency === 'all' || r.urgency_level === referralUrgency;
    return statusMatch && urgencyMatch &&
      matchesSearch(referralSearch, r.child_name, r.guardian_name, r.guardian_email, r.guardian_phone, r.wish_description);
  });
  const filteredDonations = donations.filter((d) =>
    (donationStatus === 'all' || d.payment_status === donationStatus) &&
    matchesSearch(donationSearch, d.donor_name, d.donor_email, eventTitles[d.event_id])
  );
  const filteredSubscribers = subscribers.filter((s) => matchesSearch(subscriberSearch, s.email, s.first_name));

  const referralPages = usePagination(filteredReferrals, 25, `${referralSearch}|${referralStatus}|${referralUrgency}`);
  const donationPages = usePagination(filteredDonations, 25, `${donationSearch}|${donationStatus}`);
  const subscriberPages = usePagination(filteredSubscribers, 50, subscriberSearch);

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  const handleEventSubmit = async (eventData) => {
    setIsSubmittingEvent(true);
    try {
      if (editingEvent) {
        await FundraisingEvent.update(editingEvent.id, eventData);
        toast.success('Event updated');
      } else {
        await FundraisingEvent.create(eventData);
        toast.success('Event created');
      }
      setShowEventForm(false);
      setEditingEvent(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Could not save the event', { description: error?.message });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm(`Delete the event "${event.title}"? This can't be undone.`)) return;
    try {
      await FundraisingEvent.delete(event.id);
      toast.success('Event deleted');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Could not delete the event', { description: error?.message });
    }
  };

  // ---------------------------------------------------------------------------
  // Gallery
  // ---------------------------------------------------------------------------

  const handleGallerySubmit = async (itemData) => {
    try {
      if (editingGalleryItem) {
        await GalleryItem.update(editingGalleryItem.id, itemData);
        toast.success('Gallery item updated');
      } else {
        const newDisplayOrder = gallery.length > 0 ? Math.max(...gallery.map((item) => item.display_order || 0)) + 1 : 0;
        await GalleryItem.create({ ...itemData, display_order: newDisplayOrder });
        toast.success('Gallery item added');
      }
      setShowGalleryForm(false);
      setEditingGalleryItem(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      toast.error('Could not save the gallery item', { description: error?.message });
    }
  };

  const handleEditGalleryItem = (item) => {
    setEditingGalleryItem(item);
    setShowGalleryForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteGalleryItem = async (item) => {
    if (!confirm(`Delete "${item.title}" from the gallery? This can't be undone.`)) return;
    try {
      await GalleryItem.delete(item.id);
      toast.success('Gallery item deleted');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast.error('Could not delete the gallery item', { description: error?.message });
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      await GalleryItem.update(item.id, { is_featured: !item.is_featured });
      setGallery((prev) => prev.map((g) => (g.id === item.id ? { ...g, is_featured: !item.is_featured } : g)));
      toast.success(item.is_featured ? 'Removed from homepage' : 'Featured on homepage');
    } catch (error) {
      toast.error('Could not update the item', { description: error?.message });
    }
  };

  const handleGalleryReorder = async (sourceIndex, destinationIndex) => {
    const reorderedItems = Array.from(gallery);
    const [movedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);
    setGallery(reorderedItems);

    try {
      await Promise.all(
        reorderedItems.map((item, index) =>
          item.display_order !== index ? GalleryItem.update(item.id, { display_order: index }) : null
        )
      );
      toast.success('Gallery order saved');
    } catch (error) {
      console.error('Error reordering gallery items:', error);
      toast.error('Could not save the new order', { description: error?.message });
    }
    loadDashboardData();
  };

  const getDisplayImage = (item) => {
    if (item.is_external_url && item.media_type === 'video') {
      const thumbnail = getVideoThumbnail(item.media_url);
      return thumbnail?.thumbnail || item.media_url;
    }
    return item.media_url;
  };

  // ---------------------------------------------------------------------------
  // Exports
  // ---------------------------------------------------------------------------

  const exportDonations = () =>
    downloadCsv('donations', [
      { label: 'Date', value: (d) => formatDate(d.created_date, 'yyyy-MM-dd HH:mm') },
      { label: 'Donor', value: (d) => d.donor_name },
      { label: 'Email', value: (d) => d.donor_email },
      { label: 'Amount', value: (d) => amountOf(d).toFixed(2) },
      { label: 'Type', value: (d) => d.donation_type },
      { label: 'For', value: (d) => eventTitles[d.event_id] || 'General fund' },
      { label: 'Status', value: (d) => d.payment_status },
      { label: 'Anonymous', value: (d) => (d.is_anonymous ? 'Yes' : 'No') },
      { label: 'Dedication', value: (d) => d.dedication_message },
      { label: 'Stripe session', value: (d) => d.stripe_session_id },
    ], filteredDonations);

  const exportReferrals = () =>
    downloadCsv('referrals', [
      { label: 'Submitted', value: (r) => formatDate(r.created_date, 'yyyy-MM-dd HH:mm') },
      { label: 'Child', value: (r) => r.child_name },
      { label: 'Age', value: (r) => r.child_age },
      { label: 'Guardian', value: (r) => r.guardian_name },
      { label: 'Guardian email', value: (r) => r.guardian_email },
      { label: 'Guardian phone', value: (r) => r.guardian_phone },
      { label: 'Wish', value: (r) => r.wish_description },
      { label: 'Heard about us', value: (r) => r.referral_source },
      { label: 'Urgency', value: (r) => r.urgency_level },
      { label: 'Status', value: (r) => r.status },
      { label: 'Follow-up date', value: (r) => r.follow_up_date },
      { label: 'Admin notes', value: (r) => r.admin_notes },
      { label: 'Attachments', value: (r) => (r.uploaded_files || []).length },
    ], filteredReferrals);

  const exportSubscribers = () =>
    downloadCsv('newsletter-subscribers', [
      { label: 'Email', value: (s) => s.email },
      { label: 'First name', value: (s) => s.first_name },
      { label: 'Source', value: (s) => s.subscription_source },
      { label: 'Active', value: (s) => (s.is_active ? 'Yes' : 'No') },
      { label: 'Subscribed', value: (s) => formatDate(s.created_date, 'yyyy-MM-dd') },
    ], filteredSubscribers);

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  const count = (n) => (isLoading ? '·' : n);
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'referrals', label: 'Referrals', icon: Users, count: count(openReferrals.length) },
    { id: 'donations', label: 'Donations', icon: Heart, count: count(donations.length) },
    { id: 'events', label: 'Events', icon: CalendarDays, count: count(events.length) },
    { id: 'gallery', label: 'Gallery', icon: Images, count: count(gallery.length) },
    { id: 'subscribers', label: 'Subscribers', icon: Mail, count: count(activeSubscribers.length) },
  ];

  const featuredCount = gallery.filter((i) => i.is_featured).length;
  const primary = 'bg-blue-600 hover:bg-blue-700';

  const headers = {
    overview: {
      title: 'Overview',
      description: `${format(now, 'EEEE, MMMM d')} · what needs your attention today`,
    },
    referrals: {
      title: 'Kid referrals',
      description: `${referrals.length} total · ${pendingReferrals.length} new since last review`,
      actions: (
        <Button size="sm" variant="outline" onClick={exportReferrals} disabled={filteredReferrals.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export
        </Button>
      ),
    },
    donations: {
      title: 'Donations',
      description: `${formatCurrency(raisedAllTime)} raised from ${completedDonations.length} completed donations`,
      actions: (
        <Button size="sm" variant="outline" onClick={exportDonations} disabled={filteredDonations.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export
        </Button>
      ),
    },
    events: {
      title: 'Fundraising events',
      description: 'Active events appear on the Support Us page',
      actions: (
        <Button size="sm" onClick={() => { setEditingEvent(null); setShowEventForm(true); }} className={primary}>
          <Plus className="mr-1.5 h-4 w-4" /> Add event
        </Button>
      ),
    },
    gallery: {
      title: 'Gallery',
      description: `${gallery.length} items · ${featuredCount} featured on the homepage`,
      actions: (
        <>
          <Button size="sm" variant="outline" asChild className="hidden sm:inline-flex">
            <a href="/Gallery" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" /> Public gallery
            </a>
          </Button>
          <Button size="sm" onClick={() => { setEditingGalleryItem(null); setShowGalleryForm(true); }} className={primary}>
            <Plus className="mr-1.5 h-4 w-4" /> Add item
          </Button>
        </>
      ),
    },
    subscribers: {
      title: 'Newsletter subscribers',
      description: `${activeSubscribers.length} active subscribers`,
      actions: (
        <Button size="sm" variant="outline" onClick={exportSubscribers} disabled={filteredSubscribers.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export
        </Button>
      ),
    },
  };
  const header = headers[activeTab];

  const refreshButton = (
    <IconButton
      label="Refresh data"
      icon={RefreshCw}
      onClick={loadDashboardData}
      disabled={isLoading}
      className={isLoading ? '[&_svg]:animate-spin' : ''}
    />
  );

  const attentionReferrals = [...openReferrals]
    .sort((a, b) =>
      (URGENCY_RANK[a.urgency_level] ?? 9) - (URGENCY_RANK[b.urgency_level] ?? 9) ||
      new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);
  const recentDonations = completedDonations.slice(0, 6);
  const featuredItems = gallery.filter((i) => i.is_featured).slice(0, 6);

  const viewAll = (tab, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
    >
      {label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );

  const toolbar = 'flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center';

  return (
    <AdminShell
      items={navItems}
      active={activeTab}
      onSelect={setActiveTab}
      title={header.title}
      description={header.description}
      actions={<>{header.actions}{refreshButton}</>}
    >
      {loadError && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load dashboard data: {loadError}
        </div>
      )}

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Raised, all time"
              value={isLoading ? '—' : formatCurrency(raisedAllTime)}
              detail={`${completedDonations.length} completed donations`}
              icon={DollarSign}
              accent="text-green-700 bg-green-50"
              onClick={() => { setDonationStatus('completed'); setActiveTab('donations'); }}
            />
            <StatCard
              label="This month"
              value={isLoading ? '—' : formatCurrency(raisedThisMonth)}
              detail={`${thisMonth.length} donation${thisMonth.length === 1 ? '' : 's'} in ${format(now, 'MMMM')}`}
              icon={Heart}
              accent="text-red-600 bg-red-50"
            />
            <StatCard
              label="Referrals to review"
              value={isLoading ? '—' : openReferrals.length}
              detail={`${pendingReferrals.length} new, ${openReferrals.length - pendingReferrals.length} in review`}
              icon={Users}
              accent="text-blue-700 bg-blue-50"
              onClick={() => { setReferralStatus('open'); setActiveTab('referrals'); }}
            />
            <StatCard
              label="Subscribers"
              value={isLoading ? '—' : activeSubscribers.length}
              detail={subscribers.length > activeSubscribers.length ? `${subscribers.length - activeSubscribers.length} unsubscribed` : 'All active'}
              icon={Mail}
              accent="text-orange-600 bg-orange-50"
              onClick={() => setActiveTab('subscribers')}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Needs attention"
              description="Open referrals, most urgent first"
              action={openReferrals.length > 0 && viewAll('referrals', 'All referrals')}
            >
              {attentionReferrals.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">
                  {isLoading ? 'Loading…' : 'You’re all caught up. New referrals will show up here.'}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {attentionReferrals.map((referral) => (
                    <li key={referral.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedReferral(referral)}
                        className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                          {referral.child_name?.[0]?.toUpperCase() ?? '?'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {referral.child_name}{referral.child_age != null && <span className="font-normal text-gray-500">, {referral.child_age}</span>}
                          </span>
                          <span className="block truncate text-sm text-gray-500">{referral.wish_description}</span>
                        </span>
                        <span className="hidden shrink-0 sm:block">
                          <StatusBadge tone={URGENCY_TONES[referral.urgency_level]}>{referral.urgency_level}</StatusBadge>
                        </span>
                        <span className="w-16 shrink-0 text-right text-xs text-gray-500">{formatDate(referral.created_date, 'MMM d')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Upcoming events"
              action={viewAll('events', 'Manage')}
            >
              {upcomingEvents.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">{isLoading ? 'Loading…' : 'No upcoming events scheduled.'}</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {upcomingEvents.slice(0, 4).map((event) => {
                    const goal = Number(event.fundraising_goal) || 0;
                    const raised = Number(event.amount_raised) || 0;
                    return (
                      <li key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <SmartImage src={event.image_url} alt="" className="absolute inset-0 h-full w-full object-cover [&_svg]:h-5 [&_svg]:w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-500">{formatDate(event.event_date, 'EEE, MMM d')}</p>
                          {goal > 0 && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <Progress value={Math.min((raised / goal) * 100, 100)} className="h-1.5 flex-1" />
                              <span className="text-[11px] tabular-nums text-gray-500">{Math.min(Math.round((raised / goal) * 100), 100)}%</span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Recent donations"
              action={donations.length > 0 && viewAll('donations', 'All donations')}
            >
              {recentDonations.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">{isLoading ? 'Loading…' : 'No completed donations yet.'}</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentDonations.map((donation) => (
                    <li key={donation.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{donation.donor_name || 'Anonymous donor'}</p>
                        <p className="truncate text-xs text-gray-500">
                          {eventTitles[donation.event_id] || 'General fund'}{donation.donation_type === 'monthly' ? ' · monthly' : ''}
                        </p>
                      </div>
                      <span className="hidden text-xs text-gray-500 sm:block">{formatDate(donation.created_date, 'MMM d')}</span>
                      <span className="w-20 text-right text-sm font-semibold tabular-nums text-gray-900">{formatCurrency(amountOf(donation))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="On the homepage"
              description={`${featuredCount} featured gallery item${featuredCount === 1 ? '' : 's'}`}
              action={viewAll('gallery', 'Edit')}
            >
              {featuredItems.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">
                  {isLoading ? 'Loading…' : 'Star items in the Gallery to feature them on the homepage.'}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {featuredItems.map((item) => (
                    <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100" title={item.title}>
                      <SmartImage
                        src={getDisplayImage(item)}
                        fallbackSrc={item.is_external_url && item.media_type === 'video' ? getVideoThumbnail(item.media_url)?.fallback : undefined}
                        alt={item.title}
                        placeholderIcon={item.media_type === 'video' ? 'video' : 'image'}
                        className="absolute inset-0 h-full w-full object-cover [&_svg]:h-5 [&_svg]:w-5"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* Referrals */}
      {activeTab === 'referrals' && (
        <Panel>
          <div className={toolbar}>
            <SearchInput
              value={referralSearch}
              onChange={setReferralSearch}
              placeholder="Search child, guardian, email or wish"
              label="Search referrals"
              className="sm:max-w-sm sm:flex-1"
            />
            <div className="flex gap-2">
              <Select value={referralStatus} onValueChange={setReferralStatus}>
                <SelectTrigger className="h-9 w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Needs review</SelectItem>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
              <Select value={referralUrgency} onValueChange={setReferralUrgency}>
                <SelectTrigger className="h-9 w-36" aria-label="Filter by urgency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredReferrals.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title={referrals.length === 0 ? 'No referrals yet' : 'No referrals match'}
                description={referrals.length === 0
                  ? 'Referrals submitted through the Refer a Kid form will appear here.'
                  : 'Try a different search or filter.'}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                    <TableHead>Child</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead className="min-w-[16rem]">Wish</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralPages.pageItems.map((referral) => (
                    <TableRow
                      key={referral.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedReferral(referral)}
                    >
                      <TableCell>
                        <p className="font-medium text-gray-900">{referral.child_name}</p>
                        {referral.child_age != null && <p className="text-xs text-gray-500">Age {referral.child_age}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900">{referral.guardian_name}</p>
                        <p className="text-xs text-gray-500">{referral.guardian_email}</p>
                        {referral.guardian_phone && <p className="text-xs text-gray-500">{referral.guardian_phone}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-md text-gray-700 line-clamp-2">{referral.wish_description}</p>
                        {referral.uploaded_files?.length > 0 && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Paperclip className="h-3 w-3" aria-hidden="true" />
                            {referral.uploaded_files.length} attachment{referral.uploaded_files.length === 1 ? '' : 's'}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={URGENCY_TONES[referral.urgency_level]}>{referral.urgency_level}</StatusBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={REFERRAL_STATUS_TONES[referral.status]}>{referral.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-600">
                        {formatDate(referral.created_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <IconButton
                          label={`Open referral for ${referral.child_name}`}
                          icon={Eye}
                          onClick={(e) => { e.stopPropagation(); setSelectedReferral(referral); }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination {...referralPages} />
            </>
          )}
        </Panel>
      )}

      {/* Donations */}
      {activeTab === 'donations' && (
        <Panel>
          <div className={toolbar}>
            <SearchInput
              value={donationSearch}
              onChange={setDonationSearch}
              placeholder="Search donor, email or event"
              label="Search donations"
              className="sm:max-w-sm sm:flex-1"
            />
            <Select value={donationStatus} onValueChange={setDonationStatus}>
              <SelectTrigger className="h-9 w-40" aria-label="Filter by payment status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            {donationStatus === 'pending' && (
              <p className="text-xs text-gray-500 sm:ml-auto sm:max-w-xs">
                Pending = checkout started but Stripe hasn&apos;t confirmed payment.
              </p>
            )}
          </div>

          {filteredDonations.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={DollarSign}
                title={donations.length === 0 ? 'No donations yet' : 'No donations match'}
                description={donations.length === 0 ? 'Donations made through the site will appear here.' : 'Try a different search or filter.'}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                    <TableHead className="min-w-[14rem]">Donor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="min-w-[12rem]">For</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donationPages.pageItems.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{donation.donor_name || '—'}</p>
                          {donation.is_anonymous && <StatusBadge tone="gray" title="Asked not to be named publicly">Anonymous</StatusBadge>}
                        </div>
                        <p className="text-xs text-gray-500">{donation.donor_email}</p>
                        {donation.dedication_message && (
                          <p className="mt-0.5 text-xs italic text-gray-500">In honor of {donation.dedication_message}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-semibold tabular-nums text-gray-900">{formatCurrency(amountOf(donation))}</p>
                        {donation.donation_type === 'monthly' && <p className="text-xs text-gray-500">monthly</p>}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {eventTitles[donation.event_id] || <span className="text-gray-500">General fund</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-600">{formatDate(donation.created_date)}</TableCell>
                      <TableCell>
                        <StatusBadge tone={PAYMENT_TONES[donation.payment_status]}>{donation.payment_status}</StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination {...donationPages} />
            </>
          )}
        </Panel>
      )}

      {/* Events */}
      {activeTab === 'events' && (
        <>
          {showEventForm && (
            <EventForm
              event={editingEvent}
              onSubmit={handleEventSubmit}
              onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
              isSubmitting={isSubmittingEvent}
            />
          )}

          {events.length === 0 && !showEventForm ? (
            <EmptyState icon={Target} title="No events yet" description="Add a fundraising event to show it on the Support Us page.">
              <Button size="sm" onClick={() => setShowEventForm(true)} className={primary}><Plus className="mr-1.5 h-4 w-4" /> Add your first event</Button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => {
                const goal = Number(event.fundraising_goal) || 0;
                const raised = Number(event.amount_raised) || 0;
                const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                const isPast = event.event_date && new Date(event.event_date) < now;
                const donationCount = completedDonations.filter((d) => d.event_id === event.id).length;
                return (
                  <article key={event.id} className="flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                      <SmartImage src={event.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute left-3 top-3 flex gap-1.5">
                        <StatusBadge tone={event.is_active ? 'green' : 'gray'}>{event.is_active ? 'Active' : 'Hidden'}</StatusBadge>
                        {isPast && <StatusBadge tone="gray">Past</StatusBadge>}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="truncate font-semibold text-gray-900" title={event.title}>{event.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" aria-hidden="true" /> {formatDate(event.event_date)}</span>
                        {event.location && <span className="flex min-w-0 items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> <span className="truncate">{event.location}</span></span>}
                      </div>
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-baseline justify-between text-sm">
                          <span className="font-semibold tabular-nums text-gray-900">{formatCurrency(raised)}</span>
                          <span className="text-xs text-gray-500">{goal > 0 ? `of ${formatCurrency(goal)}` : 'No goal set'}</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 py-2 pl-4 pr-2">
                      <p className="text-xs text-gray-500">
                        {goal > 0 && `${pct.toFixed(0)}% · `}{donationCount} online donation{donationCount === 1 ? '' : 's'}
                      </p>
                      <div className="flex">
                        <IconButton label={`Edit ${event.title}`} icon={Edit} onClick={() => handleEditEvent(event)} />
                        <IconButton label={`Delete ${event.title}`} icon={Trash2} tone="danger" onClick={() => handleDeleteEvent(event)} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Gallery */}
      {activeTab === 'gallery' && (
        <>
          {showGalleryForm && (
            <GalleryForm
              item={editingGalleryItem}
              onSubmit={handleGallerySubmit}
              onCancel={() => { setShowGalleryForm(false); setEditingGalleryItem(null); }}
            />
          )}

          <SectionHeader
            title={galleryViewMode === 'list' ? 'Display order' : 'All items'}
            description={galleryViewMode === 'list'
              ? 'Drag items to change their order in the public gallery. Items at the top appear first.'
              : 'Star an item to feature it on the homepage.'}
          >
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm" role="group" aria-label="View">
              {[['grid', 'Grid', LayoutGrid], ['list', 'Reorder', ListOrdered]].map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={galleryViewMode === mode}
                  onClick={() => setGalleryViewMode(mode)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    galleryViewMode === mode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                </button>
              ))}
            </div>
          </SectionHeader>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200/80 bg-white">
                  <div className="aspect-[4/3] bg-gray-100" />
                  <div className="space-y-2 p-3">
                    <div className="h-3.5 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : gallery.length === 0 && !showGalleryForm ? (
            <EmptyState icon={Camera} title="No gallery items yet" description="Add photos or videos to show them in the public gallery.">
              <Button size="sm" onClick={() => setShowGalleryForm(true)} className={primary}><Plus className="mr-1.5 h-4 w-4" /> Add your first item</Button>
            </EmptyState>
          ) : galleryViewMode === 'list' ? (
            <GalleryReorderList
              items={gallery}
              onReorder={handleGalleryReorder}
              onEdit={handleEditGalleryItem}
              onDelete={handleDeleteGalleryItem}
              getDisplayImage={getDisplayImage}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {gallery.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <SmartImage
                      src={getDisplayImage(item)}
                      fallbackSrc={item.is_external_url && item.media_type === 'video' ? getVideoThumbnail(item.media_url)?.fallback : undefined}
                      alt=""
                      placeholderIcon={item.media_type === 'video' ? 'video' : 'image'}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                    {item.media_type === 'video' && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                          <Play className="ml-0.5 h-4 w-4 text-white" aria-hidden="true" />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(item)}
                      aria-pressed={item.is_featured}
                      aria-label={item.is_featured ? `Remove ${item.title} from the homepage` : `Feature ${item.title} on the homepage`}
                      title={item.is_featured ? 'Featured on the homepage (click to remove)' : 'Feature on the homepage'}
                      className={`absolute right-2 top-2 inline-flex h-7 items-center gap-1 rounded-full px-2 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        item.is_featured
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-white/90 text-gray-600 opacity-0 backdrop-blur-sm hover:text-gray-900 group-hover:opacity-100 focus-visible:opacity-100'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${item.is_featured ? 'fill-current' : ''}`} aria-hidden="true" />
                      {item.is_featured ? 'Featured' : 'Feature'}
                    </button>
                  </div>
                  <div className="flex items-start gap-1 py-2.5 pl-3 pr-1.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-gray-900" title={item.title}>{item.title}</h3>
                      <p className="mt-0.5 truncate text-xs capitalize text-gray-500">
                        {[item.category?.replace(/-/g, ' ') || 'uncategorized', item.media_type, item.child_name].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <IconButton label={`Edit ${item.title}`} icon={Edit} onClick={() => handleEditGalleryItem(item)} />
                    <IconButton label={`Delete ${item.title}`} icon={Trash2} tone="danger" onClick={() => handleDeleteGalleryItem(item)} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* Subscribers */}
      {activeTab === 'subscribers' && (
        <Panel>
          <div className={toolbar}>
            <SearchInput
              value={subscriberSearch}
              onChange={setSubscriberSearch}
              placeholder="Search email or name"
              label="Search subscribers"
              className="sm:max-w-sm sm:flex-1"
            />
          </div>
          {filteredSubscribers.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Mail}
                title={subscribers.length === 0 ? 'No subscribers yet' : 'No subscribers match'}
                description={subscribers.length === 0 ? 'People who sign up in the site footer will appear here.' : 'Try a different search.'}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriberPages.pageItems.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium text-gray-900">{subscriber.email}</TableCell>
                      <TableCell className="text-gray-700">{subscriber.first_name || '—'}</TableCell>
                      <TableCell className="capitalize text-gray-600">{subscriber.subscription_source?.replace(/-/g, ' ') || '—'}</TableCell>
                      <TableCell>
                        <StatusBadge tone={subscriber.is_active ? 'green' : 'gray'}>{subscriber.is_active ? 'Active' : 'Unsubscribed'}</StatusBadge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-gray-600">{formatDate(subscriber.created_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination {...subscriberPages} />
            </>
          )}
        </Panel>
      )}

      {/* Keyed per referral: the modal copies the referral into form state on mount,
          so reusing one instance would show (and save) stale values. */}
      <ReferralDetailModal
        key={selectedReferral?.id ?? 'none'}
        referral={selectedReferral}
        isOpen={!!selectedReferral}
        onClose={() => setSelectedReferral(null)}
        onUpdate={() => {
          setSelectedReferral(null);
          loadDashboardData();
          toast.success('Referral updated');
        }}
      />
    </AdminShell>
  );
}
