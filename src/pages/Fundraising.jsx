import React, { useState, useEffect } from 'react';
import { FundraisingEvent } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Users, Handshake, Mail, Phone, MapPin, Heart, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import SmartImage from '@/components/ui/smart-image';
import { formatCurrency } from '@/lib/utils';

export default function Fundraising() {
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState(() => new Set());
  const [volunteerForm, setVolunteerForm] = useState({
    name: '',
    email: '',
    phone: '',
    interests: '',
    experience: '',
    availability: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const allEvents = await FundraisingEvent.list('-event_date');
      const activeEvents = allEvents.filter(event => event.is_active === true);
      setEvents(activeEvents || []);
    } catch (error) {
      console.error("Error loading fundraising events:", error);
      setEvents([]);
    }
    setIsLoadingEvents(false);
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    alert('Thank you for your interest in volunteering! We\'ll be in touch soon.');
    setVolunteerForm({
      name: '',
      email: '',
      phone: '',
      interests: '',
      experience: '',
      availability: ''
    });
    setIsSubmitting(false);
  };

  const toggleEvent = (id) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEventDonate = (event) => {
    const customEvent = new CustomEvent('openDonationModal', {
      detail: { 
        eventId: event.id,
        eventTitle: event.title
      }
    });
    window.dispatchEvent(customEvent);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fundraising Events Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Fundraising <span className="gradient-text">Events &amp; Initiatives</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Support specific initiatives that directly impact the youth we serve. Every dollar brings us closer to our goals.
            </p>
          </div>

          {isLoadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardHeader><div className="h-6 bg-gray-200 rounded w-3/4"></div></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${events.length >= 3 ? 'lg:grid-cols-3' : 'max-w-5xl mx-auto'}`}>
              {events.map((event) => {
                const goal = Number(event.fundraising_goal) || 0;
                const raised = Number(event.amount_raised) || 0;
                const progressPercentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                const isPast = event.event_date && new Date(event.event_date) < new Date();
                const isExpanded = expandedEvents.has(event.id);
                const isLong = (event.description || '').length > 220;
                return (
                  <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {event.image_url && (
                      <div className="aspect-video relative">
                        <SmartImage src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        {isPast && (
                          <span className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Past event</span>
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1 mt-2">
                        {event.event_date && (
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="mb-6 flex-grow">
                        <p className={`text-gray-600 leading-relaxed whitespace-pre-line ${isLong && !isExpanded ? 'line-clamp-4' : ''}`}>
                          {event.description}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleEvent(event.id)}
                            aria-expanded={isExpanded}
                            className="mt-2 text-sm font-semibold text-blue-700 hover:text-blue-800 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-gray-600">Raised</span>
                          <span className="font-medium text-gray-800">
                            <span className="text-base font-bold text-gray-900">{formatCurrency(raised)}</span> of {formatCurrency(goal)}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                        <p className="text-xs text-gray-500 mt-1">{progressPercentage.toFixed(0)}% of goal reached</p>
                      </div>
                      {isPast ? (
                        <Button onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))} variant="outline" className="w-full mt-6">
                          <Heart className="w-4 h-4 mr-2" /> Donate to UP4S
                        </Button>
                      ) : (
                        <Button onClick={() => handleEventDonate(event)} className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                          <Heart className="w-4 h-4 mr-2" /> Support This Event
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg border-gray-200">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Events</h3>
              <p className="text-gray-500">Fundraising events will appear here as they are launched. Please check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Volunteer Opportunities */}
      <section id="volunteer-section" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Volunteer <span className="gradient-text">With Us</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Share your skills, time, and passion to directly impact young lives. 
                Whether you're a filmmaker, mentor, or just someone who cares, there's a place for you.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Target,
                    title: "Film & Media Mentorship",
                    description: "Guide students through the filmmaking process, from concept to final cut."
                  },
                  {
                    icon: Users,
                    title: "Event Support",
                    description: "Help with fundraising events, film screenings, and community gatherings."
                  },
                  {
                    icon: Handshake,
                    title: "Administrative Support",
                    description: "Assist with marketing, social media, grant writing, and daily operations."
                  }
                ].map((opportunity) => (
                  <div key={opportunity.title} className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <opportunity.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{opportunity.title}</h3>
                      <p className="text-gray-600">{opportunity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Express Your Interest</CardTitle>
                <p className="text-gray-600">Tell us how you'd like to get involved with UP4S.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="volunteer-name">Name *</Label>
                      <Input
                        id="volunteer-name"
                        required
                        value={volunteerForm.name}
                        onChange={(e) => setVolunteerForm({...volunteerForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="volunteer-email">Email *</Label>
                      <Input
                        id="volunteer-email"
                        type="email"
                        required
                        value={volunteerForm.email}
                        onChange={(e) => setVolunteerForm({...volunteerForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="volunteer-phone">Phone</Label>
                    <Input
                      id="volunteer-phone"
                      type="tel"
                      value={volunteerForm.phone}
                      onChange={(e) => setVolunteerForm({...volunteerForm, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="volunteer-interests">Areas of Interest</Label>
                    <Select 
                      value={volunteerForm.interests}
                      onValueChange={(value) => setVolunteerForm({...volunteerForm, interests: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mentorship">Film & Media Mentorship</SelectItem>
                        <SelectItem value="events">Event Support</SelectItem>
                        <SelectItem value="admin">Administrative Support</SelectItem>
                        <SelectItem value="fundraising">Fundraising</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="volunteer-experience">Relevant Experience</Label>
                    <Textarea
                      id="volunteer-experience"
                      placeholder="Tell us about your background and skills..."
                      value={volunteerForm.experience}
                      onChange={(e) => setVolunteerForm({...volunteerForm, experience: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="volunteer-availability">Availability</Label>
                    <Textarea
                      id="volunteer-availability"
                      placeholder="When are you typically available? (days, times, frequency)"
                      value={volunteerForm.availability}
                      onChange={(e) => setVolunteerForm({...volunteerForm, availability: e.target.value})}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Interest'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Major Gifts & Partnerships */}
      <section className="py-24 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Major Gifts & <span className="text-yellow-400">Corporate Partnerships</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Ready to make a transformational impact? We welcome conversations about 
                major gifts, corporate sponsorships, and strategic partnerships that can 
                help us expand our reach and deepen our impact in the community.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Handshake className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2">Corporate Sponsorships</h3>
                    <p className="text-blue-100">Partner with us to sponsor specific programs, events, or equipment purchases.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2">Planned Giving</h3>
                    <p className="text-blue-100">Leave a lasting legacy through estate planning and planned giving options.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-2">Major Donations</h3>
                    <p className="text-blue-100">Large individual gifts that can fund entire programs or facilities.</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Let's Talk</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <a href="mailto:teamup4smi@gmail.com" className="text-yellow-400 hover:text-yellow-300">
                        teamup4smi@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <p className="font-semibold">Phone</p>
                      <a href="tel:5862448492" className="text-yellow-400 hover:text-yellow-300">
                        586-244-8492
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <p className="font-semibold">Mailing Address</p>
                      <p className="text-blue-100">
                        PO Box 480012<br />
                        New Haven, MI 48048
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm text-blue-100 text-center">
                    All major gift discussions are handled personally by our founder, 
                    Wendy Anderson, to ensure your philanthropic goals align perfectly 
                    with our mission.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}