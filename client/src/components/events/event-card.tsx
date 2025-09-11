import { Event } from "@/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import {
  calculateEventStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/event-status";
import {
  Clock,
  MapPin,
  User,
  Users,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useRegistration } from "@/contexts/registration-context";
import { Link } from "wouter";

interface EventCardProps {
  event: Event;
  variant?: "default" | "highlight";
}

const categoryColors = {
  academic: "bg-primary text-primary-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  sports: "bg-destructive text-destructive-foreground",
  technical: "bg-accent text-accent-foreground",
};

export function EventCard({ event, variant = "default" }: EventCardProps) {
  const { user, isEventBookmarked, bookmarkEvent, unbookmarkEvent } = useUser();
  const {
    isEventRegistered,
    registerForEvent,
    unregisterFromEvent,
    getRegistrationCount,
  } = useRegistration();
  const isBookmarked = isEventBookmarked(event.id);
  const registered = isEventRegistered(event.id);
  const regCount = getRegistrationCount(event.id);

  // Calculate current status based on dates
  const currentStatus = calculateEventStatus(event);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      unbookmarkEvent(event.id);
    } else {
      bookmarkEvent(event.id);
    }
  };

  const handleRegisterToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (registered) {
      unregisterFromEvent(event.id);
    } else {
      registerForEvent(event.id);
    }
  };

  const capacityText =
    event.capacity === "No limit"
      ? "No limit"
      : event.capacity
      ? `${event.attendees}${
          typeof event.capacity === "number" ? `/${event.capacity}` : ""
        }`
      : `${regCount}`;

  return (
    <Link href={`/events/${event.id}`}>
      <Card
        className="overflow-hidden shadow-lg card-hover cursor-pointer transition-all duration-200 hover:shadow-xl h-full flex flex-col"
        data-testid={`card-event-${event.id}`}
      >
        <div className="aspect-video relative overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            {variant === "highlight" && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`${getStatusColor(currentStatus)} border`}
            >
              {getStatusLabel(currentStatus)}
            </Badge>
          </div>
          {user && user.role !== "visitor" && (
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBookmarkToggle}
                className="bg-white/90 hover:bg-white"
                data-testid={`button-bookmark-${event.id}`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-6 flex flex-col flex-grow">
          <div className="flex flex-col items-start justify-start mb-3 gap-2">
            <div className="flex gap-2 flex-wrap">
              <Badge className={categoryColors[event.category]}>
                {event.category.charAt(0).toUpperCase() +
                  event.category.slice(1)}
              </Badge>
              <Badge
                variant="outline"
                className={`${getStatusColor(currentStatus)} border`}
              >
                {getStatusLabel(currentStatus)}
              </Badge>
            </div>
            <span
              className="text-sm text-muted-foreground flex gap-1 justify-between w-full"
              data-testid={`text-event-date-${event.id}`}
            >
              <p className="font-bold">Start: {event.dateStart}</p>
              <p className="font-bold">End: {event.dateEnd}</p>
            </span>
          </div>

          <h3
            className="text-xl font-bold text-card-foreground mb-3"
            data-testid={`text-event-title-${event.id}`}
          >
            {event.name}
          </h3>

          <p
            className="text-muted-foreground mb-4 line-clamp-2 flex-grow"
            data-testid={`text-event-description-${event.id}`}
          >
            {event.description}
          </p>

          <div className="space-y-2 text-sm text-muted-foreground mt-auto">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span data-testid={`text-event-time-${event.id}`}>
                {event.time}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span data-testid={`text-event-venue-${event.id}`}>
                {event.venue}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span data-testid={`text-event-organizer-${event.id}`}>
                {event.organizer}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span data-testid={`text-event-capacity-${event.id}`}>
                Registered: {capacityText}
              </span>
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              {event.registrationRequired && (
                <Badge variant="outline" className="text-xs">
                  Registration Required
                </Badge>
              )}
              {registered && (
                <Badge
                  variant="default"
                  className="text-xs bg-green-600 hover:bg-green-700"
                >
                  Registered
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
