import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { useGallery } from "@/hooks/use-gallery";

const galleryStats = [
  {
    category: "Technology",
    count: "15+",
    description: "Innovation expos and tech events",
  },
  {
    category: "Culture",
    count: "25+",
    description: "Festivals and artistic performances",
  },
  {
    category: "Sports",
    count: "20+",
    description: "Sports competitions and victories",
  },
  {
    category: "Academics",
    count: "30+",
    description: "Seminars and learning activities",
  },
];

export default function Gallery() {
  const { galleryItems, filter, setFilter } = useGallery();

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-section h-[50vh]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <h1
            className="hero-title text-5xl"
            data-testid="text-gallery-hero-title"
          >
            Event Photo Gallery
          </h1>
          <p
            className="hero-description text-xl"
            data-testid="text-gallery-hero-description"
          >
            Discover memorable moments from university events. Revisit images
            organized by year and category.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryFilters currentFilter={filter} onFilterChange={setFilter} />
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {galleryItems.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-2xl font-semibold text-foreground"
                data-testid="text-gallery-count"
              >
                Showing {galleryItems.length} photos
                {filter !== "all" && (
                  <span className="text-muted-foreground">
                    {" "}
                    from{" "}
                    <span className="capitalize">
                      {filter === "2024" || filter === "2023"
                        ? `year ${filter}`
                        : filter === "cultural"
                        ? "cultural events"
                        : filter === "sports"
                        ? "sports events"
                        : filter === "academic"
                        ? "academic events"
                        : filter === "technical"
                        ? "technical events"
                        : `event ${filter}`}
                    </span>
                  </span>
                )}
              </h2>
            </div>
          )}

          <GalleryGrid items={galleryItems} />
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold text-foreground mb-6"
            data-testid="text-gallery-info-title"
          >
            Capturing Campus Life
          </h2>
          <p
            className="text-lg text-muted-foreground mb-8"
            data-testid="text-gallery-info-description"
          >
            Our photo gallery showcases the vibrant life at CampusConnect. From
            academic achievements to cultural festivals, from sports victories
            to innovative projects - every moment tells a story of growth,
            learning, and community.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryStats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
                data-testid={`stat-${index}`}
              >
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.count}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.category}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
