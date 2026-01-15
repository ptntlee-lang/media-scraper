'use client';

import SearchBar from '@/components/ui/SearchBar';
import Select from '@/components/ui/Select';
import { MediaFilters } from '@/types/media';

interface MediaFiltersProps {
  filters: MediaFilters;
  onChange: (filters: MediaFilters) => void;
}

export default function MediaFiltersComponent({ filters, onChange }: MediaFiltersProps) {
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchBar
          value={filters.search}
          onChange={search => onChange({ ...filters, search })}
          placeholder="Search by title, alt text, or URL..."
        />
        <Select
          label="Filter by Type"
          id="type"
          value={filters.type}
          onChange={type => onChange({ ...filters, type })}
          options={typeOptions}
        />
      </div>
    </div>
  );
}
