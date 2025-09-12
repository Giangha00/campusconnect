import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/user-context";
import { AdminProvider } from "@/contexts/admin-context";
import { RegistrationProvider } from "@/contexts/registration-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/back-to-top";
import Home from "@/pages/home";
import About from "@/pages/about";
import Events from "@/pages/events";
import EventDetail from "@/pages/eventdetail";
import Gallery from "@/pages/gallery";
import Feedback from "@/pages/feedback";
import Contact from "@/pages/contact";
import Bookmarks from "@/pages/bookmarks";
import NotFound from "@/pages/not-found";

import AdminLoginPage from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminEventsPage from "@/pages/admin/events";
import AdminUsersPage from "@/pages/admin/users";

function Router() {
  const [location] = useLocation();

  // Hide header and footer for admin login page
  const isAdminLoginPage = location === "/admin";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAdminLoginPage && <Header />}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/events" component={Events} />
          <Route path="/events/:id" component={EventDetail} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/feedback" component={Feedback} />
          <Route path="/contact" component={Contact} />
          <Route path="/bookmarks" component={Bookmarks} />
          <Route path="/admin" component={AdminLoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/dashboard/events" component={AdminEventsPage} />
          <Route path="/admin/dashboard/users" component={AdminUsersPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAdminLoginPage && <Footer />}
      {!isAdminLoginPage && <BackToTop />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            {/* Provide registration context globally */}
            <RegistrationProvider>
              <Router />
            </RegistrationProvider>
          </TooltipProvider>
        </AdminProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
