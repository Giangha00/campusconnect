import { EventCategory, EventSortBy } from "@/types/event";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventFiltersProps {
  currentFilter: EventCategory;
  onFilterChange: (filter: EventCategory) => void;
  currentSort: EventSortBy;
  onSortChange: (sort: EventSortBy) => void;
}

const filterOptions: { value: EventCategory; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "academic", label: "Academic" },
  { value: "cultural", label: "Cultural" },
  { value: "sports", label: "Sports" },
  { value: "departmental", label: "Departmental" },
];

const sortOptions: { value: EventSortBy; label: string }[] = [
  { value: "date", label: "Sort by date" },
  { value: "name", label: "Sort by name" },
  { value: "category", label: "Sort by category" },
];

export function EventFilters({
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange,
}: EventFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={currentFilter === option.value ? "default" : "outline"}
            onClick={() => onFilterChange(option.value)}
            className="transition-all duration-200"
            data-testid={`button-filter-${option.value}`}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Sort Options */}
      {/* <div className="flex justify-center">
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-48" data-testid="select-sort-events">
            <SelectValue placeholder="Sort events..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}
    </div>
  );
}
