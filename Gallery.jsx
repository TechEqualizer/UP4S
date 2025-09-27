
import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, User, X } from 'lucide-react';
import VideoEmbed from './components/gallery/VideoEmbed';
import { getVideoThumbnail } from './components/gallery/VideoEmbed'; // Import getVideoThumbnail

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
        // Load items ordered by display_order
        const items = await GalleryItem.list('display_order', 50);
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
    { value: 'behind-scenes', label: 'Behind Scenes', count: galleryItems.filter(i => i.category === 'behind-scenes').length }
  ];

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
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-6 bg-purple-100 text-purple-800">Our Impact</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Dreams Made <span className="gradient-text">Real</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the incredible films, artwork, and creative projects made by the amazing children we serve. 
            Each piece tells a unique story of courage, creativity, and hope.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <TabsList className="bg-gray-100 p-1 min-w-max">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.value} 
                    value={category.value}
                    className="text-sm font-medium px-4 py-2"
                  >
                    {category.label}
                    {category.count > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Public Gallery Grid - Read-Only Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No items found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'Gallery items will appear here as they are added.'
                : `No items in the "${categories.find(c => c.value === selectedCategory)?.label}" category yet.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredItems.map((item, index) => (
              <div 
                key={item.id}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-video relative">
                    <img 
                      src={getDisplayImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback for YouTube thumbnails
                        if (item.is_external_url && item.media_type === 'video') {
                          const thumbnail = getVideoThumbnail(item.media_url);
                          // Only try to set fallback if it's different from current src to avoid infinite loop
                          if (thumbnail?.fallback && e.currentTarget.src !== thumbnail.fallback) {
                            e.currentTarget.src = thumbnail.fallback;
                          }
                        }
                      }}
                    />
                    
                    {item.media_type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Badge className="mb-2 bg-white/20 text-white border-white/30 text-xs">
                      {item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <h3 className="font-bold text-lg mb-1 line-clamp-2">{item.title}</h3>
                    {item.child_name && (
                      <p className="text-sm text-gray-200 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Created by {item.child_name}, age {item.child_age}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Public info display - no management controls */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    {item.child_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {item.child_name.charAt(0)}
                          </span>
                        </div>
                        <span>{item.child_name}, {item.child_age}</span>
                      </div>
                    )}
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {item.media_type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {filteredItems.length > 0 && filteredItems.length % 50 === 0 && (
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              className="px-8 py-3"
              onClick={() => { /* In a real app, this would fetch the next page of items */ }}
            >
              Load More Stories
            </Button>
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
