import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { validateSearchQuery } from "@/lib/validation";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search events...",
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate search query
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      setError(validation.message || "Invalid search query");
      return;
    }

    setError("");
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    setError("");
    onSearch("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex gap-2 ${className}`}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className={`pl-10 pr-10 ${error ? "border-red-500" : ""}`}
          data-testid="input-search"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button type="submit" data-testid="button-search">
        Search
      </Button>
      {error && (
        <p className="absolute top-full left-0 mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
