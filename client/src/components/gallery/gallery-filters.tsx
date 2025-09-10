import { GalleryFilter } from '@/types/gallery';
import { Button } from '@/components/ui/button';

interface GalleryFiltersProps {
  currentFilter: GalleryFilter;
  onFilterChange: (filter: GalleryFilter) => void;
}

const filterOptions: { value: GalleryFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả ảnh' },
  { value: '2024', label: 'Năm 2024' },
  { value: '2023', label: 'Năm 2023' },
  { value: 'technical', label: 'Công nghệ' },
  { value: 'cultural', label: 'Văn hóa' },
  { value: 'sports', label: 'Thể thao' },
  { value: 'academic', label: 'Học thuật' },
];

export function GalleryFilters({ currentFilter, onFilterChange }: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={currentFilter === option.value ? 'default' : 'outline'}
          onClick={() => onFilterChange(option.value)}
          className="transition-all duration-200"
          data-testid={`button-gallery-filter-${option.value}`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
