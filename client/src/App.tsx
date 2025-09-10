import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/user-context";
import { RegistrationProvider } from "@/contexts/registration-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import Home from "@/pages/home";
import About from "@/pages/about";
import Events from "@/pages/events";
import EventDetail from "@/pages/eventdetail";
import Gallery from "@/pages/gallery";
import Feedback from "@/pages/feedback";
import Contact from "@/pages/contact";
import Bookmarks from "@/pages/bookmarks";
import NotFound from "@/pages/not-found";

import AdminPage from "@/pages/admin";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
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
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          {/* Provide registration context globally */}
          <RegistrationProvider>
            <Router />
          </RegistrationProvider>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
