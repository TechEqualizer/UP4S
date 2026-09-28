import React, { useState, useEffect } from 'react';
import { FundraisingEvent } from '@/api/entities';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Users, Handshake, Mail, Phone, MapPin, Heart, Calendar, Clapperboard, Landmark, Gift, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import SmartImage from '@/components/ui/smart-image';
import { formatCurrency } from '@/lib/utils';
import { Container, Section, SectionHeading, PageHeader, Eyebrow, Surface, ctaClass } from '@/components/site/ui';

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
    
    toast.success('Thanks for offering to help!', { description: 'We’ll be in touch soon.' });
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

  const openDonate = () => window.dispatchEvent(new CustomEvent('openDonationModal'));
  const updateForm = (field) => (e) => setVolunteerForm({ ...volunteerForm, [field]: e.target.value });

  const opportunities = [
    { icon: Clapperboard, title: "Film & media mentorship", description: "Guide students through the filmmaking process, from concept to final cut." },
    { icon: Users, title: "Event support", description: "Help with fundraising events, film screenings and community gatherings." },
    { icon: Handshake, title: "Administrative support", description: "Assist with marketing, social media, grant writing and daily operations." },
  ];

  const givingOptions = [
    { icon: Handshake, title: "Corporate sponsorships", description: "Sponsor specific programs, events or equipment purchases." },
    { icon: Landmark, title: "Planned giving", description: "Leave a lasting legacy through estate planning and planned giving." },
    { icon: Gift, title: "Major donations", description: "Large individual gifts that can fund entire programs or facilities." },
  ];

  const contact = [
    { icon: Mail, label: "Email", value: "teamup4smi@gmail.com", href: "mailto:teamup4smi@gmail.com" },
    { icon: Phone, label: "Phone", value: "586-244-8492", href: "tel:5862448492" },
    { icon: MapPin, label: "Mailing address", value: <>PO Box 480012<br />New Haven, MI 48048</> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="Support us"
        title="Help a young creator tell their story"
        lede="Give to a specific initiative, volunteer your skills, or partner with us to expand what's possible for youth in Metro Detroit."
      >
        <button type="button" onClick={openDonate} className={ctaClass('primary', 'lg')}>
          <Heart className="h-5 w-5" aria-hidden="true" /> Give now
        </button>
        <a href="#volunteer-section" className={ctaClass('secondary', 'lg')}>Volunteer with us</a>
      </PageHeader>

      {/* Fundraising events */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Current initiatives"
            title="Fundraising events"
            lede="Support initiatives that directly impact the youth we serve. Every dollar brings us closer to our goals."
          />

          {isLoadingEvents ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200/80">
                  <div className="aspect-video bg-gray-100" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-3/4 rounded bg-gray-100" />
                    <div className="h-4 rounded bg-gray-100" />
                    <div className="h-4 w-5/6 rounded bg-gray-100" />
                    <div className="mt-6 h-11 rounded-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${events.length >= 3 ? 'lg:grid-cols-3' : 'mx-auto max-w-5xl'}`}>
              {events.map((event) => {
                const goal = Number(event.fundraising_goal) || 0;
                const raised = Number(event.amount_raised) || 0;
                const progressPercentage = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
                const isPast = event.event_date && new Date(event.event_date) < new Date();
                const isExpanded = expandedEvents.has(event.id);
                const isLong = (event.description || '').length > 220;
                return (
                  <Surface as="article" key={event.id} className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-gray-900/[0.06]">
                    {event.image_url && (
                      <div className="relative aspect-video overflow-hidden bg-gray-100">
                        <SmartImage src={event.image_url} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />
                        {isPast && (
                          <span className="absolute left-3 top-3 rounded-full bg-gray-950/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">Past event</span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        {event.event_date && (
                          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" /> {format(new Date(event.event_date), 'EEE, MMM d, yyyy')}</span>
                        )}
                        {event.location && (
                          <span className="flex min-w-0 items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /> <span className="truncate">{event.location}</span></span>
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-gray-900">{event.title}</h3>
                      <div className="mt-3 flex-1">
                        <p className={`whitespace-pre-line leading-relaxed text-gray-600 ${isLong && !isExpanded ? 'line-clamp-4' : ''}`}>
                          {event.description}
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleEvent(event.id)}
                            aria-expanded={isExpanded}
                            className="mt-2 rounded text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>

                      <div className="mt-6 rounded-xl bg-gray-50 p-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-display text-2xl font-bold tabular-nums tracking-tight text-gray-900">{formatCurrency(raised)}</span>
                          <span className="text-sm text-gray-500">{goal > 0 ? `of ${formatCurrency(goal)} goal` : 'raised'}</span>
                        </div>
                        {goal > 0 && (
                          <>
                            <Progress value={progressPercentage} className="mt-3 h-2" />
                            <p className="mt-2 text-xs font-medium text-gray-500">{progressPercentage.toFixed(0)}% of goal reached</p>
                          </>
                        )}
                      </div>

                      {isPast ? (
                        <button type="button" onClick={openDonate} className={ctaClass('secondary', 'md', 'mt-5 w-full')}>
                          <Heart className="h-4 w-4" aria-hidden="true" /> Donate to UP4S
                        </button>
                      ) : (
                        <button type="button" onClick={() => handleEventDonate(event)} className={ctaClass('primary', 'md', 'mt-5 w-full shadow-md')}>
                          <Heart className="h-4 w-4" aria-hidden="true" /> Support this event
                        </button>
                      )}
                    </div>
                  </Surface>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Target className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-gray-900">No active events right now</h3>
              <p className="mt-1 text-gray-600">New fundraising events will appear here as they launch. You can still give to our general fund.</p>
              <button type="button" onClick={openDonate} className={ctaClass('primary', 'md', 'mt-6')}>
                <Heart className="h-4 w-4" aria-hidden="true" /> Donate
              </button>
            </div>
          )}
        </Container>
      </Section>

      {/* Volunteer */}
      <Section tone="muted" id="volunteer-section" className="scroll-mt-20">
        <Container>
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                align="left"
                className="mb-10"
                eyebrow="Get involved"
                title="Volunteer with us"
                lede="Share your skills, time and passion to directly impact young lives. Filmmaker, mentor or simply someone who cares, there's a place for you."
              />
              <ul className="space-y-7">
                {opportunities.map((opportunity) => (
                  <li key={opportunity.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/80">
                      <opportunity.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
                      <p className="mt-1 leading-relaxed text-gray-600">{opportunity.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Surface className="p-6 shadow-xl shadow-gray-900/[0.04] sm:p-8">
              <h3 className="font-display text-xl font-semibold text-gray-900">Express your interest</h3>
              <p className="mt-1 text-gray-600">Tell us how you&apos;d like to get involved with UP4S.</p>
              <form onSubmit={handleVolunteerSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="volunteer-name">Name <span className="text-red-600" aria-hidden="true">*</span></Label>
                    <Input id="volunteer-name" required autoComplete="name" className="h-11" value={volunteerForm.name} onChange={updateForm('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volunteer-email">Email <span className="text-red-600" aria-hidden="true">*</span></Label>
                    <Input id="volunteer-email" type="email" required autoComplete="email" className="h-11" value={volunteerForm.email} onChange={updateForm('email')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-phone">Phone</Label>
                  <Input id="volunteer-phone" type="tel" autoComplete="tel" className="h-11" value={volunteerForm.phone} onChange={updateForm('phone')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-interests">Area of interest</Label>
                  <Select
                    value={volunteerForm.interests}
                    onValueChange={(value) => setVolunteerForm({ ...volunteerForm, interests: value })}
                  >
                    <SelectTrigger id="volunteer-interests" className="h-11">
                      <SelectValue placeholder="Select your primary interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentorship">Film &amp; media mentorship</SelectItem>
                      <SelectItem value="events">Event support</SelectItem>
                      <SelectItem value="admin">Administrative support</SelectItem>
                      <SelectItem value="fundraising">Fundraising</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-experience">Relevant experience</Label>
                  <Textarea
                    id="volunteer-experience"
                    rows={3}
                    placeholder="Tell us about your background and skills"
                    value={volunteerForm.experience}
                    onChange={updateForm('experience')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteer-availability">Availability</Label>
                  <Textarea
                    id="volunteer-availability"
                    rows={2}
                    placeholder="Days, times and how often you're available"
                    value={volunteerForm.availability}
                    onChange={updateForm('availability')}
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className={ctaClass('primary', 'lg', 'w-full')}>
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Submitting…</> : 'Submit interest'}
                </button>
              </form>
            </Surface>
          </div>
        </Container>
      </Section>

      {/* Major gifts & partnerships */}
      <Section tone="dark" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_85%_10%,rgba(37,99,235,0.35),transparent_70%)]" />
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                align="left"
                tone="dark"
                className="mb-10"
                eyebrow="Major gifts"
                title="Corporate partnerships & major gifts"
                lede="Ready to make a transformational impact? We welcome conversations about major gifts, sponsorships and strategic partnerships that expand our reach in the community."
              />
              <ul className="space-y-6">
                {givingOptions.map((option) => (
                  <li key={option.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-yellow-400 ring-1 ring-white/10">
                      <option.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{option.title}</h3>
                      <p className="mt-1 text-gray-400">{option.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur sm:p-10">
              <Eyebrow tone="dark">Let&apos;s talk</Eyebrow>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">Start a conversation</h3>
              <ul className="mt-8 space-y-5">
                {contact.map((item) => (
                  <li key={item.label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-gray-950">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-400">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="break-all font-medium text-white hover:text-yellow-300">{item.value}</a>
                      ) : (
                        <p className="font-medium text-white">{item.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-white/10 pt-6 text-sm leading-relaxed text-gray-400">
                Major gift discussions are handled personally by our founder, Wendy Anderson, so your philanthropic goals align with our mission.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
