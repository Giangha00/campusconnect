import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import { SearchBar } from '@/components/search/search-bar';
import { useEvents } from '@/hooks/use-events';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

export default function Events() {
  const { events, filter, setFilter, sortBy, setSortBy, searchQuery, setSearchQuery } = useEvents();
  
  const sortOptions = [
    { value: 'date', label: 'Sắp xếp theo ngày', icon: Calendar },
    { value: 'name', label: 'Sắp xếp theo tên', icon: User },
    { value: 'venue', label: 'Sắp xếp theo địa điểm', icon: MapPin },
    { value: 'time', label: 'Sắp xếp theo thời gian', icon: Clock },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-events-hero-title">
              Lịch Sự Kiện
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-events-hero-description">
              Khám phá danh sách đầy đủ các sự kiện sắp tới và đã qua. Lọc theo danh mục 
              và sắp xếp để tìm chính xác những gì bạn quan tâm.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Tìm kiếm theo tên, mô tả, khoa, địa điểm, chủ đề..."
            />
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <EventFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              currentSort={sortBy}
              onSortChange={setSortBy}
            />
            
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Sắp xếp nâng cao:</span>
              {sortOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy(option.value as any)}
                    className="gap-2"
                    data-testid={`button-sort-${option.value}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-foreground mb-4" data-testid="text-no-events-title">
                Không tìm thấy sự kiện
              </h3>
              <p className="text-muted-foreground" data-testid="text-no-events-description">
                {searchQuery ? `Không có sự kiện nào khớp với từ khóa "${searchQuery}". Thử tìm kiếm với từ khóa khác.` : 'Không có sự kiện nào phù hợp với tiêu chí lọc hiện tại. Thử chọn danh mục khác.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground" data-testid="text-events-count">
                  Hiển thị {events.length} sự kiện
                  {searchQuery && (
                    <span className="text-muted-foreground">
                      {' '}cho "{searchQuery}"
                    </span>
                  )}
                  {filter !== 'all' && (
                    <span className="text-muted-foreground">
                      {' '}trong danh mục{' '}
                      <span className="capitalize">{filter === 'academic' ? 'Học thuật' : filter === 'cultural' ? 'Văn hóa' : filter === 'sports' ? 'Thể thao' : 'Khoa/Bộ môn'}</span>
                    </span>
                  )}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-events-cta-title">
            Đừng bỏ lỡ các sự kiện trường học
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-6" data-testid="text-events-cta-description">
            Kết nối với cộng đồng trường học và tận dụng tối đa trải nghiệm đại học của bạn.
          </p>
          <p className="text-primary-foreground/80" data-testid="text-events-cta-note">
            Để đăng ký sự kiện và biết thêm thông tin, hãy liên hệ với ban tổ chức tương ứng hoặc đến văn phòng công tác sinh viên.
          </p>
        </div>
      </section>
    </div>
  );
}
