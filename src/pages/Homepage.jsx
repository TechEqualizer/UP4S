import React, { useState, useEffect } from 'react';
import { GalleryItem } from '@/api/entities';
import { Heart, ArrowRight, Camera, Users, Target, ShieldCheck, MapPin, Clapperboard } from 'lucide-react';
import { MediaCard, MediaLightbox } from '@/components/gallery/MediaCard';
import { Container, Section, SectionHeading, CtaBand, Accent, ctaClass } from '@/components/site/ui';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/index';
import CountUp from '@/components/site/CountUp';

export default function Homepage() {
  const [featuredGallery, setFeaturedGallery] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const items = await GalleryItem.filter({ is_featured: true }, 'display_order', 6);
      setFeaturedGallery(items);
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
              <span className={`block h-1 rounded-full transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-white ${
                index === currentHeroSlide ? 'w-10 bg-white' : 'w-5 bg-white/35 group-hover:bg-white/60'
              }`} />
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
              <div
                key={pillar.title}
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
              </div>
            ))}
          </div>
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200/80">
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredGallery.slice(0, 6).map((item, index) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onOpen={setSelectedItem}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* Call to action */}
      <CtaBand
        eyebrow="Make a difference today"
        title={<>Ready to change <Accent tone="gold">a life?</Accent></>}
        lede="Your support doesn’t just fund equipment. It provides a safe space, real skills and a new direction, moving young people from the streets and into the studio."
        footer={<>
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secure checkout by Stripe</span>
          <span className="flex items-center gap-2"><Users className="h-4 w-4" aria-hidden="true" /> 501(c)(3) · EIN 92-2415944</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" /> Serving Metro Detroit</span>
        </>}
      >
        <button type="button" onClick={openDonate} className={ctaClass('light', 'lg')}>
          <Heart className="h-5 w-5 text-blue-600" aria-hidden="true" />
          Donate today
        </button>
        <Link to={createPageUrl("ReferKid")} className={ctaClass('ghostLight', 'lg')}>
          Refer a child
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </CtaBand>

      <MediaLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
