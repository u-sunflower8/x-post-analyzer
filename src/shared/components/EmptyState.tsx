import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionTo?: string;
  actionLabel?: string;
}

export function EmptyState({ title, description, actionTo, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <Inbox className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionTo && actionLabel && (
        <Button render={<Link to={actionTo} />} nativeButton={false}>{actionLabel}</Button>
      )}
    </div>
  );
}
