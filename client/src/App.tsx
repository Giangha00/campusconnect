import { lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/user-context";
import { AdminProvider } from "@/contexts/admin-context";
import { EventsProvider } from "@/contexts/events-context";
import { UsersProvider } from "@/contexts/users-context";
import { RegistrationProvider } from "@/contexts/registration-context";
import { FeedbackProvider } from "@/contexts/feedback-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackToTop } from "@/components/back-to-top";
import { ErrorBoundary } from "@/components/error-boundary";

// ✅ Lazy load các pages để giảm initial bundle size
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Events = lazy(() => import("@/pages/events"));
const EventDetail = lazy(() => import("@/pages/eventdetail"));
const Gallery = lazy(() => import("@/pages/gallery"));
const Feedback = lazy(() => import("@/pages/feedback"));
const Contact = lazy(() => import("@/pages/contact"));
const Bookmarks = lazy(() => import("@/pages/bookmarks"));
const MyEvents = lazy(() => import("@/pages/my-events"));
const Profile = lazy(() => import("@/pages/profile"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Admin pages - lazy load
const AdminLoginPage = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminEventsPage = lazy(() => import("@/pages/admin/events"));
const AdminEventDetail = lazy(() => import("@/pages/admin/event-detail"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  const [location] = useLocation();

  // Hide header and footer for admin login page
  const isAdminLoginPage = location === "/admin";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAdminLoginPage && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/events" component={Events} />
            <Route path="/events/:id" component={EventDetail} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/feedback" component={Feedback} />
            <Route path="/contact" component={Contact} />
            <Route path="/bookmarks" component={Bookmarks} />
            <Route path="/my-events" component={MyEvents} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={AdminLoginPage} />
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/dashboard/events" component={AdminEventsPage} />
            <Route
              path="/admin/dashboard/events/:id"
              component={AdminEventDetail}
            />
            <Route path="/admin/dashboard/users" component={AdminUsersPage} />
            <Route
              path="/admin/dashboard/analytics"
              component={AdminAnalytics}
            />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      {!isAdminLoginPage && <Footer />}
      {!isAdminLoginPage && <BackToTop />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <EventsProvider>
          <UsersProvider>
            <UserProvider>
              <AdminProvider>
                <TooltipProvider>
                  <Toaster />
                  {/* Provide registration context globally */}
                  <RegistrationProvider>
                    {/* Provide feedback context globally */}
                    <FeedbackProvider>
                      <Router />
                    </FeedbackProvider>
                  </RegistrationProvider>
                </TooltipProvider>
              </AdminProvider>
            </UserProvider>
          </UsersProvider>
        </EventsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
