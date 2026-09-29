import React, { useState, useEffect } from 'react';
import { GalleryItem, FundraisingEvent } from '@/api/entities';
import { Heart, ArrowRight, Camera, Users, Target, ShieldCheck, MapPin, Clapperboard, HandHeart, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MediaLightbox } from '@/components/gallery/MediaCard';
import StoryCarousel from '@/components/gallery/StoryCarousel';
import { Container, Section, SectionHeading, CtaBand, Accent, Eyebrow, ctaClass } from '@/components/site/ui';
import Reveal from '@/components/site/Reveal';
import SmartImage from '@/components/ui/smart-image';
import { formatCurrency } from '@/lib/utils';
import { donateToEvent, eventPath } from '@/lib/events';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/index';
import CountUp from '@/components/site/CountUp';

export default function Homepage() {
  const [featuredGallery, setFeaturedGallery] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState(null);

  const heroSlides = [
    {
      image: "/hero/drumline.jpg",
      position: "center 30%",
      title: "Rewrite Their Story",
      subtitle: "Through Film & Media Arts",
      description: "Empowering disadvantaged youth in Metro Detroit with professional filmmaking tools and mentorship."
    },
    {
      image: "/hero/kids-group.jpg",
      position: "center 35%",
      title: "From Street to Studio",
      subtitle: "Building Brighter Futures",
      description: "Providing a creative outlet and path away from trauma through professional media training."
    },
    {
      image: "/hero/brunch-smile.jpg",
      position: "45% 35%",
      title: "Every Voice Matters",
      subtitle: "Every Story Counts",
      description: "Helping young people tell their stories and build confidence through creative expression."
    }
  ];

  const impactStats = [
    { number: "150+", label: "Youth served" },
    { number: "75+", label: "Films created" },
    { number: "500+", label: "Families impacted" },
    { number: "2019", label: "Serving Detroit since" }
  ];

  const impactPillars = [
    {
      icon: Target,
      title: "Inspire",
      description: "Ignite creativity and potential in youth facing socioeconomic barriers, providing hope and direction."
    },
    {
      icon: Clapperboard,
      title: "Create", 
      description: "Provide professional equipment, mentorship, and technical training in film and media arts."
    },
    {
      icon: Users,
      title: "Celebrate",
      description: "Showcase their powerful stories, building confidence and community connections."
    }
  ];

  useEffect(() => {
    loadFeaturedGallery();
    // The next active event, for the "Coming up" strip. Optional: hidden on failure.
    FundraisingEvent.list('event_date', 50)
      .then((events) => {
        const now = new Date();
        setNextEvent(events.find((e) => e.is_active && e.event_date && new Date(e.event_date) >= now) ?? null);
      })
      .catch(() => setNextEvent(null));
  }, []);

  // Auto-play for hero slideshow: paused while hovered/focused, off for reduced motion
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (isHeroPaused || reduceMotion) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [heroSlides.length, isHeroPaused]);

  const loadFeaturedGallery = async () => {
    setIsLoading(true);
    try {
      // Featured stories lead the carousel, then the rest of the gallery keeps it fresh.
      const items = await GalleryItem.list('display_order', 60);
      const ordered = [...items].sort((a, b) =>
        Number(b.is_featured) - Number(a.is_featured) ||
        (a.display_order ?? 0) - (b.display_order ?? 0) ||
        new Date(b.created_date) - new Date(a.created_date));
      setFeaturedGallery(ordered.slice(0, 12));
    } catch (error) {
      console.error('Error loading gallery:', error);
      setFeaturedGallery([]);
    }
    setIsLoading(false);
  };

  const openDonate = () => window.dispatchEvent(new CustomEvent('openDonationModal'));

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section
        className="relative isolate flex min-h-[36rem] h-[calc(100svh-5rem)] max-h-[56rem] items-end overflow-hidden bg-gray-950"
        aria-roledescription="carousel"
        aria-label="Highlights"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onFocus={() => setIsHeroPaused(true)}
        onBlur={() => setIsHeroPaused(false)}
      >
        {heroSlides.map((slide, index) => {
          const active = index === currentHeroSlide;
          return (
            <div
              key={index}
              aria-hidden={!active}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active ? 'z-10 opacity-100' : 'opacity-0'}`}
            >
              <div
                className={`absolute inset-0 bg-cover transition-transform duration-[7000ms] ease-out motion-reduce:transition-none ${active ? 'scale-105' : 'scale-100'}`}
                style={{ backgroundImage: `url(${slide.image})`, backgroundPosition: slide.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/55 to-gray-950/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 via-gray-950/20 to-transparent" />

              <Container className="relative flex h-full items-end pb-24 sm:pb-28">
                <div
                  className={`max-w-4xl transition-all duration-1000 ease-out ${active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                  <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" aria-hidden="true" />
                    501(c)(3) nonprofit · Metro Detroit
                  </p>
                  <h1 className="font-display text-display-2xl font-extrabold text-white">
                    {slide.title}
                    <span className="accent mt-1 block text-yellow-400">{slide.subtitle}</span>
                  </h1>
                  <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-gray-200 sm:text-xl">
                    {slide.description}
                  </p>
                  <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={openDonate} tabIndex={active ? 0 : -1} className={ctaClass('primary', 'lg')}>
                      <Heart className="h-5 w-5" aria-hidden="true" />
                      Make a tax-deductible gift
                    </button>
                    <Link to={createPageUrl("About")} tabIndex={active ? 0 : -1} className={ctaClass('ghostLight', 'lg')}>
                      Learn our story
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </Container>
            </div>
          );
        })}

        {/* Subtle film grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[15] opacity-[0.14] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />

        {/* Slide indicators */}
        <Container className="absolute inset-x-0 bottom-8 z-20 flex gap-2">
          {heroSlides.map((slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentHeroSlide(index)}
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              aria-current={index === currentHeroSlide}
              className="group py-2 focus-visible:outline-none"
            >
              <span className={`relative block h-1 overflow-hidden rounded-full bg-white/35 transition-all duration-500 group-hover:bg-white/60 group-focus-visible:ring-2 group-focus-visible:ring-white ${
                index === currentHeroSlide ? 'w-12' : 'w-5'
              }`}>
                {index === currentHeroSlide && (
                  // Fills over the 6s the slide is shown; pauses with the slideshow.
                  <span
                    key={currentHeroSlide}
                    className="absolute inset-0 origin-left rounded-full bg-white"
                    style={{ animation: 'hero-progress 6s linear forwards', animationPlayState: isHeroPaused ? 'paused' : 'running' }}
                  />
                )}
              </span>
            </button>
          ))}
        </Container>
      </section>

      {/* Impact stats */}
      <div className="relative z-20 border-b border-gray-100 bg-white">
        <Container>
          <dl className="grid grid-cols-2 divide-gray-100 lg:grid-cols-4 lg:divide-x">
            {impactStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col px-4 py-10 text-center sm:py-12 ${index < 2 ? 'border-b border-gray-100 lg:border-b-0' : ''} ${index % 2 === 0 ? 'border-r border-gray-100 lg:border-r-0' : ''}`}
              >
                <dt className="order-2 mt-2 text-sm font-medium text-gray-500">{stat.label}</dt>
                <dd className="order-1 font-display text-5xl font-extrabold tracking-[-0.025em] text-gray-900 tabular-nums sm:text-6xl"><CountUp value={stat.number} from={/^\d{4}$/.test(stat.number) ? 2000 : 0} delay={index * 120} /></dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* Next event */}
      {nextEvent && (() => {
        const goal = Number(nextEvent.fundraising_goal) || 0;
        const raised = Number(nextEvent.amount_raised) || 0;
        return (
          <div className="bg-white">
            <Container className="py-6 sm:py-8">
              <Reveal className="relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl bg-gray-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:gap-6 sm:px-7">
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(30rem_12rem_at_0%_50%,rgba(37,99,235,0.45),transparent_70%)]" />
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-yellow-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-950 sm:self-center">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" aria-hidden="true" /> Coming up
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={eventPath(nextEvent)} className="block rounded font-display text-lg font-bold tracking-tight after:absolute after:inset-0 after:content-[''] hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:truncate sm:text-xl" title={nextEvent.title}>{nextEvent.title}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-400">
                    <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden="true" />{format(new Date(nextEvent.event_date), 'EEEE, MMMM d')}</span>
                    {nextEvent.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{nextEvent.location}</span>}
                    {goal > 0 && <span className="tabular-nums text-gray-300">{formatCurrency(raised)} raised of {formatCurrency(goal)}</span>}
                  </p>
                </div>
                <div className="relative z-10 flex shrink-0 gap-2">
                  <button type="button" onClick={() => donateToEvent(nextEvent)} className={ctaClass('light', 'sm')}>
                    <Heart className="h-4 w-4 text-blue-600" aria-hidden="true" /> Support this event
                  </button>
                  <Link to={eventPath(nextEvent)} className={ctaClass('ghostLight', 'sm')}>Details</Link>
                </div>
              </Reveal>
            </Container>
          </div>
        );
      })()}

      {/* Approach */}
      <Section tone="muted">
        <Container>
          <SectionHeading
            eyebrow="Our approach"
            title={<>How we create <Accent>tomorrow’s voices</Accent></>}
            lede="A three-part approach that gives young people in Metro Detroit professional tools, expert guidance and a stage for the stories only they can tell."
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {impactPillars.map((pillar, index) => (
              <Reveal
                key={pillar.title}
                delay={index * 110}
                className="group relative rounded-2xl border border-gray-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow duration-300 hover:shadow-lg hover:shadow-gray-900/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <pillar.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="font-display text-sm font-semibold tabular-nums text-gray-300">0{index + 1}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold tracking-tight text-gray-900">{pillar.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-600">{pillar.description}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Our story */}
      <Section tone="dark" className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_30rem_at_90%_20%,rgba(37,99,235,0.35),transparent_70%)]" />
        <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-900 ring-1 ring-white/10">
              <SmartImage src="/hero/brunch-smile.jpg" alt="A smiling young person at a Team UP4S event" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '45% 35%' }} />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 left-5 rounded-2xl bg-yellow-400 px-5 py-3 text-gray-950 shadow-xl sm:-right-5 sm:left-auto">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em]">A dream since</p>
              <p className="font-display text-3xl font-extrabold leading-none tracking-tight">1999</p>
            </div>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <Eyebrow tone="dark">Our story</Eyebrow>
            <h2 className="mt-4 font-display text-display-lg font-bold text-white">
              Unlimited potential, <Accent tone="gold">for every kid in Metro Detroit</Accent>
            </h2>
            <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-gray-300">
              <p>
                In 1999, Shannon Anderson dreamed of a place called &ldquo;Unlimited Potential 4 Success.&rdquo;
                Today, his wife, founder Wendy Anderson, has brought that vision to life.
              </p>
              <p>
                Team UP4S gives young people facing street violence, drug use and trauma professional training in
                film, media and the performing arts, so they can find their voice, build their future and tell their story.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 font-display font-bold text-white ring-1 ring-white/15">WA</span>
                <div className="text-sm">
                  <p className="font-semibold text-white">Wendy Anderson</p>
                  <p className="text-gray-400">Founder &amp; CEO</p>
                </div>
              </div>
              <Link to={createPageUrl('About')} className={ctaClass('ghostLight', 'md')}>
                Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Featured gallery */}
      <Section>
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Success stories"
            title={<>Dreams made <Accent>real</Accent></>}
            lede="Films, photos and art created by the amazing kids we serve."
            action={
              <Link to={createPageUrl("Gallery")} className={ctaClass('secondary', 'md')}>
                View all stories <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />

          {isLoading ? (
            <div className="flex gap-5 overflow-hidden py-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="w-[82%] shrink-0 animate-pulse overflow-hidden rounded-2xl border border-gray-200/80 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]">
                  <div className="aspect-[4/3] bg-gray-100" />
                  <div className="space-y-2 px-4 py-4">
                    <div className="h-4 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredGallery.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Camera className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </span>
              <h3 className="font-semibold text-gray-900">Featured stories coming soon</h3>
              <p className="mt-1 text-gray-600">Stories from our youth will be featured here as they create their films.</p>
            </div>
          ) : (
            <StoryCarousel items={featuredGallery} onOpen={setSelectedItem} paused={!!selectedItem} label="Dreams made real: stories from our youth" />
          )}
        </Container>
      </Section>

      {/* Ways to help */}
      <CtaBand
        eyebrow="Make a difference today"
        title={<>Three ways to <Accent tone="gold">change a life</Accent></>}
        lede="Your support doesn’t just fund equipment. It provides a safe space, real skills and a new direction, moving young people from the streets and into the studio."
        childrenClassName="mx-auto grid max-w-5xl grid-cols-1 gap-4 text-left sm:grid-cols-3 sm:flex-none"
        footer={<>
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secure checkout by Stripe</span>
          <span className="flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /> 501(c)(3) · EIN 92-2415944</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" /> Serving Metro Detroit</span>
        </>}
      >
        {[
          { icon: Heart, title: 'Give', text: 'A tax-deductible gift puts cameras, mentors and studio time in young hands.', cta: 'Donate now', onClick: openDonate },
          { icon: Users, title: 'Refer a kid', text: 'Know a young person whose story deserves to be told? We’ll reach out within 48 hours.', cta: 'Make a referral', to: createPageUrl('ReferKid') },
          { icon: HandHeart, title: 'Volunteer', text: 'Mentor on set, help at events or lend your skills behind the scenes.', cta: 'Get involved', to: `${createPageUrl('Fundraising')}#volunteer-section` },
        ].map(({ icon: Icon, title, text, cta, onClick, to }, index) => {
          const cardClass = 'group flex h-full flex-col rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/[0.12] hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';
          const body = (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-yellow-300 ring-1 ring-white/15">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-100">{text}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-white">
                {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </>
          );
          return (
            <Reveal key={title} delay={index * 110} className="h-full">
              {onClick
                ? <button type="button" onClick={onClick} className={`${cardClass} w-full text-left`}>{body}</button>
                : <Link to={to} className={cardClass}>{body}</Link>}
            </Reveal>
          );
        })}
      </CtaBand>

      <MediaLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
