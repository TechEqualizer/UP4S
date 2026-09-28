
import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SmartImage from '@/components/ui/smart-image';
import VideoEmbed, { getVideoThumbnail } from '@/components/gallery/VideoEmbed';
import { Play, Heart, User, X } from 'lucide-react';

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGalleryItems = async () => {
      setIsLoading(true);
      try {
        // Admin-set display_order first, newest first within the same position
        const items = (await GalleryItem.list('display_order', 500)).sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0) ||
            new Date(b.created_date) - new Date(a.created_date)
        );
        setGalleryItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error loading gallery:', error);
      }
      setIsLoading(false);
    };

    loadGalleryItems();
  }, []);

  useEffect(() => {
    // This effect will run whenever the category filter changes
    if (selectedCategory === 'all') {
      setFilteredItems(galleryItems);
    } else {
      setFilteredItems(galleryItems.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, galleryItems]);

  const categories = [
    { value: 'all', label: 'All', count: galleryItems.length },
    { value: 'wishes-granted', label: 'Wishes', count: galleryItems.filter(i => i.category === 'wishes-granted').length },
    { value: 'events', label: 'Events', count: galleryItems.filter(i => i.category === 'events').length },
    { value: 'behind-scenes', label: 'Behind the Scenes', count: galleryItems.filter(i => i.category === 'behind-scenes').length }
  ];

  const categoryLabel = (value) =>
    categories.find((c) => c.value === value)?.label ??
    value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const getDisplayImage = (item) => {
    if (item.is_external_url && item.media_type === 'video') {
      const thumbnail = getVideoThumbnail(item.media_url);
      return thumbnail?.thumbnail || item.media_url;
    }
    return item.media_url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Badge className="mb-6 bg-purple-100 text-purple-800">Our Impact</Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Dreams Made <span className="gradient-text">Real</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
            Explore the incredible films, artwork, and creative projects made by the amazing children we serve. 
            Each piece tells a unique story of courage, creativity, and hope.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Public Gallery Grid - Read-Only Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No items found</h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              {selectedCategory === 'all' 
                ? 'Gallery items will appear here as they are added.'
                : `No items in the "${categories.find(c => c.value === selectedCategory)?.label}" category yet.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {filteredItems.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className="group block w-full text-left rounded-2xl animate-fade-in focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/60"
                style={{ animationDelay: `${Math.min(index, 12) * 0.05}s` }}
                onClick={() => setSelectedItem(item)}
                aria-label={`${item.media_type === 'video' ? 'Play' : 'View'}: ${item.title}`}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video relative">
                    <SmartImage
                      src={getDisplayImage(item)}
                      fallbackSrc={item.is_external_url && item.media_type === 'video' ? getVideoThumbnail(item.media_url)?.fallback : undefined}
                      alt=""
                      placeholderIcon={item.media_type === 'video' ? 'video' : 'image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {item.media_type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-1" aria-hidden="true" />
                        </div>
                      </div>
                    )}

                    {item.category && (
                      <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                        {categoryLabel(item.category)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 px-1">
                  <h3 className="font-bold text-base text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                  )}
                  {item.child_name && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" aria-hidden="true" />
                      {item.child_name}{item.child_age ? `, age ${item.child_age}` : ''}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
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
                  <Badge className="bg-purple-100 text-purple-800">
                    {selectedItem.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <Badge variant="outline">
                    {selectedItem.media_type}
                  </Badge>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedItem.title}
                </h2>
                
                {selectedItem.child_name && (
                  <div className="flex items-center gap-3 mb-4 text-gray-600">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedItem.child_name.charAt(0)}
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
