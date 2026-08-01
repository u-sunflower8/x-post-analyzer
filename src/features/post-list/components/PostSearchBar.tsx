import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PostSearchBarProps {
  query: string;
  onChange: (query: string) => void;
}

export function PostSearchBar({ query, onChange }: PostSearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="投稿本文を検索…"
        className="pl-9"
      />
    </div>
  );
}
