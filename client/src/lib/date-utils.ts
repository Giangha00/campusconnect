export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatDate(dateString);
  return `${formattedDate} • ${timeString}`;
}

export function isUpcoming(dateString: string): boolean {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}

export function getEventStatus(dateString: string): 'upcoming' | 'past' {
  return isUpcoming(dateString) ? 'upcoming' : 'past';
}

export function sortByDate<T extends { date: string }>(items: T[], order: 'asc' | 'desc' = 'asc'): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });
}

/**
 * Convert ISO date string to YYYY-MM-DD format for HTML date input
 * @param dateString - ISO date string (e.g., "2026-02-19T11:50:45Z" or "2026-02-19")
 * @returns Date string in YYYY-MM-DD format or empty string if invalid
 */
export function formatDateForInput(dateString: string | undefined | null): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    // Get year, month, day in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
}
