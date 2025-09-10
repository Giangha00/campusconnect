import { EventCard } from '@/components/events/event-card';
import { useUser } from '@/contexts/user-context';
import eventsData from '@/data/events.json';
import { Event } from '@/types/event';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { BookmarkX } from 'lucide-react';

export default function Bookmarks() {
  const { user, isEventBookmarked } = useUser();

  if (!user) {
    return (
      <div className="pt-16">
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-bookmarks-not-logged-in">
              Cần đăng nhập
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Bạn cần đăng nhập để xem các sự kiện đã lưu
            </p>
            <Link href="/">
              <Button>Về trang chủ</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (user.role === 'visitor') {
    return (
      <div className="pt-16">
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-bookmarks-visitor-access">
              Không có quyền truy cập
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Chức năng lưu sự kiện chỉ dành cho sinh viên và giảng viên
            </p>
            <Link href="/events">
              <Button>Xem tất cả sự kiện</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const bookmarkedEvents = (eventsData as Event[]).filter(event => 
    isEventBookmarked(event.id)
  );

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6" data-testid="text-bookmarks-hero-title">
              Sự kiện đã lưu
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-bookmarks-hero-description">
              Danh sách các sự kiện bạn đã đánh dấu để theo dõi
            </p>
          </div>
        </div>
      </section>

      {/* Bookmarked Events */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {bookmarkedEvents.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-4" data-testid="text-no-bookmarks-title">
                Chưa có sự kiện nào được lưu
              </h3>
              <p className="text-muted-foreground mb-8" data-testid="text-no-bookmarks-description">
                Hãy tìm kiếm và lưu các sự kiện thú vị để theo dõi dễ dàng hơn
              </p>
              <Link href="/events">
                <Button data-testid="button-browse-events">
                  Khám phá sự kiện
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground" data-testid="text-bookmarks-count">
                  Bạn đã lưu {bookmarkedEvents.length} sự kiện
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookmarkedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6" data-testid="text-bookmarks-info-title">
            Quản lý sự kiện của bạn
          </h2>
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-bookmarks-info-description">
            Sử dụng tính năng lưu sự kiện để theo dõi các hoạt động quan tâm và không bỏ lỡ những cơ hội tham gia
          </p>
        </div>
      </section>
    </div>
  );
}