import React, { useState, useEffect } from 'react';
import { GalleryItem } from '@/api/entities';
import { Heart, ArrowRight, Play, User, X, Camera, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VideoEmbed, { getVideoThumbnail } from '@/components/gallery/VideoEmbed';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/index';

export default function Homepage() {
  const [featuredGallery, setFeaturedGallery] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  const heroSlides = [
    {
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/da49ace2d_Screenshot2025-08-24at92653AM.png",
      title: "Rewrite Their Story on Film",
      subtitle: "for Underserved Youth in Metro Detroit"
    },
    {
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89dc3e318_Screenshot2025-08-24at92302AM.png",
      title: "From Street to Studio",
      subtitle: "Empowering Youth Through Media Arts"
    },
    {
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0b7884580_Screenshot2025-08-24at92947AM.png",
      title: "Building Futures, One Frame at a Time",
      subtitle: "A Community That Invests in Potential"
    }
  ];

  const impactPillars = [
    {
      icon: Target,
      title: "Inspire",
      description: "Ignite creativity and potential in youth facing socioeconomic barriers, providing a path away from trauma and street violence.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Camera,
      title: "Create", 
      description: "Provide professional equipment, mentorship, and technical training in film, media, and performing arts, fostering real-world skills.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Celebrate",
      description: "Showcase their powerful stories, building confidence, community connections, and a portfolio for their future.",
      color: "from-yellow-500 to-yellow-600"
    }
  ];

  useEffect(() => {
    loadFeaturedGallery();
  }, []);

  // Auto-play for hero slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const loadFeaturedGallery = async () => {
    try {
      const items = await GalleryItem.filter({ is_featured: true }, 'display_order', 6);
      setFeaturedGallery(items);
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const getDisplayImage = (item) => {
    if (item.is_external_url && item.media_type === 'video') {
      const thumbnail = getVideoThumbnail(item.media_url);
      return thumbnail?.thumbnail || item.media_url;
    }
    return item.media_url;
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Slides container */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0'
            }`}
          >
            {/* Background Image and Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
            </div>

            {/* Slide Content */}
            <div className="relative h-full flex items-center justify-center">
              <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
                <div
                  className={`transition-all duration-1000 ease-in-out ${
                    index === currentHeroSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                    <br />
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                      {slide.subtitle}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
                    Team UP4S is a 501(c)(3) nonprofit diverting at-risk youth from street violence and trauma through professional training in film, media, and performing arts. Your gift provides a creative outlet and a path to a brighter future.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Button
                      onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-2xl"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Make Tax-Deductible Gift
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-gray-900 px-10 py-4 rounded-full text-lg font-semibold"
                    >
                      <Link to={createPageUrl("About")}>
                        Learn Our Story
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentHeroSlide ? 'bg-white scale-125' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Impact Pillars */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How We Create <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tomorrow's Voices</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Through our unique three-pillar approach, we empower disadvantaged youth in Metro Detroit by giving them the professional tools and expert guidance to tell their stories and build their futures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {impactPillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="group text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-24 h-24 mx-auto mb-8 bg-gradient-to-r ${pillar.color} rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg flex items-center justify-center`}>
                  <pillar.icon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gallery Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Dreams Made <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Real</span>
              </h2>
              <p className="text-xl text-gray-600">
                See the incredible films and art created by the amazing kids we serve.
              </p>
            </div>
            <Button asChild variant="outline" className="flex items-center gap-2 px-6 py-3">
              <Link to={createPageUrl("Gallery")}>
                View All Stories <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {featuredGallery.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Featured Stories Coming Soon</h3>
              <p className="text-gray-600">
                Amazing stories from our youth will be featured here as they create their films.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGallery.slice(0, 6).map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={getDisplayImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-gray-900 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    {item.child_name && (
                      <p className="text-sm text-gray-200 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Created by {item.child_name}, age {item.child_age}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-12 opacity-90 leading-relaxed">
            Your support doesn't just fund equipment; it provides a safe space, critical skills, and a new direction for youth in our community. Help us divert young people from the streets and into the studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('openDonationModal'))}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4 rounded-full text-lg font-semibold transform hover:scale-105 transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2" />
              Donate Today
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 rounded-full text-lg font-semibold"
            >
              <Link to={createPageUrl("ReferKid")}>
                Refer a Child
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Gallery Items */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-y-auto">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="aspect-video relative bg-black">
                {selectedItem.media_type === 'video' ? (
                  selectedItem.is_external_url ? (
                    <VideoEmbed 
                      url={selectedItem.media_url}
                      title={selectedItem.title}
                    />
                  ) : (
                    <video 
                      src={selectedItem.media_url}
                      controls
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                  )
                ) : (
                  <img 
                    src={selectedItem.media_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  {selectedItem.category && (
                    <Badge className="bg-purple-100 text-purple-800">
                      {selectedItem.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  )}
                  {selectedItem.media_type && (
                    <Badge variant="outline">
                      {selectedItem.media_type.charAt(0).toUpperCase() + selectedItem.media_type.slice(1)}
                    </Badge>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedItem.title}
                </h2>
                
                {selectedItem.child_name && (
                  <div className="flex items-center gap-3 mb-4 text-gray-600">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedItem.child_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Created by {selectedItem.child_name}</p>
                      <p className="text-sm">Age {selectedItem.child_age}</p>
                    </div>
                  </div>
                )}
                
                {selectedItem.description && (
                  <p className="text-gray-700 leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}