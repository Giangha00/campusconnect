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
