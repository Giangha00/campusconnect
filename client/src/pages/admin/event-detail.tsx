import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft,
  Calendar,
  Building2,
  UserCheck,
  Download,
  Edit,
  Trash2,
  Save,
  X,
  MessageSquare,
  Star,
  Hash,
  Image as ImageIcon,
  UsersRound,
} from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
import { useEvents } from "@/contexts/events-context";
import { useRegistration } from "@/contexts/registration-context";
import { useFeedback } from "@/contexts/feedback-context";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import {
  SafeText,
  sanitizeAttribute,
  safeUrl,
} from "@/components/common/safe-text";

const categoryColors = {
  academic: "bg-primary text-primary-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  sports: "bg-destructive text-destructive-foreground",
  technical: "bg-accent text-accent-foreground",
};

// Helper function to get tomorrow's date in YYYY-MM-DD format
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export default function AdminEventDetail() {
  const [, params] = useRoute("/admin/dashboard/events/:id");
  const [location] = useLocation();
  const { admin } = useAdmin();
  const { events, updateEvent, deleteEvent } = useEvents();
  const { getRegistrationsByEvent } = useRegistration();
  const { getFeedbacksByEvent } = useFeedback();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [startTime, setStartTime] = useState({
    hour: "10",
    minute: "00",
    period: "AM",
  });
  const [endTime, setEndTime] = useState({
    hour: "6",
    minute: "00",
    period: "PM",
  });

  const eventId = params?.id ? parseInt(params.id) : null;
  const event = events.find((e: any) => e.id === eventId);

  // Helper function to parse time string and extract start/end times
  const parseTimeToState = (timeString: string | null | undefined) => {
    if (!timeString) {
      return {
        start: { hour: "10", minute: "00", period: "AM" },
        end: { hour: "6", minute: "00", period: "PM" },
      };
    }

    // Match full time range format: "10:00 AM - 6:00 PM"
    const timeRangePattern =
      /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const rangeMatch = timeString.match(timeRangePattern);

    if (rangeMatch) {
      return {
        start: {
          hour: rangeMatch[1],
          minute: rangeMatch[2],
          period: rangeMatch[3].toUpperCase(),
        },
        end: {
          hour: rangeMatch[4],
          minute: rangeMatch[5],
          period: rangeMatch[6].toUpperCase(),
        },
      };
    }

    // Match single time format: "08:00 AM"
    const singleTimePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const singleMatch = timeString.match(singleTimePattern);

    if (singleMatch) {
      return {
        start: {
          hour: singleMatch[1],
          minute: singleMatch[2],
          period: singleMatch[3].toUpperCase(),
        },
        end: { hour: "11", minute: "59", period: "PM" },
      };
    }

    // Default values if parsing fails
    return {
      start: { hour: "10", minute: "00", period: "AM" },
      end: { hour: "6", minute: "00", period: "PM" },
    };
  };

  // Helper function to format time state to string
  const formatTimeToString = (start: any, end: any): string => {
    const startStr = `${start.hour}:${start.minute} ${start.period}`;
    const endStr = `${end.hour}:${end.minute} ${end.period}`;
    return `${startStr} - ${endStr}`;
  };

  // Debug logging
  useEffect(() => {
    console.log("Event Detail Debug:", {
      eventId,
      event: event?.name,
      eventsLength: events.length,
      isEditing,
      location,
      urlParams: window.location.search,
    });
  }, [eventId, event, events.length, isEditing, location]);

  // Initialize edited event data when event is found
  useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
      const parsed = parseTimeToState(event.time);
      setStartTime(parsed.start);
      setEndTime(parsed.end);
    }
  }, [event]);

  // Check for edit query parameter and automatically enable edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get("edit");

    if (editParam === "true" && event && editedEvent && !isEditing) {
      // Check if event is completed or ongoing - don't allow editing
      const status = calculateEventStatus(event as any);
      if (status === "completed" || status === "ongoing") {
        toast({
          title: "Cannot Edit Event",
          description:
            status === "completed"
              ? "Completed events cannot be edited."
              : "Ongoing events cannot be edited.",
          variant: "destructive",
        });
        // Remove the edit parameter from the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
        return;
      }

      console.log("Enabling edit mode automatically from query parameter");
      setIsEditing(true);

      // Remove the edit parameter from the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [event, editedEvent, isEditing, toast]);

  // Update time string when startTime or endTime changes
  useEffect(() => {
    if (isEditing && editedEvent) {
      const timeString = formatTimeToString(startTime, endTime);
      setEditedEvent((prev: any) => ({
        ...prev,
        time: timeString,
      }));
    }
  }, [startTime, endTime, isEditing]);

  // Calculate current status based on dates
  const currentStatus = event ? calculateEventStatus(event as any) : null;

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            Please log in as admin to view this page.
          </p>
          <Link href="/admin">
            <Button>Go to Admin Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AdminNavbar currentPage="events" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Event Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The requested event could not be found.
            </p>
            <Link href="/admin/dashboard/events">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayEvent = isEditing ? editedEvent : event;
  const registrations = getRegistrationsByEvent(event.id);
  const checkInCount = displayEvent?.checkedIn || 0;
  const count = displayEvent?.attendees || 0;
  const eventFeedbacks = event ? getFeedbacksByEvent(event.name) : [];
  const capacityPercentage =
    event.capacity && typeof event.capacity === "number" && event.capacity > 0
      ? (count / event.capacity) * 100
      : 0;

  const checkInCapacityPercentage =
    event.capacity && typeof event.capacity === "number" && event.capacity > 0
      ? (checkInCount / event.capacity) * 100
      : 0;

  const exportRegistrationsCSV = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Department", "Registered At"].join(","),
      ...registrations.map((r) =>
        [
          r.name,
          r.email,
          r.role,
          r.department || "",
          new Date(r.registeredAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-event-${event.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditEvent = () => {
    if (currentStatus === "completed" || currentStatus === "ongoing") {
      toast({
        title: "Cannot Edit Event",
        description:
          currentStatus === "completed"
            ? "Completed events cannot be edited."
            : "Ongoing events cannot be edited.",
        variant: "destructive",
      });
      return;
    }
    setIsEditing(true);
  };

  const handleSaveEvent = () => {
    if (!editedEvent || !event) return;

    // Helper function to check if string is empty or only whitespace
    const isEmpty = (str: string | null | undefined): boolean => {
      return !str || str.trim().length === 0;
    };

    // Validate required fields
    if (isEmpty(editedEvent.name)) {
      toast({
        title: "Validation Error",
        description: "Event name is required and cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!editedEvent.dateStart) {
      toast({
        title: "Validation Error",
        description: "Event start date is required.",
        variant: "destructive",
      });
      return;
    }

    if (!editedEvent.dateEnd) {
      toast({
        title: "Validation Error",
        description: "Event end date is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate dates - must be greater than today (from tomorrow onwards)
    // Get today's date in local timezone (YYYY-MM-DD format for accurate comparison)
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    const today = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0);

    // Parse date strings to Date objects in local timezone
    let dateStart: Date | null = null;
    let dateEnd: Date | null = null;

    if (editedEvent.dateStart) {
      // Parse YYYY-MM-DD format to local date
      const [year, month, day] = editedEvent.dateStart.split("-").map(Number);
      dateStart = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    if (editedEvent.dateEnd) {
      // Parse YYYY-MM-DD format to local date
      const [year, month, day] = editedEvent.dateEnd.split("-").map(Number);
      dateEnd = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    // Calculate tomorrow's date
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStart) {
      // Event start date must be from tomorrow onwards (strictly after today)
      if (dateStart.getTime() <= today.getTime()) {
        toast({
          title: "Invalid Date",
          description:
            "Event start date must be from tomorrow onwards. Today and past dates are not allowed.",
          variant: "destructive",
        });
        return;
      }
    }

    if (dateEnd) {
      // Event end date must be from tomorrow onwards (strictly after today)
      if (dateEnd.getTime() <= today.getTime()) {
        toast({
          title: "Invalid Date",
          description:
            "Event end date must be from tomorrow onwards. Today and past dates are not allowed.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate that end date is not before start date
    if (dateStart && dateEnd && dateEnd < dateStart) {
      toast({
        title: "Invalid Date Range",
        description:
          "Event end date must be greater than or equal to start date.",
        variant: "destructive",
      });
      return;
    }

    // Validate text fields (not empty or only whitespace)
    if (isEmpty(editedEvent.venue)) {
      toast({
        title: "Validation Error",
        description: "Venue is required and cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (isEmpty(editedEvent.department)) {
      toast({
        title: "Validation Error",
        description: "Department is required and cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (isEmpty(editedEvent.organizer)) {
      toast({
        title: "Validation Error",
        description: "Organizer is required and cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    // Validate category
    if (
      !editedEvent.category ||
      !["academic", "cultural", "sports", "technical"].includes(
        editedEvent.category
      )
    ) {
      toast({
        title: "Validation Error",
        description: "Please select a valid category.",
        variant: "destructive",
      });
      return;
    }

    // Validate capacity if provided
    if (
      editedEvent.capacity !== undefined &&
      editedEvent.capacity !== null &&
      editedEvent.capacity !== ""
    ) {
      const capacity =
        typeof editedEvent.capacity === "string"
          ? parseInt(editedEvent.capacity)
          : editedEvent.capacity;

      if (isNaN(capacity) || capacity < 1) {
        toast({
          title: "Validation Error",
          description: "Capacity must be a positive number greater than 0.",
          variant: "destructive",
        });
        return;
      }

      // Validate that attendees don't exceed capacity
      const currentAttendees = editedEvent.attendees || event.attendees || 0;
      if (currentAttendees > capacity) {
        toast({
          title: "Validation Error",
          description: `Current attendees (${currentAttendees}) cannot exceed capacity (${capacity}). Please increase capacity or reduce attendees.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate registration dates if registration is required
    if (editedEvent.registrationRequired) {
      if (editedEvent.registrationStart && editedEvent.registrationEnd) {
        // Parse registration dates in local timezone
        let regStart: Date | null = null;
        let regEnd: Date | null = null;

        if (editedEvent.registrationStart) {
          const [year, month, day] = editedEvent.registrationStart
            .split("-")
            .map(Number);
          regStart = new Date(year, month - 1, day, 0, 0, 0, 0);
        }

        if (editedEvent.registrationEnd) {
          const [year, month, day] = editedEvent.registrationEnd
            .split("-")
            .map(Number);
          regEnd = new Date(year, month - 1, day, 0, 0, 0, 0);
        }

        // Registration end must be after registration start
        if (regStart && regEnd && regEnd.getTime() < regStart.getTime()) {
          toast({
            title: "Invalid Registration Date Range",
            description:
              "Registration end date must be after registration start date.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Validate time format and values (optional but should be valid if provided)
    if (editedEvent.time && editedEvent.time.trim()) {
      const timeStr = editedEvent.time.trim();

      // Match full time range format: "10:00 AM - 6:00 PM"
      const timeRangePattern =
        /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
      const rangeMatch = timeStr.match(timeRangePattern);

      // Match single time format: "08:00 AM"
      const singleTimePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
      const singleMatch = timeStr.match(singleTimePattern);

      if (rangeMatch) {
        // Validate time range format
        const startHour = parseInt(rangeMatch[1], 10);
        const startMinute = parseInt(rangeMatch[2], 10);
        const startPeriod = rangeMatch[3].toUpperCase();
        const endHour = parseInt(rangeMatch[4], 10);
        const endMinute = parseInt(rangeMatch[5], 10);
        const endPeriod = rangeMatch[6].toUpperCase();

        // Validate hour range (1-12)
        if (startHour < 1 || startHour > 12 || endHour < 1 || endHour > 12) {
          toast({
            title: "Invalid Time",
            description: "Hour must be between 1 and 12.",
            variant: "destructive",
          });
          return;
        }

        // Validate minute range (0-59)
        if (
          startMinute < 0 ||
          startMinute > 59 ||
          endMinute < 0 ||
          endMinute > 59
        ) {
          toast({
            title: "Invalid Time",
            description: "Minute must be between 0 and 59.",
            variant: "destructive",
          });
          return;
        }

        // Convert to 24-hour format for comparison
        let startHour24 = startHour;
        if (startPeriod === "PM" && startHour !== 12) {
          startHour24 += 12;
        } else if (startPeriod === "AM" && startHour === 12) {
          startHour24 = 0;
        }

        let endHour24 = endHour;
        if (endPeriod === "PM" && endHour !== 12) {
          endHour24 += 12;
        } else if (endPeriod === "AM" && endHour === 12) {
          endHour24 = 0;
        }

        // Calculate total minutes for comparison
        const startTotalMinutes = startHour24 * 60 + startMinute;
        const endTotalMinutes = endHour24 * 60 + endMinute;

        // Validate that end time is after start time
        if (endTotalMinutes <= startTotalMinutes) {
          toast({
            title: "Invalid Time Range",
            description: "End time must be after start time.",
            variant: "destructive",
          });
          return;
        }
      } else if (singleMatch) {
        // Validate single time format
        const hour = parseInt(singleMatch[1], 10);
        const minute = parseInt(singleMatch[2], 10);

        // Validate hour range (1-12)
        if (hour < 1 || hour > 12) {
          toast({
            title: "Invalid Time",
            description: "Hour must be between 1 and 12.",
            variant: "destructive",
          });
          return;
        }

        // Validate minute range (0-59)
        if (minute < 0 || minute > 59) {
          toast({
            title: "Invalid Time",
            description: "Minute must be between 0 and 59.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Invalid format
        toast({
          title: "Invalid Time Format",
          description:
            "Time format should be like '10:00 AM - 6:00 PM' or '10:00 AM'.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Update the event using the context
      updateEvent(event.id, editedEvent);

      toast({
        title: "Event Updated",
        description: "Event has been successfully updated.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedEvent(event ? { ...event } : null);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedEvent((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    // Update time string when start/end time changes
    if (field === "time") {
      const parsed = parseTimeToState(value);
      setStartTime(parsed.start);
      setEndTime(parsed.end);
    }
  };

  const handleTimeChange = (
    type: "start" | "end",
    field: "hour" | "minute" | "period",
    value: string
  ) => {
    if (type === "start") {
      setStartTime((prev) => ({ ...prev, [field]: value }));
    } else {
      setEndTime((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDeleteEvent = () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteEvent = () => {
    if (!event) return;

    try {
      // Delete the event using the context
      deleteEvent(event.id);

      toast({
        title: "Event Deleted",
        description: `"${event.name}" has been successfully deleted.`,
        variant: "destructive",
      });

      setShowDeleteDialog(false);

      // Navigate back to events list
      setLocation("/admin/dashboard/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelDeleteEvent = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="events" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto mb-6">
          <Link href="/admin/dashboard/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Event Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Event Details
                  </h2>
                  <div className="flex items-center gap-3 mb-6">
                    <Badge
                      className={`${
                        categoryColors[
                          event.category as keyof typeof categoryColors
                        ]
                      } text-sm px-3 py-1`}
                    >
                      {event.category.charAt(0).toUpperCase() +
                        event.category.slice(1)}
                    </Badge>
                    <Badge
                      className={`${getStatusColor(
                        currentStatus || "completed"
                      )} text-sm px-3 py-1`}
                    >
                      {getStatusLabel(currentStatus || "completed")}
                    </Badge>
                    {event.registrationRequired && (
                      <Badge
                        variant="outline"
                        className="border-orange-200 text-orange-700 bg-orange-50"
                      >
                        Registration Required
                      </Badge>
                    )}
                  </div>

                  {/* Event Name */}
                  <div className="mb-6">
                    <Label
                      htmlFor="event-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Event Name *
                    </Label>
                    {isEditing ? (
                      <Input
                        id="event-name"
                        value={editedEvent?.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="mt-1 text-lg"
                        placeholder="Enter event name"
                      />
                    ) : (
                      <h3 className="text-xl font-semibold text-gray-900 mt-1">
                        <SafeText>{displayEvent?.name}</SafeText>
                      </h3>
                    )}
                  </div>

                  {/* Event Description */}
                  <div className="mb-6">
                    <Label
                      htmlFor="event-description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="event-description"
                        value={editedEvent?.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="mt-1 min-h-[150px]"
                        placeholder="Enter event description"
                      />
                    ) : (
                      <p className="text-gray-700 mt-1 leading-relaxed">
                        <SafeText>{displayEvent?.description}</SafeText>
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Date</p>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={editedEvent?.dateStart || ""}
                                onChange={(e) =>
                                  handleInputChange("dateStart", e.target.value)
                                }
                                onKeyDown={(e) => {
                                  // Prevent typing in date input, but allow navigation keys
                                  if (
                                    e.key !== "Tab" &&
                                    e.key !== "Enter" &&
                                    e.key !== "Escape" &&
                                    !e.key.startsWith("Arrow") &&
                                    !e.key.startsWith("Page") &&
                                    e.key !== "Home" &&
                                    e.key !== "End"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => {
                                  // Prevent pasting into date input
                                  e.preventDefault();
                                }}
                                onInput={(e) => {
                                  // Prevent direct text input
                                  const target = e.target as HTMLInputElement;
                                  if (
                                    target.value &&
                                    !target.value.match(/^\d{4}-\d{2}-\d{2}$/)
                                  ) {
                                    target.value = editedEvent?.dateStart || "";
                                  }
                                }}
                                className="flex-1"
                                min={getTomorrowDate()}
                              />
                              <Input
                                type="date"
                                value={editedEvent?.dateEnd || ""}
                                onChange={(e) =>
                                  handleInputChange("dateEnd", e.target.value)
                                }
                                onKeyDown={(e) => {
                                  // Prevent typing in date input, but allow navigation keys
                                  if (
                                    e.key !== "Tab" &&
                                    e.key !== "Enter" &&
                                    e.key !== "Escape" &&
                                    !e.key.startsWith("Arrow") &&
                                    !e.key.startsWith("Page") &&
                                    e.key !== "Home" &&
                                    e.key !== "End"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => {
                                  // Prevent pasting into date input
                                  e.preventDefault();
                                }}
                                onInput={(e) => {
                                  // Prevent direct text input
                                  const target = e.target as HTMLInputElement;
                                  if (
                                    target.value &&
                                    !target.value.match(/^\d{4}-\d{2}-\d{2}$/)
                                  ) {
                                    target.value = editedEvent?.dateEnd || "";
                                  }
                                }}
                                className="flex-1"
                                min={
                                  editedEvent?.dateStart || getTomorrowDate()
                                }
                              />
                            </div>
                          ) : (
                            <p className="font-medium">
                              {formatDate(displayEvent?.dateStart)} -{" "}
                              {formatDate(displayEvent?.dateEnd)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-6" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-2">Time</p>
                          {isEditing ? (
                            <div className="flex flex-wrap gap-2 items-center">
                              {/* Start Time */}
                              <div className="flex gap-1 items-center">
                                <Input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={startTime.hour}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                      val === "" ||
                                      (parseInt(val) >= 1 &&
                                        parseInt(val) <= 12)
                                    ) {
                                      handleTimeChange("start", "hour", val);
                                    }
                                  }}
                                  className="w-16 text-center px-2 text-base"
                                  placeholder="HH"
                                  style={{ minWidth: "64px" }}
                                />
                                <span className="text-gray-500">:</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={startTime.minute}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                      val === "" ||
                                      (parseInt(val) >= 0 &&
                                        parseInt(val) <= 59)
                                    ) {
                                      handleTimeChange(
                                        "start",
                                        "minute",
                                        val.padStart(2, "0")
                                      );
                                    }
                                  }}
                                  className="w-16 text-center px-2 text-base"
                                  placeholder="MM"
                                  style={{ minWidth: "64px" }}
                                />
                                <Select
                                  value={startTime.period}
                                  onValueChange={(value) =>
                                    handleTimeChange("start", "period", value)
                                  }
                                >
                                  <SelectTrigger className="w-[70px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <span className="text-gray-500">-</span>
                              {/* End Time */}
                              <div className="flex gap-1 items-center">
                                <Input
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={endTime.hour}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                      val === "" ||
                                      (parseInt(val) >= 1 &&
                                        parseInt(val) <= 12)
                                    ) {
                                      handleTimeChange("end", "hour", val);
                                    }
                                  }}
                                  className="w-16 text-center px-2 text-base"
                                  placeholder="HH"
                                  style={{ minWidth: "64px" }}
                                />
                                <span className="text-gray-500">:</span>
                                <Input
                                  type="number"
                                  min="0"
                                  max="59"
                                  value={endTime.minute}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                      val === "" ||
                                      (parseInt(val) >= 0 &&
                                        parseInt(val) <= 59)
                                    ) {
                                      handleTimeChange(
                                        "end",
                                        "minute",
                                        val.padStart(2, "0")
                                      );
                                    }
                                  }}
                                  className="w-16 text-center px-2 text-base"
                                  placeholder="MM"
                                  style={{ minWidth: "64px" }}
                                />
                                <Select
                                  value={endTime.period}
                                  onValueChange={(value) =>
                                    handleTimeChange("end", "period", value)
                                  }
                                >
                                  <SelectTrigger className="w-[70px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <p className="font-medium">{displayEvent?.time}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Venue</p>
                          {isEditing ? (
                            <Input
                              value={editedEvent?.venue || ""}
                              onChange={(e) =>
                                handleInputChange("venue", e.target.value)
                              }
                              placeholder="Event venue"
                            />
                          ) : (
                            <p className="font-medium">{displayEvent?.venue}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Department</p>
                          {isEditing ? (
                            <Input
                              value={editedEvent?.department || ""}
                              onChange={(e) =>
                                handleInputChange("department", e.target.value)
                              }
                              placeholder="Department name"
                            />
                          ) : (
                            <p className="font-medium">
                              {displayEvent?.department}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Organizer</p>
                        {isEditing ? (
                          <Input
                            value={editedEvent?.organizer || ""}
                            onChange={(e) =>
                              handleInputChange("organizer", e.target.value)
                            }
                            placeholder="Event organizer"
                          />
                        ) : (
                          <p className="font-medium">
                            {displayEvent?.organizer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Registration Dates - Show if registration dates exist */}
                  {(displayEvent?.registrationStart ||
                    displayEvent?.registrationEnd) && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Registration Period
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">
                              Registration Start Date
                            </p>
                            {isEditing ? (
                              <Input
                                type="date"
                                value={editedEvent?.registrationStart || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "registrationStart",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key !== "Tab" &&
                                    e.key !== "Enter" &&
                                    e.key !== "Escape" &&
                                    !e.key.startsWith("Arrow") &&
                                    !e.key.startsWith("Page") &&
                                    e.key !== "Home" &&
                                    e.key !== "End"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                }}
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  if (
                                    target.value &&
                                    !target.value.match(/^\d{4}-\d{2}-\d{2}$/)
                                  ) {
                                    target.value =
                                      editedEvent?.registrationStart || "";
                                  }
                                }}
                                className="mt-1"
                              />
                            ) : (
                              <p className="font-medium">
                                {displayEvent.registrationStart
                                  ? formatDate(displayEvent.registrationStart)
                                  : "Not set"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">
                              Registration End Date
                            </p>
                            {isEditing ? (
                              <Input
                                type="date"
                                value={editedEvent?.registrationEnd || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "registrationEnd",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key !== "Tab" &&
                                    e.key !== "Enter" &&
                                    e.key !== "Escape" &&
                                    !e.key.startsWith("Arrow") &&
                                    !e.key.startsWith("Page") &&
                                    e.key !== "Home" &&
                                    e.key !== "End"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                }}
                                onInput={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  if (
                                    target.value &&
                                    !target.value.match(/^\d{4}-\d{2}-\d{2}$/)
                                  ) {
                                    target.value =
                                      editedEvent?.registrationEnd || "";
                                  }
                                }}
                                className="mt-1"
                                min={
                                  editedEvent?.registrationStart ||
                                  getTomorrowDate()
                                }
                              />
                            ) : (
                              <p className="font-medium">
                                {displayEvent.registrationEnd
                                  ? formatDate(displayEvent.registrationEnd)
                                  : "Not set"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Event Information */}
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Additional Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Event ID */}
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Event ID</p>
                          <p className="font-medium text-gray-900">
                            #{displayEvent?.id}
                          </p>
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center gap-3">
                        <UsersRound className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Capacity</p>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedEvent?.capacity || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "capacity",
                                  e.target.value === ""
                                    ? ""
                                    : parseInt(e.target.value)
                                )
                              }
                              placeholder="Event capacity"
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium text-gray-900">
                              {displayEvent?.capacity &&
                              typeof displayEvent.capacity === "number"
                                ? `${displayEvent.capacity} people`
                                : displayEvent?.capacity || "No limit"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Attendees */}
                      {displayEvent?.attendees !== undefined && (
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Attendees</p>
                            <p className="font-medium text-gray-900">
                              {displayEvent.attendees}
                              {displayEvent?.capacity &&
                              typeof displayEvent.capacity === "number"
                                ? ` / ${displayEvent.capacity}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Checked In */}
                      {displayEvent?.checkedIn !== undefined && (
                        <div className="flex items-center gap-3">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Checked In</p>
                            <p className="font-medium text-gray-900">
                              {displayEvent.checkedIn}
                              {displayEvent?.capacity &&
                              typeof displayEvent.capacity === "number"
                                ? ` / ${displayEvent.capacity}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Image URL */}
                      {displayEvent?.image && (
                        <div className="flex items-start gap-3 md:col-span-2">
                          <ImageIcon className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">
                              Image URL
                            </p>
                            {isEditing ? (
                              <Input
                                value={editedEvent?.image || ""}
                                onChange={(e) =>
                                  handleInputChange("image", e.target.value)
                                }
                                placeholder="Event image URL"
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1">
                                <p className="font-medium text-gray-900 break-all text-sm">
                                  {displayEvent.image}
                                </p>
                                <a
                                  href={safeUrl(
                                    displayEvent.image,
                                    undefined,
                                    false
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                                >
                                  Open image in new tab
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={editedEvent?.category || ""}
                          onValueChange={(value) =>
                            handleInputChange("category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration Stats */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Registration Statistics
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Registration Stats */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Users className="h-4 w-4" />
                          <span>Registrations</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {count}
                          {event.capacity && typeof event.capacity === "number"
                            ? `/${event.capacity}`
                            : ""}
                        </span>
                      </div>
                      {event.capacity && typeof event.capacity === "number" && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(capacityPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      )}
                      {event.capacity && typeof event.capacity === "number" && (
                        <div className="text-xs text-gray-500 mt-1">
                          {capacityPercentage.toFixed(1)}% capacity
                        </div>
                      )}
                    </div>

                    {/* Check-in Stats */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <UserCheck className="h-4 w-4" />
                          <span>Check-ins</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {checkInCount}
                          {event.capacity && typeof event.capacity === "number"
                            ? `/${event.capacity}`
                            : ""}
                        </span>
                      </div>
                      {event.capacity && typeof event.capacity === "number" && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                checkInCapacityPercentage,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      )}
                      {event.capacity && typeof event.capacity === "number" && (
                        <div className="text-xs text-gray-500 mt-1">
                          {checkInCapacityPercentage.toFixed(1)}% capacity
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Feedbacks */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Event Feedbacks
                  </h2>

                  {eventFeedbacks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        No feedbacks yet for this event
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {eventFeedbacks.map((feedback) => (
                        <div
                          key={feedback.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  <SafeText>{feedback.name}</SafeText>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {feedback.userType}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                <SafeText>{feedback.email}</SafeText>
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < feedback.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            <SafeText>{feedback.feedback}</SafeText>
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(
                              new Date(feedback.createdAt)
                                .toISOString()
                                .split("T")[0]
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {eventFeedbacks.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                      Total: {eventFeedbacks.length} feedback
                      {eventFeedbacks.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Image */}
              <Card className="shadow-lg overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <img
                    src={
                      safeUrl(event.image, undefined, false) ||
                      "/images/schools/School_1.jpg"
                    }
                    alt={sanitizeAttribute(event.name)}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveEvent} className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          className="w-full"
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleEditEvent}
                          className="w-full"
                          variant="outline"
                          disabled={
                            currentStatus === "completed" ||
                            currentStatus === "ongoing"
                          }
                          title={
                            currentStatus === "completed"
                              ? "Cannot edit completed event"
                              : currentStatus === "ongoing"
                              ? "Cannot edit ongoing event"
                              : "Edit Event"
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Event
                        </Button>
                        <Button
                          onClick={handleDeleteEvent}
                          className="w-full"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Event
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event?.name}"? This action
              cannot be undone.
              <br />
              <br />
              <strong>Warning:</strong> All event data, registrations, and
              check-in information will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteEvent}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvent}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
