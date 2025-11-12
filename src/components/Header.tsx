import { Headphones, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showLogout?: boolean;
}

export function Header({ showLogout = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <header className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 dark:border-slate-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-xl shadow-lg shadow-blue-500/30">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">IT Support Portal</h1>
              {user && (
                <p className="text-xs text-blue-300">Welcome, {user.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all hover:scale-110 group"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
              )}
            </button>

            {showLogout && (
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all hover:scale-105"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
