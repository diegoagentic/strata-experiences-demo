import { Check, X, ChevronRight, Home, Folder, File } from 'lucide-react';
import { CodeViewer } from './CodeViewer';

export function BreadcrumbsView() {
  // Code examples for Basic Breadcrumbs
  const basicBreadcrumbsReact = `import { ChevronRight, Home, Folder } from 'lucide-react';

export function BasicBreadcrumbs() {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
        Home
      </a>
      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
      <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
        Projects
      </a>
      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
      <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
        Design System
      </a>
      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
      <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
        Components
      </span>
    </nav>
  );
}

// With Icons
export function BreadcrumbsWithIcons() {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
        <Home className="w-4 h-4" />
        Home
      </a>
      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
      <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
        <Folder className="w-4 h-4" />
        Projects
      </a>
      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
      <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
        <Folder className="w-4 h-4" />
        Design System
      </a>
      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
      <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50 font-semibold">
        <File className="w-4 h-4" />
        Components
      </span>
    </nav>
  );
}`;

  const basicBreadcrumbsHTML = `<!-- Basic Breadcrumbs -->
<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
    Home
  </a>
  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <a href="#" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
    Projects
  </a>
  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <a href="#" class="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
    Design System
  </a>
  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="text-zinc-900 dark:text-zinc-50 font-semibold">
    Components
  </span>
</nav>

<!-- With Icons -->
<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Home
  </a>
  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <a href="#" class="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Projects
  </a>
  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <a href="#" class="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Design System
  </a>
  <svg class="w-4 h-4 text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50 font-semibold">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Components
  </span>
</nav>`;

  const basicBreadcrumbsCSS = `/* Breadcrumbs Styles */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #52525b; /* zinc-600 */
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb-item:hover {
  color: #18181b; /* zinc-900 */
}

.breadcrumb-separator {
  width: 1rem;
  height: 1rem;
  color: #a1a1aa; /* zinc-400 */
  flex-shrink: 0;
}

.breadcrumb-current {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #18181b; /* zinc-900 */
  font-weight: 600;
}

.breadcrumb-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .breadcrumb-item {
    color: #a1a1aa; /* zinc-400 */
  }
  
  .breadcrumb-item:hover {
    color: #fafafa; /* zinc-50 */
  }
  
  .breadcrumb-separator {
    color: #52525b; /* zinc-600 */
  }
  
  .breadcrumb-current {
    color: #fafafa; /* zinc-50 */
  }
}`;

  const basicBreadcrumbsPrompt = `# AI PROMPT: Generate Breadcrumbs Component

## CONTEXT
You are creating a breadcrumbs navigation component for the Strata DS White Label design system - a high-density, enterprise-grade white label system using Zinc color scale and Tailwind CSS.

## REQUIREMENTS

### Visual Design
- Font size: 14px (text-sm)
- Links: zinc-600 (light) / zinc-400 (dark)
- Current page: zinc-900 (light) / zinc-50 (dark)
- Separators: zinc-400 (light) / zinc-600 (dark)
- Hover: zinc-900 (light) / zinc-50 (dark)

### Layout Structure
- Horizontal flexbox with gap-2 (8px)
- Items aligned center
- Separator icons between items
- Last item is non-clickable (current page)

### Typography
- Links: font-medium (500)
- Current page: font-semibold (600)
- Consistent sizing across all items

### Separators
- ChevronRight icon (›)
- Size: 16x16px (w-4 h-4)
- Color: muted zinc tones
- Positioned between all items except last

### With Icons
- Optional leading icons for each item
- Icon size: 16x16px (w-4 h-4)
- Gap between icon and text: 6px (gap-1.5)
- Icons: Home, Folder, File, etc.

### Interaction States
1. **Default**: Subdued color for links
2. **Hover**: Full contrast color
3. **Current**: Bold and full contrast (no hover)
4. **Focus**: Visible outline for keyboard navigation

### Responsive Behavior
- Mobile: Truncate middle items with "..."
- Show only first, last, and optionally one middle item
- Maintain clickability of visible items

### Accessibility
- Semantic <nav> element with aria-label="breadcrumb"
- Links have descriptive text
- Current page marked with aria-current="page"
- Keyboard navigable
- Screen reader friendly separators (aria-hidden="true")

### Technical Specs
- Use Tailwind CSS utility classes
- Support dark mode with dark: prefix
- Use lucide-react icons
- Maintain 8px spacing grid
- Links use <a> tags with proper href

## CODE STRUCTURE
\`\`\`tsx
import { ChevronRight, Home, Folder } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export function Breadcrumbs({ items, currentPage }: BreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <a 
              href={item.href}
              className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors"
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
            </a>
            <ChevronRight 
              className="w-4 h-4 text-zinc-400 dark:text-zinc-600" 
              aria-hidden="true"
            />
          </div>
        );
      })}
      <span 
        className="text-zinc-900 dark:text-zinc-50 font-semibold"
        aria-current="page"
      >
        {currentPage}
      </span>
    </nav>
  );
}
\`\`\`

## USAGE EXAMPLES
- Page hierarchy navigation
- File system paths
- Multi-step forms progress
- Category/subcategory navigation
- Settings sections

## DO'S
✓ Show full path hierarchy
✓ Make all items except current clickable
✓ Use semantic separators (chevrons)
✓ Maintain consistent spacing
✓ Include home/root as first item

## DON'TS
✗ Don't make current page clickable
✗ Don't use more than 5-6 levels
✗ Don't truncate important context
✗ Don't forget hover states
✗ Don't omit aria labels

## DESIGN TOKENS
- Font Size: 14px
- Item Gap: 8px
- Icon Size: 16px
- Icon-Text Gap: 6px
- Font Weight: 500 (links), 600 (current)

Generate the component following these specifications exactly.`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Breadcrumbs
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Navigation aids showing current location within the application hierarchy.
        </p>
      </div>

      {/* Basic Breadcrumbs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Basic Breadcrumbs
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Standard breadcrumb navigation with slash separators.
        </p>
        
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-600 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Text Only
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Home
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Projects
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Design System
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Components
              </span>
            </nav>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              With Icons
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                <Home className="w-4 h-4" />
                Home
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                <Folder className="w-4 h-4" />
                Projects
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                <Folder className="w-4 h-4" />
                Design System
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50 font-semibold">
                <File className="w-4 h-4" />
                Components
              </span>
            </nav>
          </div>
        </div>
        
        {/* Code Viewer */}
        <div className="mt-6">
          <CodeViewer
            title="Basic Breadcrumbs"
            react={basicBreadcrumbsReact}
            html={basicBreadcrumbsHTML}
            css={basicBreadcrumbsCSS}
            prompt={basicBreadcrumbsPrompt}
            enableFigmaExport={true}
            figmaSpecs={{
              fontSize: '14px',
              itemGap: '8px',
              iconSize: '16px',
              fontWeight: '500 (links), 600 (current)',
            }}
            figmaTokens={{
              colors: {
                'breadcrumb-link-light': '#52525b',
                'breadcrumb-link-dark': '#a1a1aa',
                'breadcrumb-current-light': '#18181b',
                'breadcrumb-current-dark': '#fafafa',
                'breadcrumb-separator-light': '#a1a1aa',
                'breadcrumb-separator-dark': '#52525b',
              },
              spacing: {
                'breadcrumb-gap': '8px',
                'breadcrumb-icon-gap': '6px',
              },
              typography: {
                'breadcrumb-size': '14px',
                'breadcrumb-weight-link': '500',
                'breadcrumb-weight-current': '600',
              },
            }}
          />
        </div>
      </div>

      {/* Breadcrumbs Variants */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Compact Style
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Smaller breadcrumbs for dense layouts and toolbars.
        </p>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
          <nav className="flex items-center gap-1.5 text-xs">
            <a href="#" className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
              Home
            </a>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <a href="#" className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
              Library
            </a>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <a href="#" className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
              Data
            </a>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
              Analytics.tsx
            </span>
          </nav>
        </div>
      </div>

      {/* Breadcrumbs with Dropdown */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          With Dropdown Menu
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Collapsed breadcrumbs with dropdown for long paths.
        </p>
        
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
          <nav className="flex items-center gap-2 text-sm">
            <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
              <Home className="w-4 h-4" />
            </a>
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            <button className="flex items-center gap-1 px-2 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded font-medium transition-colors">
              ...
            </button>
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
              Components
            </a>
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
              Breadcrumbs
            </span>
          </nav>
        </div>
      </div>

      {/* Background Variants */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Background Variants
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Breadcrumbs on different background styles.
        </p>
        
        <div className="space-y-4">
          {/* Default Background */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Default
            </div>
            <nav className="flex items-center gap-2 text-sm">
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Dashboard
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Settings
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Profile
              </span>
            </nav>
          </div>

          {/* Subtle Background */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Subtle
            </div>
            <nav className="flex items-center gap-2 text-sm bg-white dark:bg-zinc-900 rounded px-3 py-2 border border-zinc-200 dark:border-zinc-800">
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Dashboard
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                Analytics
              </a>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
                Reports
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Real-World Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Application Examples
        </h2>
        <div className="space-y-6">
          {/* File Browser */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <nav className="flex items-center gap-2 text-sm">
                <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                  <Home className="w-4 h-4" />
                  My Drive
                </a>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                  <Folder className="w-4 h-4" />
                  Projects
                </a>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <a href="#" className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                  <Folder className="w-4 h-4" />
                  2024
                </a>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50 font-semibold">
                  <Folder className="w-4 h-4" />
                  Q1 Reports
                </span>
              </nav>
            </div>
            <div className="p-6">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Folder contents would appear here...
              </div>
            </div>
          </div>

          {/* E-commerce Category */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <nav className="flex items-center gap-2 text-sm mb-4">
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                  Shop
                </a>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                  Electronics
                </a>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 font-medium transition-colors">
                  Computers
                </a>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
                  Laptops
                </span>
              </nav>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Gaming Laptops
              </h1>
            </div>
            <div className="p-6">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Product grid would appear here...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Usage Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                Do's
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Place breadcrumbs at the top of the page content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Make all items except current page clickable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use consistent separators (chevron recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Collapse long paths with dropdown menu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Keep labels concise and descriptive</span>
              </li>
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-red-600 dark:bg-red-500 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Don'ts
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't make current page item clickable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid showing more than 5-6 levels at once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use breadcrumbs for single-level navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid mixing different separator styles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use as primary navigation replacement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}