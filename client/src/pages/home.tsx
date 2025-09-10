import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { useEvents } from "@/hooks/use-events";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { upcomingEvents } = useEvents();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 fade-in"
            data-testid="text-hero-title"
          >
            Chào mừng đến với CampusConnect
          </h1>
          <p
            className="text-xl md:text-2xl mb-8 fade-in"
            data-testid="text-hero-subtitle"
          >
            Cổng thông tin sự kiện và hoạt động campus của bạn
          </p>
          <p
            className="text-lg mb-8 fade-in"
            data-testid="text-hero-description"
          >
            Luôn cập nhật, luôn tham gia - Khám phá các sự kiện thú vị, kết nối
            với cộng đồng, và tận dụng tối đa trải nghiệm đại học của bạn.
          </p>

          <div className="space-x-4">
            <Link href="/events">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90"
                data-testid="button-explore-events"
              >
                Khám phá sự kiện
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-black hover:bg-white hover:text-primary"
              onClick={() => scrollToSection("about-preview")}
              data-testid="button-learn-more"
            >
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events Highlights */}
      <section className="py-16 bg-muted" id="upcoming-events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-foreground mb-4"
              data-testid="text-upcoming-title"
            >
              Điểm nổi bật sự kiện sắp tới
            </h2>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              data-testid="text-upcoming-description"
            >
              Đừng bỏ lỡ những sự kiện thú vị sắp tới sẽ làm phong phú thêm trải
              nghiệm campus của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="highlight" />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/events">
              <Button size="lg" data-testid="button-view-all-events">
                Xem tất cả sự kiện
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 bg-white" id="about-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl font-bold text-foreground mb-6"
                data-testid="text-about-title"
              >
                Về Trường CampusConnect
              </h2>
              <p
                className="text-lg text-muted-foreground mb-6"
                data-testid="text-about-description"
              >
                Trường chúng tôi là một cơ sở giáo dục hàng đầu chuyên về đào
                tạo xuất sắc, đổi mới sáng tạo và phát triển cá nhân. Tọa lạc
                tại trung tâm thành phố, chúng tôi đã phục vụ cộng đồng hơn 50
                năm, tạo ra những nhà lãnh đạo và những người tạo ra sự thay đổi
                đóng góp cho xã hội.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Với cơ sở vật chất hiện đại, đội ngũ giảng viên nổi tiếng và
                cuộc sống campus sôi động, chúng tôi cung cấp một môi trường nơi
                sinh viên có thể phát triển về mặt học thuật, xã hội và cá nhân.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Xuất sắc học thuật
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Các chương trình hàng đầu trên nhiều ngành học
                  </p>
                </div>
                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Đổi mới nghiên cứu
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Cơ sở nghiên cứu và cơ hội tiên tiến
                  </p>
                </div>
              </div>

              <Link href="/about">
                <Button data-testid="button-learn-about">
                  Tìm hiểu thêm về chúng tôi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="College campus building"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
