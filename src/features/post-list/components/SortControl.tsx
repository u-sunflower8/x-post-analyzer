import { ArrowUpDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SORT_FIELD_LABELS, type SortField } from '../hooks/usePostFilters';

interface SortControlProps {
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: 'asc' | 'desc';
  onToggleDirection: () => void;
}

export function SortControl({
  sortField,
  onSortFieldChange,
  sortDirection,
  onToggleDirection,
}: SortControlProps) {
  return (
    <div className="flex gap-2">
      <Select value={sortField} onValueChange={(value) => onSortFieldChange(value as SortField)}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((field) => (
            <SelectItem key={field} value={field}>
              {SORT_FIELD_LABELS[field]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={onToggleDirection} aria-label="並び順を切り替え">
        <ArrowUpDown className={sortDirection === 'asc' ? 'rotate-180' : ''} />
      </Button>
    </div>
  );
}
