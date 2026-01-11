import { useMemo } from "react";
import { Link } from "wouter";
// import usersData from "@/data/users.json"; // Backup - keeping for reference
import { Event } from "@/types/event";
import { useAdmin } from "@/contexts/admin-context";
import { useEvents } from "@/contexts/events-context";
import { useUsers } from "@/contexts/users-context";
import {
  calculateEventStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/event-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Shield,
  Download,
  Filter,
} from "lucide-react";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const COLORS = {
  academic: "#3b82f6",
  cultural: "#8b5cf6",
  sports: "#ef4444",
  technical: "#10b981",
};

const STATUS_COLORS = {
  incoming: "#6b7280",
  upcoming: "#10b981",
  ongoing: "#f59e0b",
  completed: "#3b82f6",
};

export default function AdminAnalytics() {
  const { admin } = useAdmin();
  const { events: eventsData } = useEvents();
  const { users } = useUsers();

  const isAdmin = !!admin;

  const allEventsWithStatus = useMemo(() => {
    return eventsData.map((event) => {
      const status = calculateEventStatus(event as any);
      return { ...event, status };
    });
  }, [eventsData]);

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
    const visitorCount = users.filter((u) => u.role === "visitor").length;

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
        visitor: visitorCount,
      },
      registrations: totalRegistrations,
      avgRegistrationsPerEvent:
        allEventsWithStatus.length > 0
          ? (totalRegistrations / allEventsWithStatus.length).toFixed(1)
          : "0",
    };
  }, [allEventsWithStatus, users]);

  // Events by Category Chart Data
  const categoryData = useMemo(() => {
    const categoryCount: Record<string, number> = {
      academic: 0,
      cultural: 0,
      sports: 0,
      technical: 0,
    };

    allEventsWithStatus.forEach((event) => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS],
    }));
  }, [allEventsWithStatus]);

  // Events by Status Chart Data
  const statusData = useMemo(() => {
    return [
      {
        name: "Incoming",
        value: stats.events.incoming,
        color: STATUS_COLORS.incoming,
      },
      {
        name: "Upcoming",
        value: stats.events.upcoming,
        color: STATUS_COLORS.upcoming,
      },
      {
        name: "Ongoing",
        value: stats.events.ongoing,
        color: STATUS_COLORS.ongoing,
      },
      {
        name: "Completed",
        value: stats.events.completed,
        color: STATUS_COLORS.completed,
      },
    ];
  }, [stats.events]);

  // User Role Distribution
  const userRoleData = useMemo(() => {
    return [
      {
        name: "Students",
        value: stats.users.student,
        color: "#3b82f6",
      },
      {
        name: "Faculty",
        value: stats.users.admin,
        color: "#10b981",
      },
      {
        name: "Visitors",
        value: stats.users.visitor,
        color: "#8b5cf6",
      },
    ];
  }, [stats.users]);

  // Top Events by Registrations
  const topEvents = useMemo(() => {
    return allEventsWithStatus
      .map((event) => ({
        name:
          event.name.length > 20
            ? event.name.substring(0, 20) + "..."
            : event.name,
        registrations: event.attendees || 0,
        category: event.category,
      }))
      .sort((a, b) => b.registrations - a.registrations)
      .slice(0, 10);
  }, [allEventsWithStatus]);

  // Events by Month (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      months[monthKey] = 0;
    }

    allEventsWithStatus.forEach((event) => {
      const eventDate = new Date(event.dateStart);
      const monthKey = eventDate.toLocaleDateString("en-US", {
        month: "short",
      });
      if (months.hasOwnProperty(monthKey)) {
        months[monthKey]++;
      }
    });

    return Object.entries(months).map(([name, value]) => ({
      name,
      events: value,
    }));
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
                This analytics page is restricted to Faculty members only.
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
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="analytics" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">
                  Detailed insights and reports for campus events
                </p>
              </div>
            </div>
            {/* <div className="flex gap-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold">{stats.events.total}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-bold">{stats.registrations}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. per Event</p>
                    <p className="text-2xl font-bold">
                      {stats.avgRegistrationsPerEvent}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{stats.users.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Events by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Events by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Events Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Events Over Time (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="events"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Events"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userRoleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Events by Registrations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top Events by Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topEvents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="registrations"
                  fill="#3b82f6"
                  name="Registrations"
                >
                  {topEvents.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[entry.category as keyof typeof COLORS] ||
                        "#3b82f6"
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="registrations"
                    position="right"
                    style={{ fontSize: "12px", fill: "#374151" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Events</span>
                <span className="font-bold">{stats.events.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Incoming Events</span>
                <span className="font-bold">{stats.events.incoming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Upcoming Events</span>
                <span className="font-bold">{stats.events.upcoming}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ongoing Events</span>
                <span className="font-bold">{stats.events.ongoing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Events</span>
                <span className="font-bold">{stats.events.completed}</span>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-bold">{stats.users.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-bold">{stats.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Students</span>
                <span className="font-bold">{stats.users.student}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Faculty</span>
                <span className="font-bold">{stats.users.admin}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Visitors</span>
                <span className="font-bold">{stats.users.visitor}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
