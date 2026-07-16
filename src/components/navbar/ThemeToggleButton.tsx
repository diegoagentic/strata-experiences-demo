import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'strata-design-system';

interface ThemeToggleButtonProps {
  className?: string;
}

/**
 * ThemeToggleButton · mini sun/moon toggle. Extracted from Navbar.tsx
 * (F18.polish.v2 Paso A) so SharedBlockShell can reuse the same visual.
 */
export default function ThemeToggleButton({ className = '' }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`hidden lg:flex p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
    </button>
  );
}
