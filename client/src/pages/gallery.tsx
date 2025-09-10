import { GalleryGrid } from '@/components/gallery/gallery-grid';
import { GalleryFilters } from '@/components/gallery/gallery-filters';
import { useGallery } from '@/hooks/use-gallery';

export default function Gallery() {
  const { galleryItems, filter, setFilter } = useGallery();

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-gallery-hero-title">
              Bộ sưu tập ảnh sự kiện
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-gallery-hero-description">
              Khám phá những khoảnh khắc đáng nhớ từ các sự kiện trường đại học. 
              Xem lại những hình ảnh được tổ chức theo năm và thể loại.
            </p>
          </div>
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
              <h2 className="text-2xl font-semibold text-foreground" data-testid="text-gallery-count">
                Hiển thị {galleryItems.length} ảnh
                {filter !== 'all' && (
                  <span className="text-muted-foreground">
                    {' '}từ{' '}
                    <span className="capitalize">
                      {filter === '2024' || filter === '2023' ? `năm ${filter}` : 
                       filter === 'cultural' ? 'sự kiện văn hóa' :
                       filter === 'sports' ? 'sự kiện thể thao' :
                       filter === 'academic' ? 'sự kiện học thuật' :
                       filter === 'departmental' ? 'sự kiện khoa/bộ môn' : `sự kiện ${filter}`}
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
          <h2 className="text-3xl font-bold text-foreground mb-6" data-testid="text-gallery-info-title">
            Ghi lại cuộc sống trường đại học
          </h2>
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-gallery-info-description">
            Bộ sưu tập ảnh của chúng tôi thể hiện cuộc sống sôi động tại CampusConnect. Từ những thành tựu học thuật 
            đến các lễ hội văn hóa, từ chiến thắng thể thao đến các dự án đổi mới - mỗi khoảnh khắc đều kể lên 
            câu chuyện về sự phát triển, học tập và cộng đồng.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { category: 'Công nghệ', count: '15+', description: 'Triển lãm đổi mới và sự kiện công nghệ' },
              { category: 'Văn hóa', count: '25+', description: 'Lễ hội và biểu diễn nghệ thuật' },
              { category: 'Thể thao', count: '20+', description: 'Thi đấu thể thao và chiến thắng' },
              { category: 'Học thuật', count: '30+', description: 'Hội thảo và hoạt động học tập' }
            ].map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-3xl font-bold text-primary mb-2">{stat.count}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{stat.category}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
