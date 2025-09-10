import { useState, useMemo } from 'react';
import { GalleryItem, GalleryFilter } from '@/types/gallery';
import galleryData from '@/data/gallery.json';

export function useGallery() {
  const [filter, setFilter] = useState<GalleryFilter>('all');

  const galleryItems = useMemo(() => {
    let filteredItems = galleryData as GalleryItem[];

    if (filter !== 'all') {
      if (filter === '2024' || filter === '2023') {
        filteredItems = filteredItems.filter(item => item.year === filter);
      } else {
        filteredItems = filteredItems.filter(item => item.category === filter);
      }
    }

    // Sort by date (most recent first)
    filteredItems.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    return filteredItems;
  }, [filter]);

  return {
    galleryItems,
    filter,
    setFilter,
  };
}
