import { Event } from "@/types/event";

export type EventStatus = "incoming" | "upcoming" | "ongoing" | "completed";

export function calculateEventStatus(event: Event): EventStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  const dateStart = new Date(event.dateStart);
  const dateEnd = new Date(event.dateEnd);
  dateStart.setHours(0, 0, 0, 0);
  dateEnd.setHours(23, 59, 59, 999); // End of day

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

  // Check if event is ongoing
  if (today >= dateStart && today <= dateEnd) {
    return "ongoing";
  }

  // Check if event is completed
  if (today > dateEnd) {
    return "completed";
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
