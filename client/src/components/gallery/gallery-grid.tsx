import { GalleryItem } from '@/types/gallery';
import { Card, CardContent } from '@/components/ui/card';

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No images found for the selected filter.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden shadow-lg card-hover"
          data-testid={`card-gallery-${item.id}`}
        >
          <div className="aspect-square relative overflow-hidden">
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <CardContent className="p-3">
            <p className="text-sm font-medium text-card-foreground mb-1" data-testid={`text-gallery-event-${item.id}`}>
              {item.event}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-gallery-details-${item.id}`}>
              {item.year} • {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
