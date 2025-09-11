import { useState } from 'react';
import { GalleryItem } from '@/types/gallery';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No images found for the selected filter.</p>
      </div>
    );
  }

  // Group by year (desc)
  const groups = items.reduce<Record<string, GalleryItem[]>>((acc, item) => {
    acc[item.year] = acc[item.year] ? [...acc[item.year], item] : [item];
    return acc;
  }, {});

  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-10">
      {years.map((year) => (
        <section key={year} id={`year-${year}`} className="scroll-mt-24">
          <h3 className="text-xl font-semibold mb-4">Year {year}</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groups[year].map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden shadow-lg card-hover"
                data-testid={`card-gallery-${item.id}`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="aspect-square relative overflow-hidden w-full cursor-zoom-in"
                  aria-label={`Open ${item.event} image`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </button>
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
        </section>
      ))}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl">
          {selected && (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle>{selected.event}</DialogTitle>
                <DialogDescription>
                  {selected.year} • {selected.category.charAt(0).toUpperCase() + selected.category.slice(1)}
                </DialogDescription>
              </DialogHeader>
              <div className="w-full">
                <img
                  src={selected.src}
                  alt={selected.alt}
                  className="w-full h-auto rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground">{selected.alt}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
