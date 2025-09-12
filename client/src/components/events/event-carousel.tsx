import { useState, useEffect, useMemo } from "react";
import { Event } from "@/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateEventStatus } from "@/lib/event-status";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventCarouselProps {
  events: Event[];
}

interface CountdownTimer {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded?: boolean;
  isOngoing?: boolean;
}

export function EventCarousel({ events }: EventCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdowns, setCountdowns] = useState<CountdownTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the display events to prevent infinite re-renders
  const displayEvents = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    // Filter events in the current month (UTC)
    const currentMonthEvents = events.filter((event) => {
      const eventDate = new Date(event.dateStart);
      const eventMonth = eventDate.getUTCMonth();
      const eventYear = eventDate.getUTCFullYear();

      return eventMonth === currentMonth && eventYear === currentYear;
    });

    // If no events in current month, show upcoming events, then all events
    if (currentMonthEvents.length > 0) {
      return currentMonthEvents;
    }

    // Fallback: show upcoming events
    const upcomingEvents = events.filter(
      (event) => calculateEventStatus(event) === "upcoming"
    );
    if (upcomingEvents.length > 0) {
      return upcomingEvents.slice(0, 5);
    }

    // Final fallback: show all events
    return events.slice(0, 5);
  }, [events]);

  // Reset current slide when events change
  useEffect(() => {
    setCurrentSlide(0);
  }, [displayEvents]);

  // Calculate countdown timers
  useEffect(() => {
    if (displayEvents.length === 0) {
      setCountdowns([]);
      setIsLoading(false);
      return;
    }

    const calculateCountdowns = () => {
      const now = new Date();
      const timers = displayEvents.map((event) => {
        const eventStartDate = new Date(event.dateStart);
        const eventEndDate = new Date(event.dateEnd);
        const startTimeDiff = eventStartDate.getTime() - now.getTime();
        const endTimeDiff = eventEndDate.getTime() - now.getTime();

        // If event has ended (past dateEnd), return special status
        if (endTimeDiff <= 0) {
          return {
            days: -1,
            hours: -1,
            minutes: -1,
            seconds: -1,
            isEnded: true,
          };
        }

        // If event has started but not ended (ongoing), return special status
        if (startTimeDiff <= 0 && endTimeDiff > 0) {
          return {
            days: -2,
            hours: -2,
            minutes: -2,
            seconds: -2,
            isOngoing: true,
          };
        }

        // If event hasn't started yet, calculate countdown to start
        if (startTimeDiff <= 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(startTimeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (startTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (startTimeDiff % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((startTimeDiff % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
      });

      setCountdowns(timers);
      setIsLoading(false);
    };

    calculateCountdowns();
    const interval = setInterval(calculateCountdowns, 1000);

    return () => clearInterval(interval);
  }, [displayEvents]);

  // Auto-advance slides every 10 seconds
  useEffect(() => {
    if (displayEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayEvents.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [displayEvents.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + displayEvents.length) % displayEvents.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (displayEvents.length === 0) {
    return (
      <section className="hero-section h-[50vh] min-h-[400px]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <div className="text-center">
            <h1 className="hero-title text-5xl">Campus Events</h1>
            <p className="hero-description text-xl">
              Discover amazing events happening on campus
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentEvent = displayEvents[currentSlide] || displayEvents[0];
  const currentCountdown = countdowns[currentSlide] ||
    countdowns[0] || {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

  // Safety check to ensure we have a valid event
  if (!currentEvent) {
    return (
      <section className="hero-section h-[50vh] min-h-[400px]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <div className="text-center">
            <h1 className="hero-title text-5xl">Campus Events</h1>
            <p className="hero-description text-xl">
              Discover amazing events happening on campus
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat carousel-slide"
        style={{
          backgroundImage: `url(${currentEvent.image})`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Event Information */}
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  {currentEvent.category.charAt(0).toUpperCase() +
                    currentEvent.category.slice(1)}
                </Badge>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  {currentEvent.name}
                </h1>

                <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                  {currentEvent.description.length > 200
                    ? `${currentEvent.description.substring(0, 200)}...`
                    : currentEvent.description}
                </p>

                <div className="flex flex-wrap gap-4 text-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(currentEvent.dateStart).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{currentEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{currentEvent.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex justify-center lg:justify-end">
              <Card className="countdown-timer text-white max-w-md w-full bg-transparent border-white/20">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Time Until Event</h3>

                    {isLoading ? (
                      <div className="text-white/80 text-lg">
                        Loading countdown...
                      </div>
                    ) : currentCountdown.isEnded ? (
                      <div className="text-red-400 font-bold text-lg">
                        Event Closed
                      </div>
                    ) : currentCountdown.isOngoing ? (
                      <div className="text-orange-400 font-bold text-lg">
                        Event Ongoing
                      </div>
                    ) : currentCountdown.days === 0 &&
                      currentCountdown.hours === 0 &&
                      currentCountdown.minutes === 0 &&
                      currentCountdown.seconds === 0 ? (
                      <div className="text-red-400 font-bold text-lg">
                        Event Started
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold bg-white/10 rounded-lg p-3 border border-white/20">
                            {currentCountdown.days}
                          </div>
                          <div className="text-sm mt-1">Days</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold bg-white/10 rounded-lg p-3 border border-white/20">
                            {currentCountdown.hours}
                          </div>
                          <div className="text-sm mt-1">Hours</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold bg-white/10 rounded-lg p-3 border border-white/20">
                            {currentCountdown.minutes}
                          </div>
                          <div className="text-sm mt-1">Minutes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl md:text-3xl font-bold bg-white/10 rounded-lg p-3 border border-white/20">
                            {currentCountdown.seconds}
                          </div>
                          <div className="text-sm mt-1">Seconds</div>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-white/80">
                      {currentCountdown.isEnded
                        ? "Event has ended"
                        : currentCountdown.isOngoing
                        ? "Event is currently happening"
                        : "Until event starts"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {displayEvents.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Slide Indicators */}
      {displayEvents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {displayEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {displayEvents.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((currentSlide + 1) / displayEvents.length) * 100}%`,
            }}
          />
        </div>
      )}
    </section>
  );
}
