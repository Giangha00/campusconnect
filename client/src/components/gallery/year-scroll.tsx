import { Button } from "@/components/ui/button";

interface YearScrollProps {
  years: string[];
}

export function YearScroll({ years }: YearScrollProps) {
  const onJump = (year: string) => {
    const el = document.getElementById(`year-${year}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!years || years.length === 0) return null;

  const sortedYears = [...years].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {sortedYears.map((year) => (
          <Button
            key={year}
            variant="outline"
            onClick={() => onJump(year)}
            className="px-3 py-1"
            data-testid={`button-year-jump-${year}`}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}


