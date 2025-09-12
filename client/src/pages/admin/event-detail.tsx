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
} from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
import { useEvents } from "@/contexts/events-context";
import { useRegistration } from "@/contexts/registration-context";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AdminNavbar } from "@/components/admin/admin-navbar";

const categoryColors = {
  academic: "bg-primary text-primary-foreground",
  cultural: "bg-secondary text-secondary-foreground",
  sports: "bg-destructive text-destructive-foreground",
  technical: "bg-accent text-accent-foreground",
};

export default function AdminEventDetail() {
  const [, params] = useRoute("/admin/dashboard/events/:id");
  const [location] = useLocation();
  const { admin } = useAdmin();
  const { events, updateEvent, deleteEvent } = useEvents();
  const { getRegistrationsByEvent } = useRegistration();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const eventId = params?.id ? parseInt(params.id) : null;
  const event = events.find((e: any) => e.id === eventId);

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
    }
  }, [event]);

  // Check for edit query parameter and automatically enable edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get("edit");

    if (editParam === "true" && event && editedEvent && !isEditing) {
      console.log("Enabling edit mode automatically from query parameter");
      setIsEditing(true);

      // Remove the edit parameter from the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [event, editedEvent, isEditing]);

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
    setIsEditing(true);
  };

  const handleSaveEvent = () => {
    if (!editedEvent || !event) return;

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
                        {displayEvent?.name}
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
                        {displayEvent?.description}
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
                                className="flex-1"
                                min={new Date().toISOString().split("T")[0]}
                              />
                              <Input
                                type="date"
                                value={editedEvent?.dateEnd || ""}
                                onChange={(e) =>
                                  handleInputChange("dateEnd", e.target.value)
                                }
                                className="flex-1"
                                min={
                                  editedEvent?.dateStart ||
                                  new Date().toISOString().split("T")[0]
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

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Time</p>
                          {isEditing ? (
                            <Input
                              value={editedEvent?.time || ""}
                              onChange={(e) =>
                                handleInputChange("time", e.target.value)
                              }
                              placeholder="e.g., 10:00 AM - 6:00 PM"
                            />
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

                  {isEditing && (
                    <div className="mt-6">
                      <div className="grid md:grid-cols-2 gap-4">
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
                              <SelectItem value="technical">
                                Technical
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="capacity">Capacity</Label>
                          <Input
                            type="number"
                            value={editedEvent?.capacity || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "capacity",
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="Event capacity"
                          />
                        </div>
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Image */}
              <Card className="shadow-lg overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
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
