import { EventCard } from "@/components/events/event-card";
import { useUser } from "@/contexts/user-context";
import eventsData from "@/data/events.json";
import { Event } from "@/types/event";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookmarkX } from "lucide-react";

export default function Bookmarks() {
  const { user, isEventBookmarked } = useUser();

  if (!user) {
    return (
      <div className="pt-16">
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="text-5xl font-bold text-foreground mb-6"
              data-testid="text-bookmarks-not-logged-in"
            >
              Login Required
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              You need to be logged in to view your bookmarked events
            </p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (user.role === "visitor") {
    return (
      <div className="pt-16">
        <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="text-5xl font-bold text-foreground mb-6"
              data-testid="text-bookmarks-visitor-access"
            >
              Access Denied
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              The bookmark feature is only available for students and faculty
            </p>
            <Link href="/events">
              <Button>View All Events</Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const bookmarkedEvents = (eventsData as Event[]).filter((event) =>
    isEventBookmarked(event.id)
  );

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-5xl font-bold text-foreground mb-6"
              data-testid="text-bookmarks-hero-title"
            >
              Bookmarked Events
            </h1>
            <p
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              data-testid="text-bookmarks-hero-description"
            >
              A list of events you have bookmarked to keep track of
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
              <h3
                className="text-2xl font-semibold text-foreground mb-4"
                data-testid="text-no-bookmarks-title"
              >
                No Bookmarked Events Yet
              </h3>
              <p
                className="text-muted-foreground mb-8"
                data-testid="text-no-bookmarks-description"
              >
                Browse and bookmark interesting events to track them easily
              </p>
              <Link href="/events">
                <Button data-testid="button-browse-events">
                  Explore Events
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2
                  className="text-2xl font-semibold text-foreground"
                  data-testid="text-bookmarks-count"
                >
                  You have {bookmarkedEvents.length} bookmarked events
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
          <h2
            className="text-3xl font-bold text-foreground mb-6"
            data-testid="text-bookmarks-info-title"
          >
            Manage Your Events
          </h2>
          <p
            className="text-lg text-muted-foreground mb-8"
            data-testid="text-bookmarks-info-description"
          >
            Use the bookmark feature to keep track of interesting activities and
            not miss out on participation opportunities
          </p>
        </div>
      </section>
    </div>
  );
}
