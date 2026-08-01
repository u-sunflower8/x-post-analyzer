import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { ErrorBoundary } from '@/app/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
