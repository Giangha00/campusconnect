import { useMemo, useState } from "react";
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
} from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();
  const { getRegistrationsByEvent, getRegistrationCount } = useRegistration();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const isAdmin = user && user.role === "faculty"; // simple guard

  const events = useMemo(() => {
    const list = eventsData as Event[];
    if (!query.trim()) return list;
    const q = query.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }, [query]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = events.reduce(
      (sum, event) => sum + getRegistrationCount(event.id),
      0
    );
    const upcomingEvents = events.filter((e) => e.status === "upcoming").length;
    const eventsWithRegistrations = events.filter(
      (e) => getRegistrationCount(e.id) > 0
    ).length;

    return {
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      eventsWithRegistrations,
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
        {/* Search Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, description, department, venue..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                data-testid="input-admin-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(events as Event[]).map((event) => {
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
      </div>
    </div>
  );
}
