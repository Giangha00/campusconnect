import { useRoute } from "wouter";
import { Event } from "@/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import {
  Clock,
  MapPin,
  User,
  Users,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Calendar,
  Building2,
  UserCheck,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useRegistration } from "@/contexts/registration-context";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const categoryColors = {
  academic: "bg-primary text-primary-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  sports: "bg-destructive text-destructive-foreground",
  departmental: "bg-accent text-accent-foreground",
};

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const { user, isEventBookmarked, bookmarkEvent, unbookmarkEvent } = useUser();
  const {
    registerForEvent,
    unregisterFromEvent,
    isEventRegistered,
    getRegistrationCount,
  } = useRegistration();
  const { events } = useEvents();
  const { toast } = useToast();

  const eventId = params?.id ? parseInt(params.id) : null;
  const event = events?.find((e: Event) => e.id === eventId);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/events">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isBookmarked = isEventBookmarked(event.id);
  const isRegistered = isEventRegistered(event.id);
  const registrationCount = getRegistrationCount(event.id);

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      unbookmarkEvent(event.id);
    } else {
      bookmarkEvent(event.id);
    }
  };

  const handleRegistrationToggle = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to register for the event",
        variant: "destructive",
      });
      return;
    }

    if (isRegistered) {
      unregisterFromEvent(event.id);
      toast({
        title: "Unregister Success",
        description: `You have unregistered for the event "${event.name}" successfully!`,
      });
    } else {
      registerForEvent(event.id);
      toast({
        title: "Register Success",
        description: `You have registered for the event "${event.name}" successfully!`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mt-14 mb-6">
        <Link href="/events">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge
                className={
                  categoryColors[event.category as keyof typeof categoryColors]
                }
              >
                {event.category.charAt(0).toUpperCase() +
                  event.category.slice(1)}
              </Badge>
            </div>
            {user && user.role !== "visitor" && (
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookmarkToggle}
                  className="bg-white/90 hover:bg-white"
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

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {event.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <Badge
                variant={
                  event.status === "upcoming"
                    ? "default"
                    : event.status === "ongoing"
                    ? "secondary"
                    : "outline"
                }
                className="text-sm"
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
              <div className="flex gap-2 flex-wrap">
                {event.registrationRequired && (
                  <Badge variant="outline" className="text-sm">
                    Registration Required
                  </Badge>
                )}
                {isRegistered && (
                  <Badge
                    variant="default"
                    className="text-sm bg-green-600 hover:bg-green-700"
                  >
                    Registered
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Time</p>
                    <p className="text-gray-600">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Venue</p>
                    <p className="text-gray-600">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Organizer</p>
                    <p className="text-gray-600">{event.organizer}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Department</p>
                    <p className="text-gray-600">{event.department}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.capacity ? "Capacity" : "Registrations"}
                    </p>
                    <p className="text-gray-600">
                      {event.capacity
                        ? `${event.attendees}/${event.capacity} attendees`
                        : `${event.attendees} registered`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                {event.status === "upcoming" &&
                  user &&
                  user.role !== "visitor" && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleRegistrationToggle}
                      variant={isRegistered ? "outline" : "default"}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      {isRegistered
                        ? "Registered"
                        : event.registrationRequired
                        ? "Register for Event"
                        : "Join Event"}
                    </Button>
                  )}

                {user && user.role !== "visitor" && (
                  <Button
                    variant={isBookmarked ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                    onClick={handleBookmarkToggle}
                  >
                    {isBookmarked ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 mr-2" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Bookmark Event
                      </>
                    )}
                  </Button>
                )}

                <Button variant="outline" className="w-full" size="lg">
                  Share Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
