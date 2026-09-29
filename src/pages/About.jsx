import React from 'react';
import SmartImage from '@/components/ui/smart-image';
import { Heart, Camera, Users, Target, Tv, Building, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/index';
import CountUp from '@/components/site/CountUp';
import { Container, Section, SectionHeading, Eyebrow, CtaBand, Surface, Accent, ctaClass } from '@/components/site/ui';

const FOUNDER_PHOTO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cc6b4c44b_Screenshot2025-08-24at92111AM.png";
const EVENT_PHOTO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f4939dbd3_Screenshot2025-08-24at92510AM.png";

const stats = [
  { number: "150+", label: "Wishes granted" },
  { number: "500+", label: "Families served" },
  { number: "75+", label: "Volunteer mentors" },
  { number: "2019", label: "Founded" },
];

const differences = [
  {
    icon: Camera,
    title: "Professional equipment & training",
    description: "Cinema-quality cameras, editing software and hands-on technical skills training.",
  },
  {
    icon: Users,
    title: "Inclusive mentorship",
    description: "Our team includes an editor/director with autism, creating a uniquely supportive environment for neurotypical and autistic youth to collaborate and thrive.",
  },
  {
    icon: Heart,
    title: "Comprehensive support",
    description: "We partner with families and provide referrals for mental health services to support each child's whole well-being.",
  },
];

const values = [
  { icon: Heart, title: "Compassion first", description: "Every interaction is guided by empathy and understanding for the families we serve." },
  { icon: Camera, title: "Creative excellence", description: "Professional-grade equipment and mentorship so every project is something to be proud of." },
  { icon: Users, title: "Family-centered", description: "We work closely with families so each wish reflects the child's unique vision." },
  { icon: Target, title: "Lasting impact", description: "Creating meaningful memories that inspire hope and healing long after the cameras stop." },
];

const vision = [
  {
    icon: Building,
    title: "A brick-and-mortar studio",
    description: "Our ultimate goal is a permanent studio in New Haven: a safe, creative hub for the youth of Metro Detroit to learn, create and grow.",
  },
  {
    icon: Tv,
    title: "Major media partnerships",
    description: "We're in negotiations with major media platforms on a groundbreaking project about juvenile “lifers,” bringing their stories to a national audience.",
  },
];

function IconTile({ icon: Icon }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export default function About() {
  const openDonate = () => window.dispatchEvent(new CustomEvent('openDonationModal'));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-gray-50">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_15%_0%,rgba(37,99,235,0.12),transparent_70%)]" />
        <Container className="grid grid-cols-1 items-center gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow className="mb-4">Unlimited Potential 4 Success</Eyebrow>
            <h1 className="font-display text-display-xl font-bold text-gray-900">
              Founded on a dream, <Accent>built for our community</Accent>
            </h1>
            <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-gray-600">
              <p>
                In 1999, Shannon Anderson dreamed of a place called &ldquo;Unlimited Potential 4 Success.&rdquo;
                Today, his wife, founder Wendy Anderson, has brought that vision to life.
              </p>
              <p>
                Team UP4S is a 501(c)(3) nonprofit diverting disadvantaged youth in Metro Detroit from street
                violence, drug use and trauma, with professional training in film, media and the performing arts
                that helps them find their voice, build their future and tell their story.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={openDonate} className={ctaClass('primary', 'lg')}>
                <Heart className="h-5 w-5" aria-hidden="true" />
                Support our mission
              </button>
              <Link to={createPageUrl("Gallery")} className={ctaClass('secondary', 'lg')}>
                See their work <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <figure className="relative mx-auto max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5">
                <SmartImage src={FOUNDER_PHOTO} alt="Wendy Anderson with her family" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <figcaption className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-gray-200/80 bg-white/95 px-5 py-4 shadow-xl backdrop-blur sm:left-auto sm:right-[-1.25rem] sm:w-64">
                <p className="font-display font-semibold text-gray-900">Wendy Anderson</p>
                <p className="text-sm text-gray-500">Founder &amp; CEO</p>
              </figcaption>
            </figure>
          </div>
        </Container>
      </header>

      {/* Stats */}
      <div className="border-y border-gray-100 bg-white">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gray-100">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col px-4 py-10 text-center ${index < 2 ? 'border-b border-gray-100 lg:border-b-0' : ''} ${index % 2 === 0 ? 'border-r border-gray-100 lg:border-r-0' : ''}`}
              >
                <dt className="order-2 mt-2 text-sm font-medium text-gray-500">{stat.label}</dt>
                <dd className="order-1 font-display text-5xl font-extrabold tracking-[-0.025em] tabular-nums text-gray-900"><CountUp value={stat.number} from={/^\d{4}$/.test(stat.number) ? 2000 : 0} delay={index * 120} /></dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* Mission */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Why we do it"
            title={<>Creativity can change <Accent>a child’s story</Accent></>}
            lede="When a child faces poverty, trauma or systemic barriers, their world can feel hopeless. Professional skills and a supportive, inclusive community help underserved youth process their experiences, discover their potential and build a foundation for a successful future."
          />

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-gray-900">The UP4S difference</h3>
              <ul className="mt-8 space-y-7">
                {differences.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <IconTile icon={item.icon} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="mt-1 leading-relaxed text-gray-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <figure className="relative pb-8 lg:pb-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5">
                <SmartImage src={EVENT_PHOTO} alt="Children at a Team UP4S event" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <blockquote className="absolute -bottom-2 left-4 right-4 rounded-2xl bg-gray-950 px-6 py-5 text-white shadow-xl sm:left-auto sm:right-[-1rem] sm:w-72 lg:-bottom-8">
                <Quote className="mb-2 h-5 w-5 text-yellow-400" aria-hidden="true" />
                <p className="font-serif text-2xl italic leading-snug">Every child deserves to tell their story.</p>
              </blockquote>
            </figure>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section tone="muted">
        <Container>
          <SectionHeading
            eyebrow="Our values"
            title="What drives our work"
            lede="The principles behind every decision we make and every wish we grant."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Surface key={value.title} className="p-7">
                <IconTile icon={value.icon} />
                <h3 className="mt-6 font-display text-lg font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{value.description}</p>
              </Surface>
            ))}
          </div>
        </Container>
      </Section>

      {/* Vision */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Looking ahead"
            title="Our vision for the future"
            lede="We're expanding our impact through major projects and community investment."
          />
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {vision.map((item, index) => (
              <Surface key={item.title} className="relative overflow-hidden p-8 sm:p-10">
                <span aria-hidden="true" className="absolute right-6 top-4 font-display text-7xl font-bold text-gray-100">0{index + 1}</span>
                <div className="relative">
                  <IconTile icon={item.icon} />
                  <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-gray-900">{item.title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{item.description}</p>
                </div>
              </Surface>
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Join us"
        title={<>Invest in our <Accent tone="gold">community’s youth</Accent></>}
        lede="Your support provides professional skills, mentorship and a safe alternative to the streets for the next generation of creators and leaders."
      >
        <button type="button" onClick={openDonate} className={ctaClass('light', 'lg')}>
          <Heart className="h-5 w-5 text-blue-600" aria-hidden="true" />
          Make a donation
        </button>
        <Link to={createPageUrl("ReferKid")} className={ctaClass('ghostLight', 'lg')}>
          Refer a child <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </CtaBand>
    </div>
  );
}
