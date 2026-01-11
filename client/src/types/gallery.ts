export interface GalleryItem {
  id: number;
  imageUrl: string;
  altText?: string;
  year: string;
  category: 'technical' | 'cultural' | 'sports' | 'academic';
  eventName?: string;
  date?: string;
  // Legacy fields for backward compatibility
  src?: string;
  alt?: string;
  event?: string;
}

export type GalleryFilter = GalleryItem['year'] | GalleryItem['category'] | 'all';
