import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Event } from "@/types/event";
import { useAdmin } from "@/contexts/admin-context";
import { useUser } from "@/contexts/user-context";
import { useEvents } from "@/contexts/events-context";
import { useRegistration } from "@/contexts/registration-context";
import { useToast } from "@/hooks/use-toast";
import { useValidation } from "@/hooks/use-validation";
import { adminApi, type AdminResponse } from "@/lib/api";
import {
  calculateEventStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/event-status";
import { validateTime, validateCapacity } from "@/lib/validation";
import { formatDate } from "@/lib/date-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SafeText } from "@/components/common/safe-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  Building2,
  User,
  Search,
  BarChart3,
  TrendingUp,
  FileText,
  Shield,
  Activity,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Download,
  ExternalLink,
} from "lucide-react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

// Helper function to get tomorrow's date in YYYY-MM-DD format
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export default function AdminEventsPage() {
  const { admin } = useAdmin();
  const { user } = useUser();
  const { events: eventsData, deleteEvent, createEvent } = useEvents();
  const { getRegistrationsByEvent } = useRegistration();
  const { toast } = useToast();
  const { errors, validate, clearError, clearAllErrors } = useValidation();
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [adminsList, setAdminsList] = useState<AdminResponse[]>([]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<string>("");
  const [newEvent, setNewEvent] = useState({
    name: "",
    dateStart: "",
    dateEnd: "",
    time: "",
    venue: "",
    category: "",
    department: "",
    description: "",
    organizer: "",
    image: "",
    registrationRequired: true,
    capacity: "",
    registrationStart: "",
    registrationEnd: "",
  });
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
  const eventsPerPage = 6;

  // Check if user can create events (Admin or Faculty)
  const isAdmin = !!admin;
  const isFaculty = user?.role === "faculty";
  const canCreateEvents = isAdmin || isFaculty;

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

  // Update time string when startTime or endTime changes
  useEffect(() => {
    const timeString = formatTimeToString(startTime, endTime);
    setNewEvent((prev) => ({
      ...prev,
      time: timeString,
    }));
  }, [startTime, endTime]);

  // Fetch admins list when admin is logged in
  useEffect(() => {
    const fetchAdmins = async () => {
      if (isAdmin) {
        try {
          const admins = await adminApi.getAll();
          setAdminsList(admins);
          if (admin?.id && admins.length > 0) {
            const currentAdmin = admins.find((a) => a.id === admin.id);
            if (currentAdmin) {
              setSelectedOrganizerId(admin.id);
              setNewEvent((prev) => ({
                ...prev,
                organizer: currentAdmin.username || currentAdmin.name,
                department: currentAdmin.department || "", // Auto-fill department from admin's department
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching admins:", error);
        }
      } else if (isFaculty && user?.department) {
        // Auto-fill department for faculty users
        setNewEvent((prev) => ({
          ...prev,
          department: user.department || "",
        }));
      }
    };
    fetchAdmins();
  }, [isAdmin, admin, isFaculty, user]);

  // Handle query parameter for initial filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get("filter");
    if (
      filterParam &&
      ["all", "incoming", "upcoming", "ongoing", "completed"].includes(
        filterParam
      )
    ) {
      setStatusFilter(filterParam);
    }
  }, [location]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, startDate, endDate, statusFilter]);

  const allEventsWithStatus = useMemo(() => {
    return eventsData.map((event) => {
      const status = calculateEventStatus(event as any);
      return { ...event, status };
    });
  }, [eventsData]);

  const events = useMemo(() => {
    let list = allEventsWithStatus;
    const q = query.toLowerCase().trim();

    const filtered = list.filter((e) => {
      const matchesQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);

      const matchesDate =
        (!startDate || e.dateStart >= startDate) &&
        (!endDate || e.dateStart <= endDate);

      const matchesStatus = statusFilter === "all" || e.status === statusFilter;

      return matchesQuery && matchesDate && matchesStatus;
    });

    // Sort by status: ongoing -> upcoming -> incoming -> completed
    // Then by dateStart from nearest to farthest within same status
    const statusOrder: Record<string, number> = {
      ongoing: 1,
      upcoming: 2,
      incoming: 3,
      completed: 4,
    };

    return filtered.sort((a, b) => {
      const statusA = statusOrder[a.status] || 999;
      const statusB = statusOrder[b.status] || 999;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
    });
  }, [allEventsWithStatus, query, startDate, endDate, statusFilter]);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = useMemo(() => {
    return events.slice(indexOfFirstEvent, indexOfLastEvent);
  }, [events, currentPage]);

  const totalPages = Math.ceil(events.length / eventsPerPage);

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];

    const pageNumbers: (number | string)[] = [];
    const siblingCount = 1;
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      for (let i = 1; i <= leftItemCount; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      pageNumbers.push(firstPageIndex);
      pageNumbers.push("...");
      for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      pageNumbers.push(firstPageIndex);
      pageNumbers.push("...");
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(lastPageIndex);
    }

    return pageNumbers;
  }, [totalPages, currentPage]);

  // Calculate statistics
  const stats = useMemo(() => {
    const incomingEventsCount = allEventsWithStatus.filter(
      (e) => e.status === "incoming"
    ).length;
    const upcomingEventsCount = allEventsWithStatus.filter(
      (e) => e.status === "upcoming"
    ).length;
    const ongoingEventsCount = allEventsWithStatus.filter(
      (e) => e.status === "ongoing"
    ).length;
    const completedEventsCount = allEventsWithStatus.filter(
      (e) => e.status === "completed"
    ).length;
    const registrationsForUpcoming = allEventsWithStatus
      .filter((e) => e.status === "upcoming")
      .reduce((sum, event) => sum + (event.attendees || 0), 0);

    return {
      incomingEvents: incomingEventsCount,
      upcomingEvents: upcomingEventsCount,
      ongoingEvents: ongoingEventsCount,
      completedEvents: completedEventsCount,
      registrationsForUpcoming,
    };
  }, [allEventsWithStatus]);

  if (!isAdmin) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="border-red-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Access Denied
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                This admin dashboard is restricted to Faculty members only.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Please contact your administrator if you believe you should
                  have access to this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const exportCSV = (eventId: number) => {
    const regs = getRegistrationsByEvent(eventId);
    const event = allEventsWithStatus.find((e) => e.id === eventId);
    const eventName = event?.name || `Event-${eventId}`;

    // Sanitize event name for filename
    const sanitizedEventName = eventName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const headers = [
      "Name",
      "Email",
      "Role",
      "Department",
      "Ticket Number",
      "Registered At",
      "Checked In",
      "Checked In At",
    ];
    const rows = regs.map((r) => [
      r.name,
      r.email || "",
      r.role,
      r.department || "",
      r.ticket || "",
      new Date(r.registeredAt).toLocaleString(),
      r.checkedIn ? "Yes" : "No",
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${sanitizedEventName}-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Registration list for "${eventName}" has been exported.`,
    });
  };

  const handleEditEvent = (eventId: number) => {
    const event = allEventsWithStatus.find((e) => e.id === eventId);
    if (event?.status === "completed" || event?.status === "ongoing") {
      toast({
        title: "Cannot Edit Event",
        description:
          event?.status === "completed"
            ? "Completed events cannot be edited."
            : "Ongoing events cannot be edited.",
        variant: "destructive",
      });
      return;
    }
    window.location.href = `/admin/dashboard/events/${eventId}?edit=true`;
  };

  const handleDeleteEvent = (event: any) => {
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEvent = () => {
    if (!eventToDelete) return;

    try {
      deleteEvent(eventToDelete.id);

      toast({
        title: "Event Deleted",
        description: `"${eventToDelete.name}" has been successfully deleted.`,
        variant: "destructive",
      });

      setShowDeleteDialog(false);
      setEventToDelete(null);
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
    setEventToDelete(null);
  };

  const handleCreateEvent = () => {
    // Validate all fields
    const isNameValid = validate("event-name", newEvent.name, {
      required: true,
      minLength: 2,
      maxLength: 100,
    });
    const isDateStartValid = validate("event-dateStart", newEvent.dateStart, {
      required: true,
    });
    const isVenueValid = validate("event-venue", newEvent.venue, {
      required: true,
      minLength: 2,
      maxLength: 100,
    });
    const isTimeValid = validate("event-time", newEvent.time, {
      custom: (value) => validateTime(value),
    });
    const isCapacityValid = validate("event-capacity", newEvent.capacity, {
      custom: (value) => validateCapacity(value),
    });

    const isDateEndValid = validate("event-dateEnd", newEvent.dateEnd, {
      required: true,
      custom: (val) => {
        if (newEvent.dateStart && val) {
          if (new Date(val) < new Date(newEvent.dateStart)) {
            return {
              isValid: false,
              message: "End date must be on or after start date",
            };
          }
        }
        return { isValid: true };
      },
    });

    const isRegistrationEndValid = validate(
      "event-registrationEnd",
      newEvent.registrationEnd,
      {
        custom: (val) => {
          if (newEvent.registrationStart && val) {
            if (new Date(val) < new Date(newEvent.registrationStart)) {
              return {
                isValid: false,
                message:
                  "Registration end date must be on or after registration start date",
              };
            }
          }
          return { isValid: true };
        },
      }
    );

    // Validate organizer selection for Admin
    if (isAdmin && !selectedOrganizerId) {
      toast({
        title: "Validation Error",
        description: "Please select an organizer from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    if (
      !isNameValid ||
      !isDateStartValid ||
      !isDateEndValid ||
      !isVenueValid ||
      !isTimeValid ||
      !isCapacityValid ||
      !isRegistrationEndValid
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fix all validation errors before creating the event.",
        variant: "destructive",
      });
      return;
    }

    try {
      const capacity = newEvent.capacity
        ? parseInt(newEvent.capacity)
        : "No limit";

      let organizerId: string | undefined;
      if (isFaculty && user?.id) {
        organizerId = user.id;
      } else if (isAdmin) {
        organizerId = selectedOrganizerId || admin?.id;
      }

      createEvent(
        {
          ...newEvent,
          capacity,
        },
        organizerId
      );

      toast({
        title: "Event Created",
        description: `"${newEvent.name}" has been successfully created.`,
      });

      // Reset form and close dialog
      setNewEvent({
        name: "",
        dateStart: "",
        dateEnd: "",
        time: "",
        venue: "",
        category: "",
        department: "",
        description: "",
        organizer: "",
        image: "",
        registrationRequired: true,
        capacity: "",
        registrationStart: "",
        registrationEnd: "",
      });
      setStartTime({
        hour: "10",
        minute: "00",
        period: "AM",
      });
      setEndTime({
        hour: "6",
        minute: "00",
        period: "PM",
      });
      clearAllErrors();
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearError(`event-${field}`);
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

  const handleInputBlur = (field: string, value: any) => {
    // Validate on blur
    switch (field) {
      case "name":
        validate(`event-${field}`, value, {
          required: true,
          minLength: 2,
          maxLength: 100,
        });
        break;
      case "dateStart":
        validate(`event-${field}`, value, {
          required: true,
        });
        if (newEvent.dateEnd) {
          validate("event-dateEnd", newEvent.dateEnd, {
            required: true,
            custom: (val) => {
              if (val && new Date(val) < new Date(value)) {
                return {
                  isValid: false,
                  message: "End date must be on or after start date",
                };
              }
              return { isValid: true };
            },
          });
        }
        break;
      case "dateEnd":
        validate(`event-${field}`, value, {
          required: true,
          custom: (val) => {
            if (newEvent.dateStart && val) {
              if (new Date(val) < new Date(newEvent.dateStart)) {
                return {
                  isValid: false,
                  message: "End date must be on or after start date",
                };
              }
            }
            return { isValid: true };
          },
        });
        break;
      case "venue":
        validate(`event-${field}`, value, {
          required: true,
          minLength: 2,
          maxLength: 100,
        });
        break;
      case "time":
        validate(`event-${field}`, value, {
          custom: (val) => validateTime(val),
        });
        break;
      case "capacity":
        validate(`event-${field}`, value, {
          custom: (val) => validateCapacity(val),
        });
        break;
      case "registrationStart":
        // Re-validate registrationEnd if it exists
        if (newEvent.registrationEnd) {
          validate("event-registrationEnd", newEvent.registrationEnd, {
            custom: (val) => {
              if (val && new Date(val) < new Date(value)) {
                return {
                  isValid: false,
                  message:
                    "Registration end date must be on or after registration start date",
                };
              }
              return { isValid: true };
            },
          });
        }
        break;
      case "registrationEnd":
        validate(`event-${field}`, value, {
          custom: (val) => {
            if (newEvent.registrationStart && val) {
              if (new Date(val) < new Date(newEvent.registrationStart)) {
                return {
                  isValid: false,
                  message:
                    "Registration end date must be on or after registration start date",
                };
              }
            }
            return { isValid: true };
          },
        });
        break;
    }
  };

  const cancelCreateEvent = () => {
    setShowCreateDialog(false);
    setSelectedOrganizerId("");
    setNewEvent({
      name: "",
      dateStart: "",
      dateEnd: "",
      time: "",
      venue: "",
      category: "",
      department: "",
      description: "",
      organizer: "",
      image: "",
      registrationRequired: true,
      capacity: "",
      registrationStart: "",
      registrationEnd: "",
    });
    setStartTime({
      hour: "10",
      minute: "00",
      period: "AM",
    });
    setEndTime({
      hour: "6",
      minute: "00",
      period: "PM",
    });
    if (isAdmin && admin?.id) {
      setSelectedOrganizerId(admin.id);
      const currentAdmin = adminsList.find((a) => a.id === admin.id);
      if (currentAdmin) {
        setNewEvent((prev) => ({
          ...prev,
          organizer: currentAdmin.username || currentAdmin.name,
        }));
      }
    }
    clearAllErrors();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNavbar currentPage="events" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Event Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage campus events, track registrations, and analyze
                engagement metrics
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new campus event.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Event Name */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="name" className="text-right pt-2">
                      Event Name *
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        value={newEvent.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        onBlur={(e) => handleInputBlur("name", e.target.value)}
                        className={errors["event-name"] ? "border-red-500" : ""}
                        placeholder="Enter event name"
                      />
                      {errors["event-name"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-name"]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Event Description */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="col-span-3 min-h-[100px]"
                      placeholder="Enter event description"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="dateStart" className="text-right pt-2">
                      Start Date *
                    </Label>
                    <div className="col-span-3">
                      <DateInput
                        id="dateStart"
                        value={newEvent.dateStart}
                        onChange={(value) =>
                          handleInputChange("dateStart", value)
                        }
                        onBlur={(e) =>
                          handleInputBlur("dateStart", newEvent.dateStart)
                        }
                        className={
                          errors["event-dateStart"] ? "border-red-500" : ""
                        }
                        placeholder="dd/mm/yyyy"
                      />
                      {errors["event-dateStart"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-dateStart"]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="dateEnd" className="text-right pt-2">
                      End Date *
                    </Label>
                    <div className="col-span-3">
                      <DateInput
                        id="dateEnd"
                        value={newEvent.dateEnd}
                        onChange={(value) =>
                          handleInputChange("dateEnd", value)
                        }
                        onBlur={(e) =>
                          handleInputBlur("dateEnd", newEvent.dateEnd)
                        }
                        className={
                          errors["event-dateEnd"] ? "border-red-500" : ""
                        }
                        placeholder="dd/mm/yyyy"
                      />
                      {errors["event-dateEnd"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-dateEnd"]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="time" className="text-right pt-2">
                      Time
                    </Label>
                    <div className="col-span-3">
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
                                (parseInt(val) >= 1 && parseInt(val) <= 12)
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
                                (parseInt(val) >= 0 && parseInt(val) <= 59)
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
                            }>
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
                                (parseInt(val) >= 1 && parseInt(val) <= 12)
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
                                (parseInt(val) >= 0 && parseInt(val) <= 59)
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
                            }>
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
                      {errors["event-time"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-time"]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Venue and Organizer */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="venue" className="text-right pt-2">
                      Venue *
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="venue"
                        value={newEvent.venue}
                        onChange={(e) =>
                          handleInputChange("venue", e.target.value)
                        }
                        onBlur={(e) => handleInputBlur("venue", e.target.value)}
                        className={
                          errors["event-venue"] ? "border-red-500" : ""
                        }
                        placeholder="Enter venue"
                      />
                      {errors["event-venue"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-venue"]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Organizer field - different behavior for Admin vs Faculty */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="organizer" className="text-right">
                      Organizer
                    </Label>
                    {isAdmin ? (
                      <Select
                        value={selectedOrganizerId}
                        onValueChange={(value) => {
                          setSelectedOrganizerId(value);
                          const selectedAdmin = adminsList.find(
                            (a) => a.id === value
                          );
                          if (selectedAdmin) {
                            setNewEvent((prev) => ({
                              ...prev,
                              organizer:
                                selectedAdmin.username || selectedAdmin.name,
                              department: selectedAdmin.department || "", // Auto-fill department from selected organizer's department
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select an organizer (Admin)" />
                        </SelectTrigger>
                        <SelectContent>
                          {adminsList.map((adminItem) => (
                            <SelectItem key={adminItem.id} value={adminItem.id}>
                              {adminItem.username} ({adminItem.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : isFaculty ? (
                      <Input
                        id="organizer"
                        value={user?.name || "Faculty"}
                        className="col-span-3"
                        disabled
                        readOnly
                      />
                    ) : (
                      <Input
                        id="organizer"
                        value={newEvent.organizer}
                        onChange={(e) =>
                          handleInputChange("organizer", e.target.value)
                        }
                        className="col-span-3"
                        placeholder="Enter organizer"
                      />
                    )}
                  </div>

                  {/* Category and Department */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="col-span-3">
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

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={newEvent.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      className="col-span-3"
                      placeholder="Auto-filled from organizer"
                      readOnly
                      title="Department is automatically set based on the selected organizer"
                    />
                  </div>

                  {/* Registration Settings */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="capacity" className="text-right pt-2">
                      Capacity
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="capacity"
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) =>
                          handleInputChange("capacity", e.target.value)
                        }
                        onBlur={(e) =>
                          handleInputBlur("capacity", e.target.value)
                        }
                        className={
                          errors["event-capacity"] ? "border-red-500" : ""
                        }
                        placeholder="Enter capacity (leave empty for no limit)"
                        min="1"
                      />
                      {errors["event-capacity"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-capacity"]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image" className="text-right">
                      Image URL
                    </Label>
                    <Input
                      id="image"
                      value={newEvent.image}
                      onChange={(e) =>
                        handleInputChange("image", e.target.value)
                      }
                      className="col-span-3"
                      placeholder="Enter image URL"
                    />
                  </div>

                  {/* Registration Dates */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label
                      htmlFor="registrationStart"
                      className="text-right pt-2"
                    >
                      Registration Start
                    </Label>
                    <div className="col-span-3">
                      <DateInput
                        id="registrationStart"
                        value={newEvent.registrationStart}
                        onChange={(value) =>
                          handleInputChange("registrationStart", value)
                        }
                        onBlur={(e) =>
                          handleInputBlur("registrationStart", newEvent.registrationStart)
                        }
                        className="col-span-3"
                        placeholder="dd/mm/yyyy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label
                      htmlFor="registrationEnd"
                      className="text-right pt-2"
                    >
                      Registration End
                    </Label>
                    <div className="col-span-3">
                      <DateInput
                        id="registrationEnd"
                        value={newEvent.registrationEnd}
                        onChange={(value) =>
                          handleInputChange("registrationEnd", value)
                        }
                        onBlur={(e) =>
                          handleInputBlur("registrationEnd", newEvent.registrationEnd)
                        }
                        className={
                          errors["event-registrationEnd"]
                            ? "border-red-500"
                            : ""
                        }
                        placeholder="dd/mm/yyyy"
                      />
                      {errors["event-registrationEnd"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors["event-registrationEnd"]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={cancelCreateEvent}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateEvent}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className={`cursor-pointer  bg-blue-400 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "ongoing"
                ? "ring-4 ring-offset-2 bg-blue-400 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "ongoing" ? "all" : "ongoing"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Ongoing Events
              </CardTitle>
              <Activity className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
                {stats.ongoingEvents}
              </div>
              <p className="text-xs text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Events currently happening
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer bg-blue-400 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "upcoming"
                ? "ring-4 ring-offset-2 bg-blue-400 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "upcoming" ? "all" : "upcoming"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
                {stats.upcomingEvents}
              </div>
              <p className="text-xs text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Events open for registration
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer  bg-blue-400 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "completed"
                ? "ring-4 ring-offset-2 bg-blue-400 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "completed" ? "all" : "completed"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Completed Events
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
                {stats.completedEvents}
              </div>
              <p className="text-xs text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Finished events in selection
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer  bg-blue-400 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "upcoming"
                ? "ring-4 ring-offset-2 bg-blue-400 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "upcoming" ? "all" : "upcoming"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Upcoming Registrations
              </CardTitle>
              <Users className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
                {stats.registrationsForUpcoming}
              </div>
              <p className="text-xs text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Total for upcoming events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Text Search */}
              <div className="flex-grow w-full">
                <label
                  htmlFor="search-text"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Search by keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search-text"
                    placeholder="Name, venue, department..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-admin-search"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-auto">
                <label
                  htmlFor="status-filter"
                  className="text-sm font-medium text-gray-700 mb-1 block"
                >
                  Filter by status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    id="status-filter"
                    className="w-full md:w-[180px]"
                    data-testid="select-admin-status-filter"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Search */}
              <div className="flex gap-2 items-end w-full md:w-auto">
                <div>
                  <label
                    htmlFor="start-date"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    From
                  </label>
                  <DateInput
                    id="start-date"
                    value={startDate}
                    onChange={(value) => setStartDate(value)}
                    data-testid="input-admin-start-date"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    To
                  </label>
                  <DateInput
                    id="end-date"
                    value={endDate}
                    onChange={(value) => setEndDate(value)}
                    data-testid="input-admin-end-date"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event) => {
            const count = event.attendees || 0;
            const isOpen = !!expanded[event.id];
            const registrations = isOpen
              ? getRegistrationsByEvent(event.id)
              : [];
            const checkInCount = event.checkedIn || 0;
            const capacityPercentage =
              event.capacity &&
              typeof event.capacity === "number" &&
              event.capacity > 0
                ? (count / event.capacity) * 100
                : 0;

            const checkInCapacityPercentage =
              event.capacity &&
              typeof event.capacity === "number" &&
              event.capacity > 0
                ? (checkInCount / event.capacity) * 100
                : 0;

            return (
              <Card
                key={event.id}
                data-testid={`card-admin-event-${event.id}`}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <a 
                        href={`/admin/dashboard/events/${event.id}`}
                        className="block"
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && e.button === 0 && !e.shiftKey) {
                            e.preventDefault();
                            setLocation(`/admin/dashboard/events/${event.id}`);
                          }
                        }}
                      >
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer hover:underline">
                          <SafeText>{event.name}</SafeText>
                        </CardTitle>
                      </a>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event.dateStart !== event.dateEnd
                            ? `${formatDate(event.dateStart)} - ${formatDate(
                                event.dateEnd
                              )}`
                            : formatDate(event.dateStart)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(isAdmin || isFaculty) && (
                        <Button
                          variant="outline"
                          size="icon"
                          title="Open event in new tab"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`/admin/dashboard/events/${event.id}`, '_blank');
                          }}
                          className="h-8 w-8 hover:bg-green-50 hover:border-green-200"
                          data-testid={`button-open-new-tab-${event.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        title={
                          event.status === "completed"
                            ? "Cannot edit completed event"
                            : event.status === "ongoing"
                            ? "Cannot edit ongoing event"
                            : "Edit event"
                        }
                        onClick={() => handleEditEvent(event.id)}
                        disabled={
                          event.status === "completed" ||
                          event.status === "ongoing"
                        }
                        className={`h-8 w-8 ${
                          event.status === "completed" ||
                          event.status === "ongoing"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-blue-50 hover:border-blue-200"
                        }`}
                        data-testid={`button-edit-${event.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Delete event"
                        onClick={() => handleDeleteEvent(event)}
                        className="h-8 w-8 hover:bg-red-50 hover:border-red-200"
                        data-testid={`button-delete-${event.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Event Details */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {event.category.charAt(0).toUpperCase() +
                          event.category.slice(1)}
                      </Badge>
                      {event.registrationRequired && (
                        <Badge
                          variant="outline"
                          className="border-orange-200 text-orange-700"
                        >
                          Registration Required
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(event.status)} border`}
                      >
                        {getStatusLabel(event.status)}
                      </Badge>
                    </div>

                    {/* Registration Stats */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Users className="h-4 w-4" />
                          <span>Registrations</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {event.capacity === "No limit" ||
                          (typeof event.capacity === "string" &&
                            event.capacity.toLowerCase() === "no limit")
                            ? "No limit"
                            : `${count}${
                                event.capacity &&
                                typeof event.capacity === "number"
                                  ? `/${event.capacity}`
                                  : ""
                              }`}
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
                          <Users className="h-4 w-4" />
                          <span>Check-ins</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {checkInCount || 0}
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

                    {/* Event Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{event.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{event.organizer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Registrants Section */}
                  {isOpen && (
                    <div
                      className="mt-6 border-t border-gray-200 pt-4"
                      data-testid={`section-registrants-${event.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Registrants ({registrations.length})
                        </h4>
                        {registrations.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportCSV(event.id)}
                            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                            title="Export registrations to CSV"
                            data-testid={`button-export-csv-${event.id}`}
                          >
                            <Download className="h-4 w-4" />
                            Export CSV
                          </Button>
                        )}
                      </div>

                      {registrations.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">
                            No registrants yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {registrations.map((r) => (
                            <div
                              key={r.userId}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {r.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {r.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {r.role}
                                    {r.department ? ` • ${r.department}` : ""}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    r.registeredAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Check-in Progress Bar */}
                  {isOpen && count > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <Users className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">
                            Check-ins
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {checkInCount}/{count}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300 ease-in-out"
                          style={{
                            width: `${
                              count > 0 ? (checkInCount / count) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600">
                          {count > 0
                            ? `${((checkInCount / count) * 100).toFixed(
                                1
                              )}% capacity`
                            : "0% capacity"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {count - checkInCount} pending
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {paginationItems.map((page, index) => {
              if (typeof page === "string") {
                return (
                  <span key={`ellipsis-${index}`} className="px-1">
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                >
                  {page}
                </Button>
              );
            })}
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This
              action cannot be undone.
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
