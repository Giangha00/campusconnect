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
      <section className="relative h-screen flex items-center justify-center min-h-[600px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-800"
          style={{
            backgroundImage: "url('/images/schools/School_1.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80" />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1
            className="text-5xl md:text-7xl font-bold mb-6 fade-in drop-shadow-2xl"
            data-testid="text-hero-title"
            style={{ textShadow: "0 4px 8px rgba(0,0,0,0.8)" }}
          >
            Welcome to CampusConnect
          </h1>
          <p
            className="text-xl md:text-2xl mb-8 fade-in drop-shadow-lg"
            data-testid="text-hero-subtitle"
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.7)" }}
          >
            Your portal for campus events and activities
          </p>
          <p
            className="text-xl mb-8 fade-in drop-shadow-md"
            data-testid="text-hero-description"
            style={{ textShadow: "2 2px 8px rgba(0,0,0,1)" }}
          >
            Stay updated, stay engaged - Discover exciting events, connect with
            the community, and make the most of your university experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/events">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                data-testid="button-explore-events"
              >
                Explore Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => scrollToSection("about-preview")}
              data-testid="button-learn-more"
            >
              Learn More
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
              Upcoming Event Highlights
            </h2>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              data-testid="text-upcoming-description"
            >
              Don't miss out on the exciting upcoming events that will enrich
              your campus experience
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
                View All Events
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
                About CampusConnect College
              </h2>
              <p
                className="text-lg text-muted-foreground mb-6"
                data-testid="text-about-description"
              >
                Our college is a leading educational institution dedicated to
                academic excellence, innovation, and personal growth. Located in
                the heart of the city, we have been serving the community for
                over 50 years, producing leaders and change-makers who
                contribute to society.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                With modern facilities, renowned faculty, and a vibrant campus
                life, we provide an environment where students can thrive
                academically, socially, and personally.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Academic Excellence
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Top-tier programs across multiple disciplines
                  </p>
                </div>
                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Research Innovation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced research facilities and opportunities
                  </p>
                </div>
              </div>

              <Link href="/about">
                <Button data-testid="button-learn-about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div>
              <img
                src="/images/schools/School_6.jpg"
                alt="College campus building"
                className="rounded-sm shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
