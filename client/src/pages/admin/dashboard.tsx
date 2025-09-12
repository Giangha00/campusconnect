import { useMemo } from "react";
import { Link } from "wouter";
import eventsData from "@/data/events.json";
import usersData from "@/data/users.json";
import { Event } from "@/types/event";
import { useAdmin } from "@/contexts/admin-context";
import { useRegistration } from "@/contexts/registration-context";
import {
  calculateEventStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/event-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  CheckCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const { getRegistrationsByEvent } = useRegistration();

  const isAdmin = !!admin;

  const allEventsWithStatus = useMemo(() => {
    return (eventsData as Event[]).map((event) => {
      const status = calculateEventStatus(event);
      return { ...event, status };
    });
  }, []);

  const users = usersData.users;

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
    const totalRegistrations = allEventsWithStatus.reduce(
      (sum, event) => sum + (event.attendees || 0),
      0
    );

    // User statistics
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const adminCount = users.filter((u) => u.role === "admin").length;
    const studentCount = users.filter((u) => u.role === "student").length;

    return {
      events: {
        incoming: incomingEventsCount,
        upcoming: upcomingEventsCount,
        ongoing: ongoingEventsCount,
        completed: completedEventsCount,
        total: allEventsWithStatus.length,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        admin: adminCount,
        student: studentCount,
      },
      registrations: totalRegistrations,
    };
  }, [allEventsWithStatus, users]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNavbar currentPage="dashboard" />

      {/* Hero Section */}
      <div className="pt-20 text-white relative min-h-[100px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-80 "
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
                Welcome back, {admin?.name}. Manage campus events, track
                registrations, and analyze engagement metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Events
                    </p>
                    <p className="text-3xl font-bold">{stats.events.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Total Users
                    </p>
                    <p className="text-3xl font-bold">{stats.users.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Total Registrations
                    </p>
                    <p className="text-3xl font-bold">{stats.registrations}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">
                      Active Users
                    </p>
                    <p className="text-3xl font-bold">{stats.users.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Status Breakdown */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Event Status Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/admin/dashboard/events">
              <Card className="cursor-pointer bg-gradient-to-br from-yellow-300 to-orange-400 text-white transition-all duration-300 hover:scale-105 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Ongoing Events
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.events.ongoing}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-200" />
                  </div>
                  <div className="mt-4 flex items-center text-orange-200">
                    <span className="text-sm">View Details</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/dashboard/events">
              <Card className="cursor-pointer bg-gradient-to-br from-green-300 to-teal-400 text-white transition-all duration-300 hover:scale-105 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Upcoming Events
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.events.upcoming}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-200" />
                  </div>
                  <div className="mt-4 flex items-center text-green-200">
                    <span className="text-sm">View Details</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/dashboard/events">
              <Card className="cursor-pointer bg-gradient-to-br from-blue-300 to-indigo-400 text-white transition-all duration-300 hover:scale-105 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Completed Events
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.events.completed}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="mt-4 flex items-center text-blue-200">
                    <span className="text-sm">View Details</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/dashboard/events">
              <Card className="cursor-pointer bg-gradient-to-br from-gray-300 to-gray-400 text-white transition-all duration-300 hover:scale-105 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm font-medium">
                        Incoming Events
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.events.incoming}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-gray-200" />
                  </div>
                  <div className="mt-4 flex items-center text-gray-200">
                    <span className="text-sm">View Details</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/dashboard/events">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Manage Events
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage all campus events
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/dashboard/users">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Manage Users
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage user accounts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">
                      View detailed analytics and reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
