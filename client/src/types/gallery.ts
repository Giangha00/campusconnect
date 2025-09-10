export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  year: string;
  category: 'technical' | 'cultural' | 'sports' | 'academic';
  event: string;
  date?: string;
}

export type GalleryFilter = GalleryItem['year'] | GalleryItem['category'] | 'all';
