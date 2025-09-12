import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Calendar,
  Users,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";

interface AdminNavbarProps {
  currentPage: string;
}

export function AdminNavbar({ currentPage }: AdminNavbarProps) {
  const [, setLocation] = useLocation();
  const { admin, logout } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/admin");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      href: "/admin/dashboard",
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      href: "/admin/dashboard/events",
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      href: "/admin/dashboard/users",
    },
  ];

  const isActive = (itemId: string) => currentPage === itemId;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant={isActive(item.id) ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive(item.id)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {admin?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <span className="hidden lg:block">
                    {admin?.name || "Admin"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {admin?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{admin?.name || "Admin"}</p>
                    <p className="text-sm text-gray-500">
                      {admin?.role || "Admin"}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.id} href={item.href}>
                    <Button
                      variant={isActive(item.id) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.id)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {admin?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {admin?.role || "Admin"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
