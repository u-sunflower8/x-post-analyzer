import { EmptyState } from '@/shared/components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      title="ページが見つかりません"
      description="URLをご確認ください。"
      actionTo="/"
      actionLabel="ダッシュボードに戻る"
    />
  );
}
