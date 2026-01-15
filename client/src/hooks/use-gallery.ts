import { useState, useMemo, useEffect } from 'react';
import { GalleryItem, GalleryFilter } from '@/types/gallery';
// import galleryData from '@/data/gallery.json'; // Backup - keeping for reference
import { galleryApi } from '@/lib/api';

export function useGallery() {
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load gallery items from API
  useEffect(() => {
    const loadGallery = async () => {
      try {
        setIsLoading(true);
        const items = await galleryApi.getAll();
        // Map API GalleryItem to frontend GalleryItem type
        const mappedItems: GalleryItem[] = items.map((item) => ({
          ...item,
          category: item.category as 'technical' | 'cultural' | 'sports' | 'academic',
        }));
        setGalleryItems(mappedItems);
      } catch (error) {
        console.error('Error loading gallery:', error);
        // Fallback to empty array
        setGalleryItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGallery();
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = [...galleryItems];

    if (filter !== 'all') {
      if (filter === '2024' || filter === '2023') {
        filtered = filtered.filter(item => item.year === filter);
      } else {
        filtered = filtered.filter(item => item.category === filter);
      }
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    return filtered;
  }, [galleryItems, filter]);

  return {
    galleryItems: filteredItems,
    filter,
    setFilter,
    isLoading,
  };
}
