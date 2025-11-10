import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { EventCarousel } from "@/components/events/event-carousel";
import { SearchBar } from "@/components/search/search-bar";
import { useEvents } from "@/contexts/events-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { EventCategory, EventStatus, EventSortBy } from "@/types/event";
import { calculateEventStatus } from "@/lib/event-status";
import { formatDate } from "@/lib/date-utils";

export default function Events() {
  const { events } = useEvents();
  const [location] = useLocation();
  const [filter, setFilter] = useState<EventCategory>("all");
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");
  const [sortBy, setSortBy] = useState<EventSortBy>("status");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  // Handle query parameter for initial category filter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");
    if (
      categoryParam &&
      ["academic", "cultural", "sports", "technical"].includes(categoryParam)
    ) {
      setFilter(categoryParam as EventCategory);
    }
  }, [location]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, statusFilter, sortBy, fromDate, toDate]);

  // Add status to events and apply filtering/sorting
  const processedEvents = useMemo(() => {
    // Add status to each event and preserve creation order (newer events have lower index)
    const eventsWithStatus = events.map((event, index) => ({
      ...event,
      status: calculateEventStatus(event as any),
      creationOrder: index, // Lower index = more recently created
    }));

    let filteredEvents = eventsWithStatus;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.department.toLowerCase().includes(query) ||
          event.organizer.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filter !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) => event.category === filter
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) => event.status === statusFilter
      );
    }

    // Apply date range filter
    if (fromDate || toDate) {
      filteredEvents = filteredEvents.filter((event) => {
        const eventStart = new Date(event.dateStart);
        const eventEnd = new Date(event.dateEnd);

        // If only "from" date is selected, show events that start on or after that date
        if (fromDate && !toDate) {
          const fromDateObj = new Date(fromDate);
          return eventStart >= fromDateObj;
        }

        // If only "to" date is selected, show events that end on or before that date
        if (!fromDate && toDate) {
          const toDateObj = new Date(toDate);
          return eventEnd <= toDateObj;
        }

        // If both dates are selected, show events that overlap with the date range
        if (fromDate && toDate) {
          const fromDateObj = new Date(fromDate);
          const toDateObj = new Date(toDate);
          // Event overlaps if: eventStart <= rangeTo AND eventEnd >= rangeFrom
          return eventStart <= toDateObj && eventEnd >= fromDateObj;
        }

        return true;
      });
    }

    // Apply sorting
    const sortedEvents = [...filteredEvents];
    switch (sortBy) {
      case "date":
        // Sort by dateStart from nearest to farthest (ascending order)
        sortedEvents.sort((a, b) => {
          return (
            new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
          );
        });
        break;
      case "category":
        sortedEvents.sort((a, b) => {
          // First by creation order, then by category
          if (a.creationOrder !== b.creationOrder) {
            return a.creationOrder - b.creationOrder;
          }
          return a.category.localeCompare(b.category);
        });
        break;
      case "status":
        const statusOrder = {
          incoming: 0,
          upcoming: 1,
          ongoing: 2,
          completed: 3,
        };
        sortedEvents.sort((a, b) => {
          // First by creation order, then by status
          if (a.creationOrder !== b.creationOrder) {
            return a.creationOrder - b.creationOrder;
          }
          return statusOrder[a.status] - statusOrder[b.status];
        });
        break;
      case "time":
        sortedEvents.sort((a, b) => {
          // First by creation order, then by time
          if (a.creationOrder !== b.creationOrder) {
            return a.creationOrder - b.creationOrder;
          }
          return a.time.localeCompare(b.time);
        });
        break;
    }

    return sortedEvents;
  }, [events, filter, statusFilter, sortBy, searchQuery, fromDate, toDate]);

  // Get upcoming events for carousel
  const upcomingEvents = useMemo(() => {
    return events
      .map((event) => ({
        ...event,
        status: calculateEventStatus(event as any),
      }))
      .filter((event) => event.status === "upcoming")
      .sort(
        (a, b) =>
          new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
      )
      .slice(0, 3);
  }, [events]);

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = useMemo(() => {
    return processedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  }, [processedEvents, currentPage]);

  const totalPages = Math.ceil(processedEvents.length / eventsPerPage);

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

  const sortOptions = [
    { value: "status", label: "Sort by status", icon: Activity },
    // { value: "time", label: "Sort by time", icon: Clock },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "incoming", label: "Incoming" },
    { value: "upcoming", label: "Upcoming" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="pt-16">
      {/* Event Carousel */}
      <EventCarousel events={upcomingEvents as any} />

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

            <div className="flex gap-2 items-center flex-wrap justify-center">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Select Date:
                </span>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      placeholder="From"
                      className="w-[150px]"
                      data-testid="input-date-from"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">to</span>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      placeholder="To"
                      className="w-[150px]"
                      min={fromDate || undefined}
                      data-testid="input-date-to"
                    />
                  </div>
                  {(fromDate || toDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                      className="h-8 w-8 p-0"
                      data-testid="button-clear-date"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

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
                              statusFilter !== "all" ? "default" : "outline"
                            }
                            size="sm"
                            className="gap-2"
                            data-testid={`button-filter-by-status`}
                          >
                            <IconComponent className="h-4 w-4" />
                            {statusFilter !== "all"
                              ? statusOptions.find(
                                  (s) => s.value === statusFilter
                                )?.label
                              : "Filter by Status"}
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {statusOptions.map((statusOption) => (
                            <DropdownMenuItem
                              key={statusOption.value}
                              onClick={() =>
                                setStatusFilter(statusOption.value as any)
                              }
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
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {processedEvents.length === 0 ? (
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
                  Showing {processedEvents.length} events
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
                          : "Technical"}
                      </span>
                    </span>
                  )}
                  {fromDate && toDate && (
                    <span className="text-muted-foreground">
                      {" "}
                      from {formatDate(fromDate)} to {formatDate(toDate)}
                    </span>
                  )}
                  {fromDate && !toDate && (
                    <span className="text-muted-foreground">
                      {" "}
                      from {formatDate(fromDate)}
                    </span>
                  )}
                  {!fromDate && toDate && (
                    <span className="text-muted-foreground">
                      {" "}
                      until {formatDate(toDate)}
                    </span>
                  )}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentEvents.map((event) => (
                  <EventCard key={event.id} event={event as any} />
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
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
