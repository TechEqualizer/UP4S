import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Donation, KidReferral, GalleryItem, NewsletterSubscriber, FundraisingEvent } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import SmartImage from '@/components/ui/smart-image';
import {
  DollarSign, Users, Camera, Mail, Download, Eye, Plus, Edit, Trash2, Play, Target,
  Calendar, MapPin, CalendarDays, Heart, ExternalLink, LayoutGrid, ListOrdered, RefreshCw, Star, Paperclip,
} from 'lucide-react';
import { format, isThisMonth } from 'date-fns';
import GalleryForm from '@/components/admin/GalleryForm';
import GalleryReorderList from '@/components/admin/GalleryReorderList';
import ReferralDetailModal from '@/components/admin/ReferralDetailModal';
import EventForm from '@/components/admin/EventForm';
import { getVideoThumbnail } from '@/components/gallery/VideoEmbed';
import { formatCurrency } from '@/lib/utils';
import {
  StatCard, SectionHeader, SearchInput, EmptyState, StatusBadge, Pagination, usePagination,
  downloadCsv, matchesSearch, PAYMENT_TONES, REFERRAL_STATUS_TONES, URGENCY_TONES,
} from '@/components/admin/dashboard-ui';

const TABS = ['referrals', 'donations', 'events', 'gallery', 'subscribers'];
const MAX_ROWS = 1000;

function formatDate(value, pattern = 'MMM d, yyyy') {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, pattern);
}

const amountOf = (donation) => Number(donation.amount) || 0;

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'referrals';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

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

  const tabCounts = {
    referrals: openReferrals.length,
    donations: donations.length,
    events: events.length,
    gallery: gallery.length,
    subscribers: activeSubscribers.length,
  };
  const tabLabels = { referrals: 'Referrals', donations: 'Donations', events: 'Events', gallery: 'Gallery', subscribers: 'Subscribers' };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">Referrals, donations and site content for Team UP4S</p>
          </div>
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading} className="self-start sm:self-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loadError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load dashboard data: {loadError}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <StatCard
            label="Raised, all time"
            value={isLoading ? '—' : formatCurrency(raisedAllTime)}
            detail={`${completedDonations.length} completed donations`}
            icon={DollarSign}
            accent="text-green-600 bg-green-50"
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
            label="To review"
            value={isLoading ? '—' : openReferrals.length}
            detail={`${pendingReferrals.length} new, ${openReferrals.length - pendingReferrals.length} in review`}
            icon={Users}
            accent="text-blue-600 bg-blue-50"
            onClick={() => { setReferralStatus('open'); setActiveTab('referrals'); }}
          />
          <StatCard
            label="Upcoming events"
            value={isLoading ? '—' : upcomingEvents.length}
            detail={upcomingEvents[0] ? `Next: ${upcomingEvents[0].title} · ${formatDate(upcomingEvents[0].event_date, 'MMM d')}` : 'None scheduled'}
            icon={CalendarDays}
            accent="text-purple-600 bg-purple-50"
            onClick={() => setActiveTab('events')}
          />
          <StatCard
            label="Subscribers"
            value={isLoading ? '—' : activeSubscribers.length}
            detail={subscribers.length > activeSubscribers.length ? `${subscribers.length - activeSubscribers.length} unsubscribed` : 'All active'}
            icon={Mail}
            accent="text-orange-600 bg-orange-50"
            onClick={() => setActiveTab('subscribers')}
            className="col-span-2 lg:col-span-1"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <TabsList className="h-auto min-w-max bg-white p-1 shadow-sm ring-1 ring-gray-200">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="gap-2 px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  {tabLabels[tab]}
                  <span className="rounded-full bg-black/10 px-1.5 text-xs tabular-nums">{isLoading ? '·' : tabCounts[tab]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Referrals */}
          <TabsContent value="referrals">
            <SectionHeader
              title="Kid referrals"
              description={`${referrals.length} total · ${pendingReferrals.length} new since last review`}
            >
              <Button variant="outline" onClick={exportReferrals} disabled={filteredReferrals.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </SectionHeader>

            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                <SearchInput
                  value={referralSearch}
                  onChange={setReferralSearch}
                  placeholder="Search child, guardian, email or wish"
                  label="Search referrals"
                  className="sm:max-w-sm sm:flex-1"
                />
                <div className="flex gap-3">
                  <Select value={referralStatus} onValueChange={setReferralStatus}>
                    <SelectTrigger className="w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
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
                    <SelectTrigger className="w-36" aria-label="Filter by urgency"><SelectValue /></SelectTrigger>
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
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
                            className="cursor-pointer hover:bg-blue-50/40"
                            onClick={() => setSelectedReferral(referral)}
                          >
                            <TableCell>
                              <p className="font-medium text-gray-900">{referral.child_name}</p>
                              {referral.child_age != null && <p className="text-sm text-gray-500">Age {referral.child_age}</p>}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-gray-900">{referral.guardian_name}</p>
                              <p className="text-sm text-gray-500">{referral.guardian_email}</p>
                              {referral.guardian_phone && <p className="text-sm text-gray-500">{referral.guardian_phone}</p>}
                            </TableCell>
                            <TableCell>
                              <p className="max-w-md text-sm text-gray-700 line-clamp-2">{referral.wish_description}</p>
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
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">
                              {formatDate(referral.created_date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => { e.stopPropagation(); setSelectedReferral(referral); }}
                                aria-label={`Open referral for ${referral.child_name}`}
                              >
                                <Eye className="mr-1 h-4 w-4" /> Open
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination {...referralPages} />
                </>
              )}
            </Card>
          </TabsContent>

          {/* Donations */}
          <TabsContent value="donations">
            <SectionHeader
              title="Donations"
              description={`${formatCurrency(raisedAllTime)} raised from ${completedDonations.length} completed donations`}
            >
              <Button variant="outline" onClick={exportDonations} disabled={filteredDonations.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </SectionHeader>

            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
                <SearchInput
                  value={donationSearch}
                  onChange={setDonationSearch}
                  placeholder="Search donor, email or event"
                  label="Search donations"
                  className="sm:max-w-sm sm:flex-1"
                />
                <Select value={donationStatus} onValueChange={setDonationStatus}>
                  <SelectTrigger className="w-40" aria-label="Filter by payment status"><SelectValue /></SelectTrigger>
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
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
                              <p className="text-sm text-gray-500">{donation.donor_email}</p>
                              {donation.dedication_message && (
                                <p className="mt-0.5 text-xs italic text-gray-500">In honor of {donation.dedication_message}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <p className="font-semibold tabular-nums text-gray-900">{formatCurrency(amountOf(donation))}</p>
                              {donation.donation_type === 'monthly' && <p className="text-xs text-gray-500">monthly</p>}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">
                              {eventTitles[donation.event_id] || <span className="text-gray-500">General fund</span>}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">{formatDate(donation.created_date)}</TableCell>
                            <TableCell>
                              <StatusBadge tone={PAYMENT_TONES[donation.payment_status]}>{donation.payment_status}</StatusBadge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination {...donationPages} />
                </>
              )}
            </Card>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events">
            <SectionHeader title="Fundraising events" description="Events appear on the Support Us page.">
              <Button onClick={() => { setEditingEvent(null); setShowEventForm(true); }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add event
              </Button>
            </SectionHeader>

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
                <Button onClick={() => setShowEventForm(true)}><Plus className="mr-2 h-4 w-4" /> Add your first event</Button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const goal = Number(event.fundraising_goal) || 0;
                  const raised = Number(event.amount_raised) || 0;
                  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                  const isPast = event.event_date && new Date(event.event_date) < now;
                  const donationCount = completedDonations.filter((d) => d.event_id === event.id).length;
                  return (
                    <Card key={event.id} className="flex flex-col overflow-hidden">
                      <div className="relative aspect-video">
                        <SmartImage src={event.image_url} alt="" className="h-full w-full object-cover" />
                        <div className="absolute left-3 top-3 flex gap-1.5">
                          <StatusBadge tone={event.is_active ? 'green' : 'gray'}>{event.is_active ? 'Active' : 'Hidden'}</StatusBadge>
                          {isPast && <StatusBadge tone="gray">Past</StatusBadge>}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" aria-hidden="true" /> {formatDate(event.event_date)}</span>
                          {event.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" /> {event.location}</span>}
                        </div>
                        <div className="mt-4 flex-1">
                          <div className="mb-1 flex items-baseline justify-between text-sm">
                            <span className="font-semibold text-gray-900">{formatCurrency(raised)}</span>
                            <span className="text-gray-500">{goal > 0 ? `of ${formatCurrency(goal)}` : 'No goal set'}</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <p className="mt-1.5 text-xs text-gray-500">
                            {goal > 0 && `${pct.toFixed(0)}% · `}{donationCount} online donation{donationCount === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 border-t border-gray-100 p-3">
                        <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteEvent(event)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Gallery */}
          <TabsContent value="gallery">
            <SectionHeader
              title="Gallery"
              description={`${gallery.length} items · ${gallery.filter((i) => i.is_featured).length} featured on the homepage`}
            >
              <div className="inline-flex rounded-md border border-gray-300 bg-white p-0.5" role="group" aria-label="View">
                {[['grid', 'Grid', LayoutGrid], ['list', 'Reorder', ListOrdered]].map(([mode, label, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={galleryViewMode === mode}
                    onClick={() => setGalleryViewMode(mode)}
                    className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium ${
                      galleryViewMode === mode ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                  </button>
                ))}
              </div>
              <Button variant="outline" asChild>
                <a href="/Gallery" target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Public gallery
                </a>
              </Button>
              <Button onClick={() => { setEditingGalleryItem(null); setShowGalleryForm(true); }} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add item
              </Button>
            </SectionHeader>

            {showGalleryForm && (
              <GalleryForm
                item={editingGalleryItem}
                onSubmit={handleGallerySubmit}
                onCancel={() => { setShowGalleryForm(false); setEditingGalleryItem(null); }}
              />
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white p-3 shadow-sm">
                    <div className="aspect-video rounded-lg bg-gray-200" />
                    <div className="mt-3 h-4 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : gallery.length === 0 && !showGalleryForm ? (
              <EmptyState icon={Camera} title="No gallery items yet" description="Add photos or videos to show them in the public gallery.">
                <Button onClick={() => setShowGalleryForm(true)}><Plus className="mr-2 h-4 w-4" /> Add your first item</Button>
              </EmptyState>
            ) : galleryViewMode === 'list' ? (
              <div>
                <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Drag items to change their order in the public gallery. Items at the top appear first.
                </p>
                <GalleryReorderList
                  items={gallery}
                  onReorder={handleGalleryReorder}
                  onEdit={handleEditGalleryItem}
                  onDelete={handleDeleteGalleryItem}
                  getDisplayImage={getDisplayImage}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {gallery.map((item) => (
                  <Card key={item.id} className="group flex flex-col overflow-hidden">
                    <div className="relative aspect-video">
                      <SmartImage
                        src={getDisplayImage(item)}
                        fallbackSrc={item.is_external_url && item.media_type === 'video' ? getVideoThumbnail(item.media_url)?.fallback : undefined}
                        alt=""
                        placeholderIcon={item.media_type === 'video' ? 'video' : 'image'}
                        className="h-full w-full object-cover"
                      />
                      {item.media_type === 'video' && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70">
                            <Play className="ml-0.5 h-5 w-5 text-white" aria-hidden="true" />
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item)}
                        aria-pressed={item.is_featured}
                        title={item.is_featured ? 'Featured on the homepage (click to remove)' : 'Feature on the homepage'}
                        className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow transition ${
                          item.is_featured ? 'bg-yellow-400 text-gray-900' : 'bg-white/90 text-gray-600 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${item.is_featured ? 'fill-current' : ''}`} aria-hidden="true" />
                        {item.is_featured ? 'Featured' : 'Feature'}
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-center gap-1.5">
                        <StatusBadge tone="blue">{item.category?.replace(/-/g, ' ') || 'uncategorized'}</StatusBadge>
                        <StatusBadge tone="gray">{item.media_type}</StatusBadge>
                      </div>
                      <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                      {item.child_name && (
                        <p className="mt-1 text-sm text-gray-500">By {item.child_name}{item.child_age ? `, age ${item.child_age}` : ''}</p>
                      )}
                      <p className="mt-auto pt-3 text-xs text-gray-400">Added {formatDate(item.created_date)}</p>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-gray-100 p-3">
                      <Button variant="outline" size="sm" onClick={() => handleEditGalleryItem(item)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteGalleryItem(item)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subscribers */}
          <TabsContent value="subscribers">
            <SectionHeader title="Newsletter subscribers" description={`${activeSubscribers.length} active subscribers`}>
              <Button variant="outline" onClick={exportSubscribers} disabled={filteredSubscribers.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </SectionHeader>

            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 p-4">
                <SearchInput
                  value={subscriberSearch}
                  onChange={setSubscriberSearch}
                  placeholder="Search email or name"
                  label="Search subscribers"
                  className="sm:max-w-sm"
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
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80">
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
                            <TableCell className="text-sm capitalize text-gray-600">{subscriber.subscription_source?.replace(/-/g, ' ') || '—'}</TableCell>
                            <TableCell>
                              <StatusBadge tone={subscriber.is_active ? 'green' : 'gray'}>{subscriber.is_active ? 'Active' : 'Unsubscribed'}</StatusBadge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-gray-600">{formatDate(subscriber.created_date)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination {...subscriberPages} />
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>

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
      </div>
    </div>
  );
}
