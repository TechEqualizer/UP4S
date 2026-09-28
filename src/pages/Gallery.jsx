import React, { useState, useEffect } from 'react';
import { GalleryItem } from '@/api/entities';
import { Camera } from 'lucide-react';
import { MediaCard, MediaLightbox } from '@/components/gallery/MediaCard';
import { Container, PageHeader } from '@/components/site/ui';

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

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow="Our impact"
        title="Dreams made real"
        lede="Films, artwork and creative projects made by the children we serve. Each piece tells a story of courage, creativity and hope."
      />

      <Container className="py-12 sm:py-16">
        {/* Filters */}
        <div className="mb-10 flex justify-center">
          <div role="group" aria-label="Filter by category" className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full border border-gray-200/80 bg-gray-50 p-1">
            {categories.map((category) => {
              const active = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.label}
                  <span className={`text-xs tabular-nums ${active ? 'text-blue-600' : 'text-gray-400'}`}>{category.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-200/80">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="space-y-2 px-4 py-4">
                  <div className="h-4 w-3/4 rounded bg-gray-100" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-20 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Camera className="h-6 w-6 text-gray-400" aria-hidden="true" />
            </span>
            <h3 className="font-semibold text-gray-900">Nothing here yet</h3>
            <p className="mt-1 text-gray-600">
              {selectedCategory === 'all'
                ? 'Gallery items will appear here as they are added.'
                : `No items in "${categories.find(c => c.value === selectedCategory)?.label}" yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                onOpen={setSelectedItem}
                showCategory={selectedCategory === 'all'}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index, 12) * 0.04}s` }}
              />
            ))}
          </div>
        )}
      </Container>

      <MediaLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
