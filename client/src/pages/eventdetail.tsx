import { useRoute } from "wouter";
import { Event } from "@/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import {
  calculateEventStatus,
  getStatusColor,
  getStatusLabel,
  canRegisterForEvent,
} from "@/lib/event-status";
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
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useEvents } from "@/contexts/events-context";
import { useRegistration } from "@/contexts/registration-context";
import { useFeedback } from "@/contexts/feedback-context";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { LoginDialog } from "@/components/auth/login-dialog";
import { adminApi, type Feedback } from "@/lib/api";
import {
  SafeText,
  sanitizeAttribute,
  safeUrl,
} from "@/components/common/safe-text";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const categoryColors = {
  academic: "bg-primary text-primary-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  sports: "bg-destructive text-destructive-foreground",
  technical: "bg-accent text-accent-foreground",
};

export default function EventDetail() {
  const [, params] = useRoute("/events/:id");
  const { user, isEventBookmarked, bookmarkEvent, unbookmarkEvent } = useUser();
  const {
    registerForEvent,
    unregisterFromEvent,
    isEventRegistered,
    reloadRegistrations,
  } = useRegistration();
  const { events } = useEvents();
  const { loadFeedbacksByEventId, addFeedback } = useFeedback();
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [organizerName, setOrganizerName] = useState<string>("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const eventId = params?.id ? parseInt(params.id) : null;
  const event = events?.find((e: any) => e.id === eventId);

  // Reload registrations when entering event detail page (if user is logged in)
  // This ensures UI reflects the actual registration status from DB
  useEffect(() => {
    if (user && eventId) {
      reloadRegistrations();
    }
  }, [user, eventId, reloadRegistrations]);

  // Fetch organizer name from admins API
  useEffect(() => {
    const fetchOrganizerName = async () => {
      if (!event) {
        setOrganizerName("");
        return;
      }

      // Get organizerId from event
      const organizerId = (event as any).organizerId;

      if (!organizerId) {
        // If no organizerId, use the existing organizer string as fallback
        setOrganizerName(event.organizer || "Unknown");
        return;
      }

      try {
        const admins = await adminApi.getAll();
        const admin = admins.find((a) => a.id === organizerId);
        if (admin) {
          setOrganizerName(admin.name);
        } else {
          // Fallback to existing organizer string if admin not found
          setOrganizerName(event.organizer || "Unknown");
        }
      } catch (error) {
        console.error("Error fetching organizer name:", error);
        // Fallback to existing organizer string on error
        setOrganizerName(event.organizer || "Unknown");
      }
    };

    fetchOrganizerName();
  }, [event]);

  // Load feedbacks for this event
  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!eventId) {
        setFeedbacks([]);
        return;
      }

      try {
        setIsLoadingFeedbacks(true);
        const eventFeedbacks = await loadFeedbacksByEventId(eventId);
        // Only show active feedbacks
        const activeFeedbacks = eventFeedbacks.filter(
          (f) => f.status === "active"
        );
        setFeedbacks(activeFeedbacks);
      } catch (error) {
        console.error("Error loading feedbacks:", error);
        setFeedbacks([]);
      } finally {
        setIsLoadingFeedbacks(false);
      }
    };

    loadFeedbacks();
  }, [eventId, loadFeedbacksByEventId]);

  // Calculate current status based on dates
  const currentStatus = event ? calculateEventStatus(event as any) : null;
  const canRegister = event ? canRegisterForEvent(event as any) : false;

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

  const handleBookmarkToggle = () => {
    if (isBookmarked) {
      unbookmarkEvent(event.id);
    } else {
      bookmarkEvent(event.id);
    }
  };

  const handleRegistrationToggle = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to register for the event",
        variant: "destructive",
      });
      return;
    }

    if (!canRegister && !isRegistered) {
      toast({
        title: "Registration Closed",
        description:
          "Registration is only available 5-30 days before the event",
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
      await registerForEvent(event.id);
      // Toast notification is now handled in the registration context
    }
  };

  const handleRegisterForNonLoggedInUser = () => {
    if (currentStatus === "upcoming") {
      setShowLoginDialog(true);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit your feedback.",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating for this event.",
        variant: "destructive",
      });
      return;
    }

    if (!feedbackText.trim() || feedbackText.trim().length < 10) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback with at least 10 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!eventId || isNaN(eventId)) {
      toast({
        title: "Invalid Event",
        description: "Cannot submit feedback: Event ID is missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmittingFeedback(true);

      // Get user info from context
      const userType = user.role;

      await addFeedback({
        userId: user.id,
        eventId: eventId,
        eventAttended: event.name,
        name: user.name || "Anonymous",
        email: user.email || "",
        userType: userType as "student" | "faculty" | "visitor",
        rating: rating,
        feedback: feedbackText.trim(),
      });

      toast({
        title: "Feedback Submitted",
        description:
          "Thank you for your feedback! It has been submitted successfully.",
        duration: 5000,
      });

      // Reset form
      setRating(0);
      setHoveredRating(0);
      setFeedbackText("");

      // Reload feedbacks to show the new one
      if (eventId) {
        const eventFeedbacks = await loadFeedbacksByEventId(eventId);
        const activeFeedbacks = eventFeedbacks.filter(
          (f) => f.status === "active"
        );
        setFeedbacks(activeFeedbacks);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
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
              src={
                safeUrl(event.image, undefined, false) ||
                "/images/schools/School_1.jpg"
              }
              alt={sanitizeAttribute(event.name)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
              <Badge
                className={
                  categoryColors[event.category as keyof typeof categoryColors]
                }>
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
                  className="bg-white/90 hover:bg-white">
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
              <SafeText>{event.name}</SafeText>
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <Badge
                variant="outline"
                className={`text-sm ${
                  currentStatus ? getStatusColor(currentStatus) : ""
                } border`}>
                {currentStatus ? getStatusLabel(currentStatus) : "Unknown"}
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
                    className="text-sm bg-green-600 hover:bg-green-700">
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
                <SafeText>{event.description}</SafeText>
              </p>
            </CardContent>
          </Card>

          {/* Feedbacks Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Event Feedbacks</h2>

              {/* Feedback Form - Only for logged in users */}
              {user && user.role !== "visitor" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">
                    Share Your Feedback
                  </h3>
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    {/* Rating */}
                    <div className="space-y-2">
                      <Label>Rating *</Label>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingClick(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="p-1 hover:scale-110 transition-transform">
                              <Star
                                className={`h-6 w-6 ${
                                  star <= (hoveredRating || rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                        {rating > 0 && (
                          <span className="text-sm text-gray-600">
                            {rating} out of 5 stars
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feedback Text */}
                    <div className="space-y-2">
                      <Label htmlFor="feedback-text">Your Feedback *</Label>
                      <Textarea
                        id="feedback-text"
                        placeholder="Share your thoughts about this event... (minimum 10 characters)"
                        rows={4}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="resize-none"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        {feedbackText.length} characters (minimum 10)
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        isSubmittingFeedback ||
                        rating === 0 ||
                        feedbackText.trim().length < 10
                      }>
                      {isSubmittingFeedback
                        ? "Submitting..."
                        : "Submit Feedback"}
                    </Button>
                  </form>
                </div>
              )}

              {/* Feedback List */}
              {isLoadingFeedbacks ? (
                <div className="text-center py-8 text-gray-500">
                  Loading feedbacks...
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {user && user.role !== "visitor"
                    ? "No feedbacks yet. Be the first to share your experience!"
                    : "No feedbacks yet."}
                </div>
              ) : (
                <div className="space-y-6">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {feedback.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {feedback.userType}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= feedback.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        <SafeText>{feedback.feedback}</SafeText>
                      </p>
                      {feedback.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(feedback.createdAt)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-4">
                {event.registrationStart && event.registrationEnd && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Registration Date
                      </p>
                      <p className="text-gray-600">
                        {formatDate(event.registrationStart)} -{" "}
                        {formatDate(event.registrationEnd)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Date</p>
                    <p className="text-gray-600">
                      {formatDate(event.dateStart)} -{" "}
                      {formatDate(event.dateEnd)}
                    </p>
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
                    <p className="text-gray-600">
                      {organizerName || event.organizer || "Unknown"}
                    </p>
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
                      {event.capacity === "No limit"
                        ? "No limit"
                        : event.capacity
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
                {currentStatus === "upcoming" &&
                  user &&
                  user.role !== "visitor" && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleRegistrationToggle}
                      variant={isRegistered ? "outline" : "default"}
                      disabled={!canRegister && !isRegistered}
                      title={
                        !canRegister && !isRegistered
                          ? "Registration is only available 5-30 days before the event"
                          : ""
                      }>
                      <UserCheck className="h-4 w-4 mr-2" />
                      {isRegistered
                        ? "Registered"
                        : !canRegister
                        ? "Registration Closed"
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
                    onClick={handleBookmarkToggle}>
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

                {/* Register for Event button for non-logged in users on upcoming events */}
                {!user && currentStatus === "upcoming" && canRegister && (
                  <Button
                    onClick={handleRegisterForNonLoggedInUser}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register for Event
                  </Button>
                )}

                {/* Share Event button for other cases */}
                {!(currentStatus === "upcoming" && !user) && (
                  <Button variant="outline" className="w-full" size="lg">
                    Share Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Dialog */}
      {showLoginDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Login Required</h2>
              <button
                onClick={() => setShowLoginDialog(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Please log in to register for this event.
            </p>
            <LoginDialog />
          </div>
        </div>
      )}
    </div>
  );
}
