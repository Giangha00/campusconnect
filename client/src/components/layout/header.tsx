import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { LoginDialog } from "@/components/auth/login-dialog";
import { useUser } from "@/contexts/user-context";

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Giới thiệu", href: "/about" },
  { name: "Sự kiện", href: "/events" },
  { name: "Thư viện ảnh", href: "/gallery" },
  { name: "Phản hồi", href: "/feedback" },
  { name: "Liên hệ", href: "/contact" },
];

export function Header() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  // Add bookmarks navigation for authenticated users
  let userNavigation = [...navigation];

  if (user && user.role !== "visitor") {
    userNavigation.push({ name: "Sự kiện đã lưu", href: "/bookmarks" });
  }

  if (user && user.role === "faculty") {
    userNavigation.push({
      name: "Quản lý sự kiện",
      href: "/faculty-dashboard",
    });
  }

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0"
              data-testid="link-home-logo"
            >
              <img
                src="/images/logo.webp"
                alt="CampusConnect Logo"
                className="h-10 w-auto invert"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex items-baseline space-x-4">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  data-testid={`link-nav-${item.name.toLowerCase()}`}
                >
                  <Button
                    variant="ghost"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? "text-primary bg-accent"
                        : "text-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
            <LoginDialog />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="pb-4 border-b">
                    <LoginDialog />
                  </div>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      data-testid={`link-mobile-nav-${item.name.toLowerCase()}`}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-left ${
                          location === item.href
                            ? "text-primary bg-accent"
                            : "text-foreground hover:text-primary hover:bg-accent"
                        }`}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
