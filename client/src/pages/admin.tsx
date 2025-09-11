import { useMemo, useState, useEffect } from "react";
import eventsData from "@/data/events.json";
import { Event } from "@/types/event";
import { useUser } from "@/contexts/user-context";
import { useRegistration } from "@/contexts/registration-context";
import {
  calculateEventStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/event-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Eye,
  EyeOff,
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
} from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();
  const { getRegistrationsByEvent, getRegistrationCount } = useRegistration();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const eventsPerPage = 6;

  const isAdmin = user && user.role === "faculty"; // simple guard

  useEffect(() => {
    setCurrentPage(1);
  }, [query, startDate, endDate, statusFilter]);

  const events = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // So sánh ngày, không tính giờ

    let list = (eventsData as Event[]).map((event) => {
      const dateStart = new Date(event.dateStart);
      const dateEnd = new Date(event.dateEnd);

      let status: "incoming" | "upcoming" | "ongoing" | "completed" =
        "completed";

      if (today > dateEnd) {
        status = "completed";
      } else if (today >= dateStart && today <= dateEnd) {
        status = "ongoing";
      } else if (today < dateStart) {
        // Sự kiện trong tương lai
        const registrationStart = event.registrationStart
          ? new Date(event.registrationStart)
          : null;
        const registrationEnd = event.registrationEnd
          ? new Date(event.registrationEnd)
          : null;

        if (
          event.registrationRequired &&
          registrationStart &&
          registrationEnd &&
          today >= registrationStart &&
          today <= registrationEnd
        ) {
          status = "upcoming"; // Đang mở đăng ký
        } else {
          status = "incoming"; // Sắp diễn ra (chưa tới ngày đăng ký, hoặc đã qua, hoặc không cần)
        }
      }
      return { ...event, status };
    });

    const q = query.toLowerCase().trim();

    return list.filter((e) => {
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
  }, [query, startDate, endDate, statusFilter]);

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
    // The number of pages to show is based on:
    // 1 (current) + 2*siblings + firstPage + lastPage + 2*DOTS
    const totalPageNumbers = siblingCount * 2 + 5;

    // Case 1: Number of pages is less than the page numbers we want to show.
    // We just show all the page numbers.
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

    // Case 2: No left dots to show, but rights dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      for (let i = 1; i <= leftItemCount; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } // Case 3: No right dots to show, but left dots to be shown
    else if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      pageNumbers.push(firstPageIndex);
      pageNumbers.push("...");
      for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } // Case 4: Both left and right dots to be shown
    else if (shouldShowLeftDots && shouldShowRightDots) {
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
    const incomingEventsCount = events.filter(
      (e) => e.status === "incoming"
    ).length;
    const upcomingEventsCount = events.filter(
      (e) => calculateEventStatus(e) === "upcoming"
    ).length;
    const ongoingEventsCount = events.filter(
      (e) => calculateEventStatus(e) === "ongoing"
    ).length;
    const completedEventsCount = events.filter(
      (e) => calculateEventStatus(e) === "completed"
    ).length;
    const registrationsForUpcoming = events
      .filter((e) => calculateEventStatus(e) === "upcoming")
      .reduce((sum, event) => sum + getRegistrationCount(event.id), 0);

    return {
      incomingEvents: incomingEventsCount,
      upcomingEvents: upcomingEventsCount,
      ongoingEvents: ongoingEventsCount,
      completedEvents: completedEventsCount,
      registrationsForUpcoming,
    };
  }, [events, getRegistrationCount]);

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
    const headers = [
      "eventId",
      "userId",
      "name",
      "role",
      "department",
      "registeredAt",
    ];
    const rows = regs.map((r) => [
      r.eventId,
      r.userId,
      r.name,
      r.role,
      r.department || "",
      r.registeredAt,
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
    a.download = `registrations-event-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="pt-20 text-white relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-800"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-2xl"
                style={{ textShadow: "0 4px 8px rgba(0,0,0,0.8)" }}
              >
                Admin Dashboard
              </h1>
              <p
                className="text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-lg"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.7)" }}
              >
                Manage campus events, track registrations, and analyze
                engagement metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            className={`cursor-pointer bg-gradient-to-br from-yellow-400 to-orange-500 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "ongoing"
                ? "ring-4 ring-offset-2 ring-yellow-500 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "ongoing" ? "all" : "ongoing"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ongoing Events
              </CardTitle>
              <Activity className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ongoingEvents}</div>
              <p className="text-xs text-white/80">
                Events currently happening
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer bg-gradient-to-br from-green-400 to-teal-500 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "upcoming"
                ? "ring-4 ring-offset-2 ring-green-500 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "upcoming" ? "all" : "upcoming"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-white/80">
                Events open for registration
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer bg-gradient-to-br from-blue-400 to-indigo-500 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "completed"
                ? "ring-4 ring-offset-2 ring-blue-500 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "completed" ? "all" : "completed"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Events
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedEvents}</div>
              <p className="text-xs text-white/80">
                Finished events in selection
              </p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer bg-gradient-to-br from-purple-400 to-pink-500 text-white transition-all duration-300 hover:scale-105 ${
              statusFilter === "upcoming"
                ? "ring-4 ring-offset-2 ring-purple-500 shadow-xl"
                : "shadow-lg"
            }`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === "upcoming" ? "all" : "upcoming"
              )
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Registrations
              </CardTitle>
              <Users className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.registrationsForUpcoming}
              </div>
              <p className="text-xs text-white/80">Total for upcoming events</p>
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
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-admin-start-date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    To
                  </label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-admin-end-date"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(currentEvents as Event[]).map((event) => {
            const count = getRegistrationCount(event.id);
            const isOpen = !!expanded[event.id];
            const registrations = isOpen
              ? getRegistrationsByEvent(event.id)
              : [];
            const capacityPercentage =
              event.capacity && typeof event.capacity === "number"
                ? (count / event.capacity) * 100
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
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title={isOpen ? "Hide registrants" : "View registrants"}
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [event.id]: !prev[event.id],
                          }))
                        }
                        className="h-8 w-8 hover:bg-blue-50 hover:border-blue-200"
                        data-testid={`button-toggle-registrants-${event.id}`}
                      >
                        {isOpen ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Export registrants to CSV"
                        onClick={() => exportCSV(event.id)}
                        className="h-8 w-8 hover:bg-green-50 hover:border-green-200"
                        data-testid={`button-export-csv-${event.id}`}
                      >
                        <Download className="h-4 w-4" />
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
                        className={`${getStatusColor(
                          calculateEventStatus(event)
                        )} border`}
                      >
                        {getStatusLabel(calculateEventStatus(event))}
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
                          {count}
                          {event.capacity && typeof event.capacity === "number"
                            ? `/${event.capacity}`
                            : ""}
                        </span>
                      </div>
                      {event.capacity && typeof event.capacity === "number" && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
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
                              <div className="text-xs text-gray-500">
                                {new Date(r.registeredAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
        {/* End Pagination Controls */}
      </div>
    </div>
  );
}
