import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Laptop,
  Palette,
  Trophy,
  Users,
  BookOpen,
  Award,
  Globe,
  Lightbulb,
} from "lucide-react";

export default function About() {
  const keyFeatures = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Academic Excellence",
      description:
        "Top-tier programs across multiple disciplines with renowned faculty",
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Research Innovation",
      description:
        "Cutting-edge research facilities and opportunities for breakthrough discoveries",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Opportunities",
      description: "International partnerships and exchange programs worldwide",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Career Success",
      description: "Strong industry connections and excellent placement record",
    },
  ];

  const eventCategories = [
    {
      icon: <Laptop className="h-12 w-12" />,
      title: "Technical Events",
      color: "text-primary",
      bgColor: "bg-primary/10",
      events: [
        "TechFest - Annual technology festival",
        "Hackathon - 24-hour coding marathon",
        "Robotics Championship",
        "Innovation Expo",
        "AI & ML Symposium",
      ],
    },
    {
      icon: <Palette className="h-12 w-12" />,
      title: "Cultural Events",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      events: [
        "Annual Day Celebration",
        "Music & Dance Nights",
        "Art Exhibition",
        "Drama Festival",
        "Literary Competitions",
      ],
    },
    {
      icon: <Trophy className="h-12 w-12" />,
      title: "Sports & Activities",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      events: [
        "Inter-college Sports Meet",
        "Basketball Tournament",
        "Marathon & Fun Run",
        "Swimming Championship",
        "Cricket League",
      ],
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-section h-[50vh] min-h-[250px]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_9.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <h1
            className="hero-title text-6xl"
            data-testid="text-about-hero-title"
          >
            About Campus Connect College
          </h1>
          <p
            className="hero-description text-2xl"
            data-testid="text-about-hero-description"
          >
            Empowering minds, fostering innovation, and building the leaders of
            tomorrow since 1975
          </p>
        </div>
      </section>

      {/* College Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl font-bold text-foreground mb-6"
                data-testid="text-college-info-title"
              >
                Our Legacy of Excellence
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p data-testid="text-college-description-1">
                  <strong className="text-foreground">
                    CampusConnect College
                  </strong>{" "}
                  stands as a beacon of educational excellence, established in
                  1975 with a vision to create leaders who shape the future.
                  Located in the vibrant heart of Education City, our
                  institution has been nurturing minds and fostering innovation
                  for nearly five decades.
                </p>
                <p data-testid="text-college-description-2">
                  Affiliated with the prestigious State University Board, we
                  offer comprehensive programs across engineering, sciences,
                  business, arts, and humanities. Our commitment to academic
                  rigor, combined with practical learning experiences, ensures
                  our graduates are well-prepared for the challenges of
                  tomorrow.
                </p>
                <p data-testid="text-college-description-3">
                  With state-of-the-art laboratories, modern classrooms,
                  extensive libraries, and recreational facilities, we provide
                  an environment where students can explore their potential,
                  pursue their passions, and build lifelong friendships.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-primary mt-1">{feature.icon}</div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <img
                src="/images/schools/School_7.jpg"
                alt="College campus main building"
                className="rounded-sm shadow-lg w-full"
              />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">
                    Academic Programs
                  </div>
                </div>
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">15K+</div>
                  <div className="text-sm text-muted-foreground">
                    Alumni Worldwide
                  </div>
                </div>
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    200+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Faculty Members
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Annual Events */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-foreground mb-4"
              data-testid="text-events-section-title"
            >
              Key Annual Events
            </h2>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              data-testid="text-events-section-description"
            >
              Throughout the year, we host numerous events that enrich campus
              life and provide opportunities for learning, creativity, and
              collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {eventCategories.map((category, index) => (
              <Card
                key={index}
                className="overflow-hidden shadow-lg card-hover"
                data-testid={`card-event-category-${index}`}
              >
                <CardContent className="p-6">
                  <div
                    className={`${category.bgColor} ${category.color} w-20 h-20 rounded-lg flex items-center justify-center mb-6 mx-auto`}
                  >
                    {category.icon}
                  </div>

                  <h3
                    className="text-xl font-semibold text-center mb-4"
                    data-testid={`text-category-title-${index}`}
                  >
                    {category.title}
                  </h3>

                  <ul className="space-y-3">
                    {category.events.map((event, eventIndex) => (
                      <li
                        key={eventIndex}
                        className="flex items-center space-x-2"
                        data-testid={`text-event-${index}-${eventIndex}`}
                      >
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-muted-foreground">{event}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8 border-l-4 border-l-primary">
              <h3
                className="text-2xl font-bold text-foreground mb-4"
                data-testid="text-vision-title"
              >
                Our Vision
              </h3>
              <p
                className="text-lg text-muted-foreground leading-relaxed"
                data-testid="text-vision-content"
              >
                To be a globally recognized institution that transforms students
                into innovative leaders, critical thinkers, and responsible
                citizens who contribute meaningfully to society and drive
                positive change in the world.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-l-secondary">
              <h3
                className="text-2xl font-bold text-foreground mb-4"
                data-testid="text-mission-title"
              >
                Our Mission
              </h3>
              <p
                className="text-lg text-muted-foreground leading-relaxed"
                data-testid="text-mission-content"
              >
                To provide world-class education through innovative teaching
                methodologies, foster research and creativity, promote ethical
                values, and create an inclusive environment that empowers
                students to achieve their full potential.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Campus Facilities */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold text-foreground mb-4"
              data-testid="text-facilities-title"
            >
              World-Class Campus Facilities
            </h2>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              data-testid="text-facilities-description"
            >
              Our modern campus is designed to support learning, research, and
              personal growth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Modern Laboratories",
                description: "State-of-the-art equipment for hands-on learning",
              },
              {
                title: "Digital Library",
                description:
                  "Extensive collection of books, journals, and digital resources",
              },
              {
                title: "Sports Complex",
                description:
                  "Comprehensive facilities for all major sports and fitness",
              },
              {
                title: "Innovation Hub",
                description:
                  "Dedicated spaces for research, startups, and collaboration",
              },
            ].map((facility, index) => (
              <Card
                key={index}
                className="text-center p-6 card-hover"
                data-testid={`card-facility-${index}`}
              >
                <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h4
                  className="font-semibold text-foreground mb-2"
                  data-testid={`text-facility-title-${index}`}
                >
                  {facility.title}
                </h4>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid={`text-facility-description-${index}`}
                >
                  {facility.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
