import * as React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

/**
 * Converts YYYY-MM-DD format to dd/mm/YYYY format
 */
function formatToDisplay(dateString: string): string {
  if (!dateString) return "";
  
  try {
    // Handle YYYY-MM-DD format
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Converts dd/mm/YYYY format to YYYY-MM-DD format
 */
function formatToValue(dateString: string): string {
  if (!dateString) return "";
  
  try {
    // Handle dd/mm/YYYY format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Validate and pad
      const d = day.padStart(2, "0");
      const m = month.padStart(2, "0");
      const y = year;
      
      // Validate date
      const date = new Date(`${y}-${m}-${d}`);
      if (isNaN(date.getTime())) {
        return dateString; // Return as-is if invalid
      }
      
      return `${y}-${m}-${d}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Validates if a string is a valid date in dd/mm/YYYY format
 */
function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const parts = dateString.split("/");
  if (parts.length !== 3) return false;
  
  // Check if all parts are numeric
  if (!parts[0].match(/^\d+$/) || !parts[1].match(/^\d+$/) || !parts[2].match(/^\d+$/)) {
    return false;
  }
  
  const [day, month, year] = parts.map(Number);
  
  // Basic validation
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1000 || year > 9999) return false;
  
  // Validate actual date
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

interface DateInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value?: string; // YYYY-MM-DD format
  onChange?: (value: string) => void; // Returns YYYY-MM-DD format
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  showPicker?: boolean; // Show calendar picker (default: true)
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, onBlur, placeholder = "dd/mm/yyyy", showPicker = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
    const [isOpen, setIsOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    
    // Update display value and selected date when value prop changes
    React.useEffect(() => {
      if (value) {
        setDisplayValue(formatToDisplay(value));
        // Parse YYYY-MM-DD to Date object
        const [year, month, day] = value.split("-").map(Number);
        if (year && month && day) {
          setSelectedDate(new Date(year, month - 1, day));
        }
      } else {
        setDisplayValue("");
        setSelectedDate(undefined);
      }
    }, [value]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;
      
      // Remove any non-digit and non-slash characters
      inputValue = inputValue.replace(/[^\d/]/g, "");
      
      // Auto-format as user types
      let formatted = inputValue;
      
      // Remove extra slashes (keep only first two)
      const slashCount = (inputValue.match(/\//g) || []).length;
      if (slashCount > 2) {
        const parts = inputValue.split("/");
        formatted = parts.slice(0, 3).join("/");
        inputValue = formatted;
      }
      
      const parts = inputValue.split("/").filter(p => p);
      
      if (parts.length > 0) {
        // Limit day to 2 digits
        if (parts[0].length > 2) {
          parts[0] = parts[0].substring(0, 2);
        }
        // Auto-add slash after day if 2 digits entered and no slash yet
        if (parts[0].length === 2 && parts.length === 1 && !inputValue.includes("/")) {
          formatted = parts[0] + "/";
        } else if (parts[0].length === 2 && parts.length === 1) {
          formatted = parts[0] + "/";
        }
      }
      
      if (parts.length > 1) {
        // Limit month to 2 digits
        if (parts[1].length > 2) {
          parts[1] = parts[1].substring(0, 2);
        }
        // Auto-add slash after month if 2 digits entered
        if (parts[1].length === 2 && parts.length === 2) {
          formatted = parts[0] + "/" + parts[1] + "/";
        } else if (parts.length === 2) {
          formatted = parts[0] + "/" + parts[1];
        }
      }
      
      if (parts.length > 2) {
        // Limit year to 4 digits
        if (parts[2].length > 4) {
          parts[2] = parts[2].substring(0, 4);
        }
        formatted = parts.slice(0, 3).join("/");
      }
      
      setDisplayValue(formatted);
      
      // Convert to YYYY-MM-DD and call onChange if valid
      if (isValidDate(formatted)) {
        const converted = formatToValue(formatted);
        onChange?.(converted);
      } else if (formatted === "") {
        onChange?.("");
      }
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Validate and format on blur
      const currentValue = displayValue.trim();
      
      if (currentValue && !isValidDate(currentValue)) {
        // If invalid, try to fix common issues
        const parts = currentValue.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const d = day.padStart(2, "0");
          const m = month.padStart(2, "0");
          const y = year;
          
          const fixed = `${d}/${m}/${y}`;
          if (isValidDate(fixed)) {
            setDisplayValue(fixed);
            const converted = formatToValue(fixed);
            onChange?.(converted);
          } else {
            // Invalid date, clear or show error
            setDisplayValue("");
            onChange?.("");
          }
        } else {
          // Incomplete date, clear
          setDisplayValue("");
          onChange?.("");
        }
      } else if (currentValue && isValidDate(currentValue)) {
        // Ensure proper formatting
        const parts = currentValue.split("/");
        const formatted = parts.map(p => p.padStart(2, "0")).join("/");
        if (formatted !== currentValue) {
          setDisplayValue(formatted);
        }
      }
      
      onBlur?.(e);
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setSelectedDate(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formatted = `${day}/${month}/${year}`;
        setDisplayValue(formatted);
        const converted = `${year}-${month}-${day}`;
        onChange?.(converted);
        setIsOpen(false);
      }
    };
    
    if (showPicker) {
      return (
        <div className={cn("flex gap-2", className)}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                type="button"
                title="Chọn ngày từ lịch"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1"
            maxLength={10}
            {...props}
          />
        </div>
      );
    }
    
    return (
      <Input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(className)}
        maxLength={10}
        {...props}
      />
    );
  }
);

DateInput.displayName = "DateInput";

export { DateInput };
