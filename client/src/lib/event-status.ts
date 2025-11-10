import { Event } from "@/types/event";

export type EventStatus = "incoming" | "upcoming" | "ongoing" | "completed";

/**
 * Parse time string (e.g., "10:00 AM - 6:00 PM" or "08:00 AM") and return start and end times in 24h format
 */
function parseTimeString(timeString: string): { startHour: number; startMinute: number; endHour: number; endMinute: number } | null {
  if (!timeString) return null;

  // Match pattern like "10:00 AM - 6:00 PM" or "02:00 PM - 02:00 PM"
  const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = timeString.match(timePattern);

  if (match) {
    // Full time range format
    let startHour = parseInt(match[1], 10);
    const startMinute = parseInt(match[2], 10);
    const startPeriod = match[3].toUpperCase();
    let endHour = parseInt(match[4], 10);
    const endMinute = parseInt(match[5], 10);
    const endPeriod = match[6].toUpperCase();

    // Convert to 24-hour format
    if (startPeriod === "PM" && startHour !== 12) {
      startHour += 12;
    } else if (startPeriod === "AM" && startHour === 12) {
      startHour = 0;
    }

    if (endPeriod === "PM" && endHour !== 12) {
      endHour += 12;
    } else if (endPeriod === "AM" && endHour === 12) {
      endHour = 0;
    }

    return { startHour, startMinute, endHour, endMinute };
  }

  // Try to match single time format (e.g., "08:00 AM")
  const singleTimePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const singleMatch = timeString.match(singleTimePattern);

  if (singleMatch) {
    // Only start time provided, use it for start and set end to 23:59
    let startHour = parseInt(singleMatch[1], 10);
    const startMinute = parseInt(singleMatch[2], 10);
    const startPeriod = singleMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (startPeriod === "PM" && startHour !== 12) {
      startHour += 12;
    } else if (startPeriod === "AM" && startHour === 12) {
      startHour = 0;
    }

    // Use start time for start, and 23:59 for end (end of day)
    return { startHour, startMinute, endHour: 23, endMinute: 59 };
  }

  return null;
}

/**
 * Create a datetime by combining date string and time string
 */
function createDateTime(dateString: string, timeString: string, isEnd: boolean = false): Date {
  const date = new Date(dateString);
  const parsedTime = parseTimeString(timeString);

  if (parsedTime) {
    if (isEnd) {
      date.setHours(parsedTime.endHour, parsedTime.endMinute, 0, 0);
    } else {
      date.setHours(parsedTime.startHour, parsedTime.startMinute, 0, 0);
    }
  } else {
    // If time parsing fails, use default times
    if (isEnd) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
  }

  return date;
}

export function calculateEventStatus(event: Event): EventStatus {
  const now = new Date();

  // Create datetime objects for event start and end, including time
  const eventStartDateTime = event.time
    ? createDateTime(event.dateStart, event.time, false)
    : new Date(event.dateStart + "T00:00:00");

  const eventEndDateTime = event.time
    ? createDateTime(event.dateEnd, event.time, true)
    : new Date(event.dateEnd + "T23:59:59");

  // For date-only comparisons (for incoming/upcoming status)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateStart = new Date(event.dateStart);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(event.dateEnd);
  dateEnd.setHours(23, 59, 59, 999);

  // If event doesn't require registration, use dateStart for incoming status
  if (!event.registrationRequired) {
    if (today < dateStart) {
      return "incoming";
    }
  } else {
    // If event requires registration, use registrationStart for incoming status
    if (event.registrationStart && event.registrationEnd) {
      const registrationStart = new Date(event.registrationStart);
      const registrationEnd = new Date(event.registrationEnd);
      registrationStart.setHours(0, 0, 0, 0);
      registrationEnd.setHours(23, 59, 59, 999);

      if (today < registrationStart) {
        return "incoming";
      }

      if (today >= registrationStart && today <= registrationEnd && today < dateStart) {
        return "upcoming";
      }
    }
  }

  // Check if event is completed (using actual datetime with time)
  if (now > eventEndDateTime) {
    return "completed";
  }

  // Check if event is ongoing (using actual datetime with time)
  if (now >= eventStartDateTime && now <= eventEndDateTime) {
    return "ongoing";
  }

  // Check if event is upcoming (hasn't started yet but date is today or in the future)
  if (today >= dateStart && now < eventStartDateTime) {
    return "upcoming";
  }

  // If event date is in the future
  if (today < dateStart) {
    return "upcoming";
  }

  // Default fallback
  return "upcoming";
}

export function getStatusColor(status: EventStatus): string {
  switch (status) {
    case "incoming":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "upcoming":
      return "bg-green-100 text-green-800 border-green-200";
    case "ongoing":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "completed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function getStatusLabel(status: EventStatus): string {
  switch (status) {
    case "incoming":
      return "Incoming";
    case "upcoming":
      return "Upcoming";
    case "ongoing":
      return "Ongoing";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
}
