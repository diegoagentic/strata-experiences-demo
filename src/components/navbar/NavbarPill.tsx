import type { ReactNode } from 'react';
import { useDemo } from '../../context/DemoContext';

interface NavbarPillProps {
  leading?: ReactNode;
  center?: ReactNode;
  trailing?: ReactNode;
  respectSidebar?: boolean;
}

export default function NavbarPill({
  leading,
  center,
  trailing,
  respectSidebar = true,
}: NavbarPillProps) {
  const { isDemoActive, isSidebarCollapsed } = useDemo();
  const sidebarExpanded = respectSidebar && isDemoActive && !isSidebarCollapsed;

  return (
    <div
      className={`fixed top-6 z-50 flex justify-center px-4 transition-all duration-300 ${
        sidebarExpanded ? 'left-80 right-0' : 'left-0 right-0'
      }`}
    >
      {/* F25 · center pasa de absolute (que se solapaba con trailing
          al saturarse los tabs) a flex-1 min-w-0 reservado. Ahora
          leading y trailing (shrink-0) empujan al center · si el
          center excede el ancho disponible, se comprime con overflow
          hidden en vez de superponerse al trailing (RoleSwitcher).
          Diego 2026-07-23. */}
      <div
        className={`relative flex items-center justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md w-full transition-all duration-300 ${
          sidebarExpanded ? 'max-w-5xl' : 'max-w-7xl'
        }`}
      >
        {leading && <div className="flex items-center gap-1 shrink-0">{leading}</div>}

        {center && (
          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-1 overflow-hidden">
            {center}
          </div>
        )}

        {trailing && (
          <div className="flex items-center gap-1 shrink-0">
            <div className="h-6 w-px bg-border mx-1 hidden lg:block"></div>
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}
