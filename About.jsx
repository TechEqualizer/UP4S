
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Camera, Users, Star, Award, Target, Tv, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function About() {
  const stats = [
  { number: "150+", label: "Wishes Granted", icon: Star },
  { number: "500+", label: "Families Served", icon: Users },
  { number: "75+", label: "Volunteer Mentors", icon: Heart },
  { number: "2019", label: "Founded", icon: Award }];


  const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description: "Every interaction is guided by empathy and understanding for the families we serve.",
    color: "from-red-500 to-red-600"
  },
  {
    icon: Camera,
    title: "Creative Excellence",
    description: "We provide professional-grade equipment and mentorship to ensure high-quality results.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Users,
    title: "Family-Centered",
    description: "We work closely with families to ensure each wish reflects the child's unique vision.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Target,
    title: "Lasting Impact",
    description: "Our goal is creating meaningful memories that inspire hope and healing.",
    color: "from-green-500 to-green-600"
  }];


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-blue-600 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1920&h=1080&fit=crop"
            alt="Background"
            className="w-full h-full object-cover" />

        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Unlimited Potential 4 Success
                <span className="block text-white">
                  Founded on a Dream, Built for Our Community
                </span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">In 1999, Shannon Anderson dreamed of a place called "Unlimited Potential 4 Success." Today, his wife, founder Wendy Anderson, has brought that vision to life. Team UP4S is a 501(c)(3) nonprofit dedicated to diverting disadvantaged youth in Metro Detroit from street violence, drug use, and trauma. We provide professional training in film, media, and performing arts, empowering them to find their voice, build their future, and tell their story.
              </p>
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 px-8 py-3 text-lg font-semibold">

                Support Our Mission
              </Button>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/cc6b4c44b_Screenshot2025-08-24at92111AM.png"
                alt="Wendy Anderson with her family"
                className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl" />

              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">Wendy Anderson</p>
                  <p className="text-sm sm:text-base text-gray-600">Founder & CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) =>
            <div
              key={stat.label}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}>

                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Why We Do <span className="gradient-text">What We Do</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">When a child faces poverty, trauma, or systemic barriers, their world can feel hopeless. We believe in the transformative power of creativity. By providing professional skills and a supportive, inclusive community, we help underserved youth process their experiences, discover their potential, and build a foundation for a successful future.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The UP4S Difference</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Professional Equipment & Training</h4>
                    <p className="text-gray-600">We provide cinema-quality cameras, editing software, and hands-on technical skills training.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Inclusive Mentorship</h4>
                    <p className="text-gray-600">Our team includes an editor/director with autism, creating a uniquely supportive environment for both neurotypical and autistic youth to collaborate and thrive.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Comprehensive Support</h4>
                    <p className="text-gray-600">We partner with families and provide referrals for mental health services to ensure holistic well-being.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f4939dbd3_Screenshot2025-08-24at92510AM.png"
                alt="Children at a Team UP4S event"
                className="w-full rounded-2xl shadow-2xl" />

              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <p className="text-lg font-bold">Every child deserves to</p>
                <p className="text-lg font-bold">tell their story</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              What Drives <span className="gradient-text">Our Work</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide every decision we make and every wish we grant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) =>
            <div
              key={value.title}
              className="text-center group transition-transform duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}>

                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg`}>
                  <value.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our Vision for the <span className="gradient-text">Future</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are actively expanding our impact through major projects and community investment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 border">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Brick-and-Mortar Studio</h3>
              <p className="text-gray-600">Our ultimate goal is to establish a permanent studio facility in New Haven, a safe, creative hub for the youth of Metro Detroit to learn, create, and grow.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 border">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Tv className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Major Media Partnerships</h3>
              <p className="text-gray-600">We are in negotiations with major media platforms for a groundbreaking project focused on the stories of juvenile "lifers," bringing their powerful narratives to a national audience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Invest in Our Community's Youth?
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Your support helps us provide professional skills, mentorship, and a safe alternative to the streets. Join us in empowering the next generation of creators and leaders in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4 text-lg font-semibold">

              <Heart className="w-5 h-5 mr-2" />
              Make a Donation
            </Button>
          </div>
        </div>
      </section>
    </div>);

}