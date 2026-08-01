import { Component, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground">
          <AlertOctagon className="size-10 text-destructive" />
          <div className="space-y-1">
            <h1 className="text-lg font-medium">予期しないエラーが発生しました</h1>
            <p className="text-sm text-muted-foreground">
              ページを再読み込みしてお試しください。
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>再読み込み</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
