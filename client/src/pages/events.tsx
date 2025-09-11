import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { SearchBar } from "@/components/search/search-bar";
import { useEvents } from "@/hooks/use-events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Activity,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export default function Events() {
  const {
    events,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
  } = useEvents();

  const sortOptions = [
    { value: "date", label: "Sort by date", icon: Calendar },
    { value: "name", label: "Sort by name", icon: User },
    { value: "status", label: "Sort by status", icon: Activity },
    { value: "time", label: "Sort by time", icon: Clock },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "upcoming", label: "Upcoming" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  const handleStatusSort = (status: string) => {
    setStatusFilter(status as any);
    setSortBy("status");
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="hero-section h-[50vh]">
        <div
          className="hero-background"
          style={{
            backgroundImage: "url('/images/schools/School_7.jpg')",
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="hero-content">
          <h1
            className="hero-title text-5xl"
            data-testid="text-events-hero-title"
          >
            Event Calendar
          </h1>
          <p
            className="hero-description text-xl"
            data-testid="text-events-hero-description"
          >
            Explore the full list of upcoming and past events. Filter by
            category and sort to find exactly what you're interested in.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search by name, description, department, venue, topic..."
            />
          </div>

          <div className="flex flex-col flex-wrap gap-4 justify-center items-center">
            <EventFilters
              currentFilter={filter}
              onFilterChange={setFilter}
              currentStatusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              currentSort={sortBy}
              onSortChange={setSortBy}
            />

            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">
                Advanced Sort:
              </span>
              {sortOptions.map((option) => {
                const IconComponent = option.icon;

                if (option.value === "status") {
                  return (
                    <DropdownMenu key={option.value}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={
                            sortBy === option.value ? "default" : "outline"
                          }
                          size="sm"
                          className="gap-2"
                          data-testid={`button-sort-${option.value}`}
                        >
                          <IconComponent className="h-4 w-4" />
                          {statusFilter !== "all"
                            ? `Sort by ${statusFilter}`
                            : option.label}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {statusOptions.map((statusOption) => (
                          <DropdownMenuItem
                            key={statusOption.value}
                            onClick={() => handleStatusSort(statusOption.value)}
                            className={
                              statusFilter === statusOption.value
                                ? "bg-accent"
                                : ""
                            }
                          >
                            {statusOption.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(option.value as any)}
                    className="gap-2"
                    data-testid={`button-sort-${option.value}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <h3
                className="text-2xl font-semibold text-foreground mb-4"
                data-testid="text-no-events-title"
              >
                No Events Found
              </h3>
              <p
                className="text-muted-foreground"
                data-testid="text-no-events-description"
              >
                {searchQuery
                  ? `No events match the keyword "${searchQuery}". Try searching with a different keyword.`
                  : "No events match the current filter criteria. Try selecting a different category."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2
                  className="text-2xl font-semibold text-foreground"
                  data-testid="text-events-count"
                >
                  Showing {events.length} events
                  {searchQuery && (
                    <span className="text-muted-foreground">
                      {" "}
                      for "{searchQuery}"
                    </span>
                  )}
                  {filter !== "all" && (
                    <span className="text-muted-foreground">
                      {" "}
                      in category{" "}
                      <span className="capitalize">
                        {filter === "academic"
                          ? "Academic"
                          : filter === "cultural"
                          ? "Cultural"
                          : filter === "sports"
                          ? "Sports"
                          : "Departmental"}
                      </span>
                    </span>
                  )}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl font-bold mb-4"
            data-testid="text-events-cta-title"
          >
            Don't Miss Out on Campus Events
          </h2>
          <p
            className="text-xl text-primary-foreground/90 mb-6"
            data-testid="text-events-cta-description"
          >
            Connect with the campus community and make the most of your
            university experience.
          </p>
          <p
            className="text-primary-foreground/80"
            data-testid="text-events-cta-note"
          >
            For event registration and more information, please contact the
            respective organizers or visit the student affairs office.
          </p>
        </div>
      </section>
    </div>
  );
}
