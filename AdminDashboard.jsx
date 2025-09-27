import React, { useState, useEffect } from 'react';
import { Donation } from '@/api/entities';
import { KidReferral } from '@/api/entities';
import { GalleryItem } from '@/api/entities';
import { NewsletterSubscriber } from '@/api/entities';
import { FundraisingCampaign } from '@/api/entities';
import { FundraisingEvent } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users, Camera, Mail, TrendingUp, Download, Eye, Plus, Edit, Trash2, Settings, Play, Target, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import GalleryForm from "@/components/admin/GalleryForm";
import { Progress } from '@/components/ui/progress';
import { getVideoThumbnail } from "@/components/gallery/VideoEmbed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AdminDashboard() {
  const [donations, setDonations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryViewMode, setGalleryViewMode] = useState('grid');

  // Referral management states
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralFilters, setReferralFilters] = useState({
    status: 'all',
    urgency: 'all'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [donationsData, referralsData, galleryData, subscribersData, campaignsData, eventsData] = await Promise.all([
        Donation.list('-created_date', 50),
        KidReferral.list('-created_date', 50),
        GalleryItem.list('display_order', 100), 
        NewsletterSubscriber.list('-created_date', 50),
        FundraisingCampaign.list('-created_date', 50),
        FundraisingEvent.list('-created_date', 50)
      ]);
      
      setDonations(donationsData);
      setReferrals(referralsData);
      setGallery(galleryData);
      setSubscribers(subscribersData);
      setCampaigns(campaignsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setIsLoading(false);
  };

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const monthlyDonations = donations.filter(d => {
    const donationDate = new Date(d.created_date);
    const now = new Date();
    return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
  }).reduce((sum, d) => sum + (d.amount || 0), 0);

  const stats = [
    {
      title: "Total Donations",
      value: `$${totalDonations.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      change: "+12.5%"
    },
    {
      title: "Active Referrals",
      value: referrals.filter(r => r.status !== 'completed').length,
      icon: Users,
      color: "text-blue-600",
      change: "+8.2%"
    },
    {
      title: "Gallery Items",
      value: gallery.length,
      icon: Camera,
      color: "text-purple-600",
      change: "+15.3%"
    },
    {
      title: "Newsletter Subscribers",
      value: subscribers.length,
      icon: Mail,
      color: "text-orange-600",
      change: "+22.1%"
    },
    {
      title: "Active Campaigns",
      value: campaigns.filter(c => c.is_active).length,
      icon: Target,
      color: "text-indigo-600",
      change: "+2"
    }
  ];

  // Event Handlers
  const handleEventSubmit = async (eventData) => {
    setIsSubmittingEvent(true);
    try {
      if (editingEvent) {
        await FundraisingEvent.update(editingEvent.id, eventData);
      } else {
        await FundraisingEvent.create(eventData);
      }
      setShowEventForm(false);
      setEditingEvent(null);
      loadDashboardData();
    } catch (error) {
      alert('Error saving event. Please check the console for details.');
      console.error('Error saving event:', error);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (event) => {
    if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
      try {
        await FundraisingEvent.delete(event.id);
        loadDashboardData();
      } catch (error) {
        alert('Error deleting event. Please try again.');
        console.error('Error deleting event:', error);
      }
    }
  };

  // Gallery Handlers
  const handleGallerySubmit = async (itemData) => {
    try {
      if (editingGalleryItem) {
        await GalleryItem.update(editingGalleryItem.id, itemData);
      } else {
        const newDisplayOrder = gallery.length > 0 ? Math.max(...gallery.map(item => item.display_order || 0)) + 1 : 0;
        await GalleryItem.create({ ...itemData, display_order: newDisplayOrder });
      }
      setShowGalleryForm(false);
      setEditingGalleryItem(null);
      loadDashboardData();
    } catch (error) {
      alert('Error saving gallery item. Please try again.');
      console.error('Error saving gallery item:', error);
    }
  };

  const handleEditGalleryItem = (item) => {
    setEditingGalleryItem(item);
    setShowGalleryForm(true);
  };

  const handleDeleteGalleryItem = async (item) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await GalleryItem.delete(item.id);
        loadDashboardData();
      } catch (error) {
        alert('Error deleting gallery item. Please try again.');
        console.error('Error deleting gallery item:', error);
      }
    }
  };

  const handleGalleryReorder = async (sourceIndex, destinationIndex) => {
    const reorderedItems = Array.from(gallery);
    const [movedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);

    setGallery(reorderedItems);

    const updatePromises = reorderedItems.map((item, index) => {
      if (item.display_order !== index) {
        return GalleryItem.update(item.id, { display_order: index });
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(updatePromises);
      loadDashboardData(); 
    } catch (error) {
      alert('Error reordering items. Please try again.');
      console.error('Error reordering gallery items:', error);
      loadDashboardData(); 
    }
  };

  const getDisplayImage = (item) => {
    if (item.is_external_url && item.media_type === 'video') {
      const thumbnail = getVideoThumbnail(item.media_url);
      return thumbnail?.thumbnail || item.media_url;
    }
    return item.media_url;
  };

  const handleViewReferral = (referral) => {
    setSelectedReferral(referral);
    setShowReferralModal(true);
  };

  const handleUpdateReferral = () => {
    loadDashboardData();
    setShowReferralModal(false);
    setSelectedReferral(null);
  };

  const filteredReferrals = referrals.filter(referral => {
    const statusMatch = referralFilters.status === 'all' || referral.status === referralFilters.status;
    const urgencyMatch = referralFilters.urgency === 'all' || referral.urgency_level === referralFilters.urgency;
    return statusMatch && urgencyMatch;
  });

  const getStatusTooltip = (status) => {
    const tooltips = {
      pending: 'Initial submission - Needs admin review',
      reviewing: 'Team is evaluating - Under active consideration',  
      approved: 'Accepted for program - Moving to production phase',
      completed: 'Child\'s wish fulfilled - Project successfully completed',
      declined: 'Not suitable for program - Application rejected'
    };
    return tooltips[status] || status;
  };

  const getUrgencyTooltip = (urgency) => {
    const tooltips = {
      low: 'Low Priority - Standard processing timeline',
      medium: 'Medium Priority - Moderate urgency for completion',
      high: 'High Priority - Expedited processing needed',
      critical: 'Critical Priority - Immediate attention required'
    };
    return tooltips[urgency] || urgency;
  };

  const exportData = (data, filename) => {
    const csv = [
      Object.keys(data[0] || {}),
      ...data.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage UP4S activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">{stat.change}</span>
                  <span className="text-gray-500 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="donations" className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="bg-white p-1 min-w-max">
              <TabsTrigger value="donations" className="px-4">Donations</TabsTrigger>
              <TabsTrigger value="referrals" className="px-4">Referrals</TabsTrigger>
              <TabsTrigger value="events" className="px-4">Events</TabsTrigger>
              <TabsTrigger value="gallery" className="px-4">Gallery</TabsTrigger>
              <TabsTrigger value="subscribers" className="px-4">Subscribers</TabsTrigger>
            </TabsList>
          </div>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Donations</CardTitle>
                    <p className="text-gray-600">This month: ${monthlyDonations.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportData(donations, 'donations')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.slice(0, 10).map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{donation.donor_name}</p>
                              <p className="text-sm text-gray-500">{donation.donor_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${donation.amount?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={donation.donation_type === 'monthly' ? 'default' : 'secondary'}>
                              {donation.donation_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {donation.fund_designation?.replace('-', ' ')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(donation.created_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={donation.payment_status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                            >
                              {donation.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Kid Referrals</CardTitle>
                    <p className="text-gray-600 mt-1">
                      {referrals.length} total referrals • {referrals.filter(r => r.status === 'pending').length} pending review
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportData(referrals, 'referrals')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Select
                    value={referralFilters.status}
                    onValueChange={(value) => setReferralFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={referralFilters.urgency}
                    onValueChange={(value) => setReferralFilters(prev => ({ ...prev, urgency: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgency</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <TooltipProvider>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Child</TableHead>
                          <TableHead>Guardian</TableHead>
                          <TableHead>Wish Summary</TableHead>
                          <TableHead>Urgency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReferrals.map((referral) => (
                          <TableRow key={referral.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{referral.child_name}</p>
                                <p className="text-sm text-gray-500">Age {referral.child_age}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{referral.guardian_name}</p>
                                <p className="text-sm text-gray-500">{referral.guardian_email}</p>
                                {referral.guardian_phone && (
                                  <p className="text-sm text-gray-500">{referral.guardian_phone}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm line-clamp-3 max-w-xs">
                                {referral.wish_description}
                              </p>
                              {referral.uploaded_files && referral.uploaded_files.length > 0 && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {referral.uploaded_files.length} files
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline"
                                    className={
                                      referral.urgency_level === 'critical' ? 'border-red-500 text-red-700 bg-red-50 cursor-help' :
                                      referral.urgency_level === 'high' ? 'border-orange-500 text-orange-700 bg-orange-50 cursor-help' :
                                      referral.urgency_level === 'medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50 cursor-help' :
                                      'border-gray-300 text-gray-700 bg-gray-50 cursor-help'
                                    }
                                  >
                                    {referral.urgency_level}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{getUrgencyTooltip(referral.urgency_level)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge 
                                    variant="outline"
                                    className={
                                      referral.status === 'completed' ? 'border-green-500 text-green-700 bg-green-50 cursor-help' :
                                      referral.status === 'approved' ? 'border-blue-500 text-blue-700 bg-blue-50 cursor-help' :
                                      referral.status === 'reviewing' ? 'border-purple-500 text-purple-700 bg-purple-50 cursor-help' :
                                      referral.status === 'declined' ? 'border-red-500 text-red-700 bg-red-50 cursor-help' :
                                      'border-gray-300 text-gray-700 bg-gray-50 cursor-help'
                                    }
                                  >
                                    {referral.status}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{getStatusTooltip(referral.status)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{format(new Date(referral.created_date), 'MMM d, yyyy')}</p>
                                <p className="text-gray-500">{format(new Date(referral.created_date), 'h:mm a')}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleViewReferral(referral)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TooltipProvider>

                {filteredReferrals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No referrals match the current filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <CardTitle>Fundraising Events</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Manage your fundraising events.
                  </p>
                </div>
                <Button
                  onClick={() => { setEditingEvent(null); setShowEventForm(true); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
            </div>

            {showEventForm && (
              <EventForm 
                event={editingEvent}
                onSubmit={handleEventSubmit}
                onCancel={() => { setShowEventForm(false); setEditingEvent(null); }}
                isSubmitting={isSubmittingEvent}
              />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const progressPercentage = event.fundraising_goal > 0 ? Math.min(((event.amount_raised || 0) / event.fundraising_goal) * 100, 100) : 0;
                return (
                  <Card key={event.id} className="flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover rounded-t-lg" />
                      <Badge className={`absolute top-2 left-2 ${event.is_active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                        {event.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-sm text-gray-600 mb-4 flex-grow">{event.description}</p>
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-600">Raised</span>
                          <span className="font-medium">${(event.amount_raised || 0).toLocaleString()} / ${event.fundraising_goal.toLocaleString()}</span>
                        </div>
                        <Progress value={progressPercentage} />
                      </div>
                    </CardContent>
                    <div className="p-4 border-t flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
            {events.length === 0 && !showEventForm && (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first fundraising event.</p>
                <Button onClick={() => setShowEventForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Event
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="flex justify-between items-center mb-6">
              <div>
                <CardTitle>Gallery Management</CardTitle>
                <p className="text-gray-600 mt-1">
                  {gallery.length} total items • {gallery.filter(item => item.is_featured).length} featured
                </p>
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      View: {galleryViewMode === 'grid' ? 'Grid' : 'List (Reorder)'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setGalleryViewMode('grid')}>
                      Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setGalleryViewMode('list')}>
                      List View (Reorder)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => window.open('/gallery', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Public Gallery
                </Button>
                <Button
                  onClick={() => { setEditingGalleryItem(null); setShowGalleryForm(true); }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
            
            {showGalleryForm && (
              <GalleryForm 
                item={editingGalleryItem}
                onSubmit={handleGallerySubmit}
                onCancel={() => { setShowGalleryForm(false); setEditingGalleryItem(null); }}
              />
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : gallery.length === 0 && !showGalleryForm ? (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Gallery Items Found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first gallery item.</p>
                <Button onClick={() => setShowGalleryForm(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Item
                </Button>
              </div>
            ) : (
              galleryViewMode === 'list' ? (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Reorder Gallery Items
                    </h3>
                    <p className="text-blue-800">
                      Drag and drop items to change their display order on the public gallery. 
                      Items at the top will appear first.
                    </p>
                  </div>
                  
                  <GalleryReorderList
                    items={gallery}
                    onReorder={handleGalleryReorder}
                    onEdit={handleEditGalleryItem}
                    onDelete={handleDeleteGalleryItem}
                    getDisplayImage={getDisplayImage}
                  />
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span>Featured Items: {gallery.filter(item => item.is_featured).length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span>External URLs: {gallery.filter(item => item.is_external_url).length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <span>Videos: {gallery.filter(item => item.media_type === 'video').length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {gallery.map((item) => (
                      <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow">
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={getDisplayImage(item)}
                            alt={item.title} 
                            className="w-full h-full object-cover rounded-t-lg"
                            onError={(e) => {
                              if (item.is_external_url && item.media_type === 'video') {
                                const thumbnail = getVideoThumbnail(item.media_url);
                                if (thumbnail?.fallback && e.target.src !== thumbnail.fallback) {
                                  e.target.src = thumbnail.fallback;
                                }
                              }
                            }}
                          />
                          
                          {item.media_type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-6 h-6 text-white ml-1" />
                              </div>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex gap-1">
                            {item.is_featured && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                Featured
                              </Badge>
                            )}
                            {item.is_external_url && (
                              <Badge className="bg-blue-500 text-white text-xs">
                                External
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <CardContent className="p-4 flex-grow flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.category?.replace('-', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.media_type}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 flex-grow">
                            {item.title}
                          </h3>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {item.description}
                            </p>
                          )}
                          
                          {item.child_name && (
                            <p className="text-sm text-gray-500 mb-2">
                              By {item.child_name}, age {item.child_age}
                            </p>
                          )}
                          
                          <div className="text-xs text-gray-400 mb-3">
                            Order: {item.display_order ?? 'N/A'} • Created: {new Date(item.created_date).toLocaleDateString()}
                          </div>
                        </CardContent>
                        
                        <div className="p-4 border-t flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditGalleryItem(item)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteGalleryItem(item)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            )}
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Newsletter Subscribers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.slice(0, 10).map((subscriber) => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">
                            {subscriber.email}
                          </TableCell>
                          <TableCell>
                            {subscriber.first_name || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {subscriber.subscription_source?.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={subscriber.is_active ? 'bg-green-100 text-green-800 border-green-200' : ''}
                            >
                              {subscriber.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(subscriber.created_date), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Referral Detail Modal */}
        <ReferralDetailModal
          referral={selectedReferral}
          isOpen={showReferralModal}
          onClose={() => {
            setShowReferralModal(false);
            setSelectedReferral(null);
          }}
          onUpdate={handleUpdateReferral}
        />
      </div>
    </div>
  );
}