import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  ImagePlus,
  List,
  Trophy,
  Sparkles,
  PenSquare,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const NAV_ITEMS = [
  { to: '/', label: 'ダッシュボード', icon: LayoutDashboard, end: true },
  { to: '/upload', label: 'CSVアップロード', icon: Upload, end: false },
  { to: '/csv-builder', label: 'CSV作成', icon: ImagePlus, end: false },
  { to: '/posts', label: '投稿一覧', icon: List, end: false },
  { to: '/ranking', label: '投稿ランキング', icon: Trophy, end: false },
  { to: '/analysis', label: 'AI分析', icon: Sparkles, end: false },
  { to: '/generate', label: '投稿生成', icon: PenSquare, end: false },
] as const;

export function AppShell() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border px-4 py-6 md:flex">
          <div className="mb-8 px-2">
            <h1 className="text-lg font-semibold tracking-tight">X投稿分析</h1>
            <p className="text-sm text-muted-foreground">勝ちパターンを見つける</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {theme === 'dark' ? 'ライトモード' : 'ダークモード'}
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 md:px-10">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
