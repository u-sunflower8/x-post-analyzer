import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from './AppShell';

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const UploadPage = lazy(() => import('@/pages/UploadPage').then((m) => ({ default: m.UploadPage })));
const CsvBuilderPage = lazy(() =>
  import('@/pages/CsvBuilderPage').then((m) => ({ default: m.CsvBuilderPage })),
);
const PostListPage = lazy(() => import('@/pages/PostListPage').then((m) => ({ default: m.PostListPage })));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage').then((m) => ({ default: m.PostDetailPage })));
const RankingPage = lazy(() => import('@/pages/RankingPage').then((m) => ({ default: m.RankingPage })));
const AiAnalysisPage = lazy(() => import('@/pages/AiAnalysisPage').then((m) => ({ default: m.AiAnalysisPage })));
const PostGeneratorPage = lazy(() =>
  import('@/pages/PostGeneratorPage').then((m) => ({ default: m.PostGeneratorPage })),
);
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'upload', element: withSuspense(<UploadPage />) },
      { path: 'csv-builder', element: withSuspense(<CsvBuilderPage />) },
      { path: 'posts', element: withSuspense(<PostListPage />) },
      { path: 'posts/:postId', element: withSuspense(<PostDetailPage />) },
      { path: 'ranking', element: withSuspense(<RankingPage />) },
      { path: 'analysis', element: withSuspense(<AiAnalysisPage />) },
      { path: 'generate', element: withSuspense(<PostGeneratorPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
]);
