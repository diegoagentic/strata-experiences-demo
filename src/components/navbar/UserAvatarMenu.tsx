import { SunIcon, MoonIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'strata-design-system';
import { useTenant } from '../../TenantContext';
import { useAuth } from '../../context/AuthContext';

interface UserAvatarMenuProps {
  onLogout: () => void;
  demoProfile?: { name: string; role: string; photo: string } | null;
  displayName: string;
  userInitials: string;
}

/**
 * UserAvatarMenu · avatar (photo + name + role) with hover-dropdown
 * (tenant switcher on mobile · theme toggle on mobile · Sign Out).
 * Extracted from Navbar.tsx (F18.polish.v2 Paso A) so SharedBlockShell
 * can render the same visual identity for the current user.
 */
export default function UserAvatarMenu({
  onLogout,
  demoProfile,
  displayName,
  userInitials,
}: UserAvatarMenuProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentTenant, tenants, setTenant } = useTenant();
  const { user } = useAuth();
  const userEmail = user?.email || '';

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors text-left outline-none">
        {demoProfile ? (
          <>
            <img
              src={demoProfile.photo}
              alt={demoProfile.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
            />
            <div className="hidden sm:flex flex-col items-start max-w-[140px]">
              <span className="text-xs font-semibold text-foreground leading-tight truncate w-full">
                {demoProfile.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                {demoProfile.role}
              </span>
            </div>
          </>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            {userInitials}
          </div>
        )}
        <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
      </button>

      <div className="absolute top-full right-0 mt-2 w-56 py-2 rounded-xl bg-card/90 backdrop-blur-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
        <div className="px-4 py-2 border-b border-border mb-1">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>

        <div className="px-2 py-1 lg:hidden">
          <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Switch Tenant
          </p>
          {tenants.map(tenant => (
            <button
              key={tenant}
              onClick={() => setTenant(tenant)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <span>{tenant}</span>
              {currentTenant === tenant && <CheckIcon className="w-3 h-3 text-primary" />}
            </button>
          ))}
          <div className="h-px bg-border my-1 mx-2"></div>
        </div>

        <div className="p-1 lg:hidden">
          <button
            onClick={toggleTheme}
            className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-lg flex items-center gap-2 transition-colors"
          >
            {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <div className="h-px bg-border my-1 mx-2"></div>
        </div>

        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-muted flex items-center gap-2"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
