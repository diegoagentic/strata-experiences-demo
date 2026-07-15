import { Check, X, ChevronRight, Plus, Download, Mail, Trash2, Settings } from 'lucide-react';
import { CodeViewer } from './CodeViewer';
import { ProjectButtonsDemo } from './demos/ProjectButtonsDemo';

export function ButtonsView() {
  // Code examples for Primary Button
  const primaryButtonReact = `import { Plus, ChevronRight } from 'lucide-react';

export function PrimaryButton() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Basic Primary Button */}
      <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
        Button
      </button>

      {/* Primary Button with Leading Icon */}
      <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
        <Plus className="w-4 h-4" />
        With Icon
      </button>

      {/* Primary Button with Trailing Icon */}
      <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
        Continue
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Disabled State */}
      <button 
        disabled
        className="px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-md cursor-not-allowed opacity-50"
      >
        Disabled
      </button>
    </div>
  );
}`;

  const primaryButtonHTML = `<!-- Basic Primary Button -->
<button class="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
  Button
</button>

<!-- Primary Button with Leading Icon -->
<button class="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2">
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/>
  </svg>
  With Icon
</button>

<!-- Primary Button with Trailing Icon -->
<button class="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2">
  Continue
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round"/>
  </svg>
</button>

<!-- Disabled State -->
<button disabled class="px-4 py-2 bg-zinc-400 dark:bg-zinc-600 text-zinc-300 dark:text-zinc-500 font-semibold rounded-md cursor-not-allowed">
  Disabled
</button>`;

  const primaryButtonCSS = `/* Primary Button Base Styles */
.btn-primary {
  padding: 0.5rem 1rem; /* 8px 16px */
  background-color: #18181b; /* zinc-900 */
  color: #fafafa; /* zinc-50 */
  font-weight: 600;
  border-radius: 0.375rem; /* 6px */
  transition: background-color 0.15s ease-in-out;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #27272a; /* zinc-800 */
}

.btn-primary:active {
  background-color: #3f3f46; /* zinc-700 */
}

.btn-primary:disabled {
  background-color: #a1a1aa; /* zinc-400 */
  color: #d4d4d8; /* zinc-300 */
  cursor: not-allowed;
  opacity: 0.6;
}

/* Dark Mode Styles */
@media (prefers-color-scheme: dark) {
  .btn-primary {
    background-color: #fafafa; /* zinc-50 */
    color: #18181b; /* zinc-900 */
  }
  
  .btn-primary:hover {
    background-color: #e4e4e7; /* zinc-200 */
  }
  
  .btn-primary:disabled {
    background-color: #52525b; /* zinc-600 */
    color: #71717a; /* zinc-500 */
  }
}

/* Icon Sizing */
.btn-primary svg {
  width: 1rem; /* 16px */
  height: 1rem; /* 16px */
}`;

  const primaryButtonPrompt = `# AI PROMPT: Generate Primary Button Component

## CONTEXT
You are creating a primary button component for the Strata DS White Label design system - a high-density, enterprise-grade white label system using Zinc color scale and Tailwind CSS.

## REQUIREMENTS

### Visual Design
- Background: zinc-900 (light mode) / zinc-50 (dark mode)
- Text: zinc-50 (light mode) / zinc-900 (dark mode)
- Padding: px-4 py-2 (16px horizontal, 8px vertical)
- Border radius: rounded-md (6px)
- Font weight: font-semibold (600)
- Transition: smooth hover transitions (0.15s)

### States
1. **Default**: Full opacity, solid background
2. **Hover**: Slightly lighter background (zinc-800 light / zinc-200 dark)
3. **Active/Focus**: Visual feedback with focus ring
4. **Disabled**: Reduced opacity, cursor-not-allowed, muted colors

### Variants
1. **Text Only**: Just button label
2. **Leading Icon**: Icon before text (16x16px)
3. **Trailing Icon**: Icon after text (16x16px)
4. **Icon Only**: Just icon with square aspect ratio

### Accessibility
- Semantic <button> element
- Proper disabled state with disabled attribute
- Focus visible outline for keyboard navigation
- Minimum touch target: 44x44px for mobile
- ARIA labels for icon-only buttons

### Technical Specs
- Use Tailwind CSS utility classes
- Use lucide-react for icons (import { Plus, ChevronRight } from 'lucide-react')
- Support dark mode with dark: prefix
- Maintain 8px spacing grid
- Ensure contrast ratio meets WCAG AA (4.5:1)

## CODE STRUCTURE
\`\`\`tsx
import { IconName } from 'lucide-react';

export function PrimaryButton({ 
  children, 
  icon, 
  iconPosition = 'leading',
  disabled = false,
  onClick 
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
    >
      {icon && iconPosition === 'leading' && icon}
      {children}
      {icon && iconPosition === 'trailing' && icon}
    </button>
  );
}
\`\`\`

## USAGE EXAMPLES
- Primary CTA: "Sign Up", "Get Started", "Submit"
- Form submission: "Save Changes", "Create Account"
- Confirmation: "Confirm", "Proceed", "Continue"
- Critical actions: "Delete", "Approve", "Publish"

## DO'S
✓ Use for primary actions (1 per page section)
✓ Maintain high contrast for readability
✓ Include hover and focus states
✓ Support keyboard navigation
✓ Use action verbs for labels

## DON'TS
✗ Don't use more than one primary button in the same context
✗ Don't use for destructive actions (use danger variant)
✗ Don't make buttons too small (min 44x44px)
✗ Don't use vague labels like "Click Here"
✗ Don't remove disabled state styling

## DESIGN TOKENS
- Background: --color-zinc-900 / --color-zinc-50
- Text: --color-zinc-50 / --color-zinc-900
- Border Radius: --radius-md (6px)
- Spacing: --spacing-4 (16px) / --spacing-2 (8px)
- Font Weight: --font-semibold (600)

Generate the component following these specifications exactly.`;

  // Code examples for Secondary Button
  const secondaryButtonReact = `import { Download, Settings } from 'lucide-react';

export function SecondaryButton() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Basic Secondary Button */}
      <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors border border-input">
        Button
      </button>

      {/* Secondary Button with Leading Icon */}
      <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors border border-input flex items-center gap-2">
        <Download className="w-4 h-4" />
        Download
      </button>

      {/* Secondary Button with Trailing Icon */}
      <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors border border-input flex items-center gap-2">
        Settings
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}`;

  const secondaryButtonHTML = `<!-- Basic Secondary Button -->
<button class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700">
  Button
</button>

<!-- Secondary Button with Leading Icon -->
<button class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-300 dark:border-zinc-700 flex items-center gap-2">
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round"/>
  </svg>
  Download
</button>`;

  const secondaryButtonCSS = `/* Secondary Button Base Styles */
.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: #f4f4f5; /* zinc-100 */
  color: #18181b; /* zinc-900 */
  font-weight: 600;
  border-radius: 0.375rem;
  border: 1px solid #d4d4d8; /* zinc-300 */
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background-color: #e4e4e7; /* zinc-200 */
}

/* Dark Mode Styles */
@media (prefers-color-scheme: dark) {
  .btn-secondary {
    background-color: #27272a; /* zinc-800 */
    color: #fafafa; /* zinc-50 */
    border-color: #3f3f46; /* zinc-700 */
  }
  
  .btn-secondary:hover {
    background-color: #3f3f46; /* zinc-700 */
  }
}`;

  const secondaryButtonPrompt = `# AI PROMPT: Generate Secondary Button Component

## CONTEXT
You are creating a secondary button component for the Strata DS White Label design system - for medium emphasis actions.

## REQUIREMENTS

### Visual Design
- Background: zinc-100 (light mode) / zinc-800 (dark mode)
- Text: zinc-900 (light mode) / zinc-50 (dark mode)
- Border: 1px solid zinc-300 (light) / zinc-700 (dark)
- Padding: px-4 py-2 (16px horizontal, 8px vertical)
- Border radius: rounded-md (6px)
- Font weight: font-semibold (600)

### States
- **Hover**: zinc-200 (light) / zinc-700 (dark)
- **Focus**: Visible outline for accessibility
- **Disabled**: Reduced opacity, muted colors

### Usage
- Secondary actions alongside primary buttons
- Settings, options, alternative actions
- Medium emphasis in UI hierarchy

Generate the component following the Strata DS specifications.`;

  // Code examples for Outline Button
  const outlineButtonReact = `import { Mail } from 'lucide-react';

export function OutlineButton() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Basic Outline Button */}
      <button className="px-4 py-2 bg-transparent text-foreground font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition-colors border-2 border-input">
        Button
      </button>

      {/* Outline Button with Icon */}
      <button className="px-4 py-2 bg-transparent text-foreground font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition-colors border-2 border-input flex items-center gap-2">
        <Mail className="w-4 h-4" />
        Email
      </button>
    </div>
  );
}`;

  const outlineButtonHTML = `<!-- Basic Outline Button -->
<button class="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-2 border-zinc-300 dark:border-zinc-700">
  Button
</button>

<!-- Outline Button with Icon -->
<button class="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-2 border-zinc-300 dark:border-zinc-700 flex items-center gap-2">
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="2"/>
    <path d="M3 7l9 6 9-6" stroke-width="2"/>
  </svg>
  Email
</button>`;

  const outlineButtonCSS = `/* Outline Button Base Styles */
.btn-outline {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #18181b; /* zinc-900 */
  font-weight: 600;
  border-radius: 0.375rem;
  border: 2px solid #d4d4d8; /* zinc-300 */
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-outline:hover {
  background-color: #fafafa; /* zinc-50 */
}

/* Dark Mode Styles */
@media (prefers-color-scheme: dark) {
  .btn-outline {
    color: #fafafa; /* zinc-50 */
    border-color: #3f3f46; /* zinc-700 */
  }
  
  .btn-outline:hover {
    background-color: #18181b; /* zinc-900 */
  }
}`;

  const outlineButtonPrompt = `# AI PROMPT: Generate Outline Button Component

## CONTEXT
Tertiary button with transparent background and prominent border for lower emphasis actions.

## REQUIREMENTS
- Background: transparent
- Border: 2px solid zinc-300 (light) / zinc-700 (dark)
- Text: zinc-900 (light) / zinc-50 (dark)
- Hover: subtle background zinc-50 (light) / zinc-900 (dark)
- Use for tertiary actions and optional features

Generate following Strata DS specifications.`;

  // Code examples for Ghost Button
  const ghostButtonReact = `import { ChevronRight } from 'lucide-react';

export function GhostButton() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Basic Ghost Button */}
      <button className="px-4 py-2 bg-transparent text-foreground font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
        Button
      </button>

      {/* Ghost Button with Icon */}
      <button className="px-4 py-2 bg-transparent text-foreground font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2">
        Learn more
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}`;

  const ghostButtonHTML = `<!-- Basic Ghost Button -->
<button class="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
  Button
</button>

<!-- Ghost Button with Icon -->
<button class="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
  Learn more
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round"/>
  </svg>
</button>`;

  const ghostButtonCSS = `/* Ghost Button Base Styles */
.btn-ghost {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #18181b; /* zinc-900 */
  font-weight: 600;
  border-radius: 0.375rem;
  border: none;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-ghost:hover {
  background-color: #f4f4f5; /* zinc-100 */
}

/* Dark Mode Styles */
@media (prefers-color-scheme: dark) {
  .btn-ghost {
    color: #fafafa; /* zinc-50 */
  }
  
  .btn-ghost:hover {
    background-color: #27272a; /* zinc-800 */
  }
}`;

  const ghostButtonPrompt = `# AI PROMPT: Generate Ghost Button Component

## CONTEXT
Minimal button with no background or border, only showing hover state.

## REQUIREMENTS
- Background: transparent (no background)
- No border
- Text: zinc-900 (light) / zinc-50 (dark)
- Hover: subtle background zinc-100 (light) / zinc-800 (dark)
- Use for minimal emphasis actions

Generate following Strata DS specifications.`;

  // Code examples for Destructive Button
  const destructiveButtonReact = `import { Trash2 } from 'lucide-react';

export function DestructiveButton() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Solid Destructive Button */}
      <button className="px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded-md hover:bg-destructive/90 transition-colors">
        Delete
      </button>

      {/* Destructive Button with Icon */}
      <button className="px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded-md hover:bg-destructive/90 transition-colors flex items-center gap-2">
        <Trash2 className="w-4 h-4" />
        Remove
      </button>

      {/* Destructive Outline */}
      <button className="px-4 py-2 bg-transparent text-destructive font-semibold rounded-md hover:bg-destructive/10 transition-colors border-2 border-destructive">
        Delete Outline
      </button>
    </div>
  );
}`;

  const destructiveButtonHTML = `<!-- Solid Destructive Button -->
<button class="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
  Delete
</button>

<!-- Destructive Button with Icon -->
<button class="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors flex items-center gap-2">
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke-width="2"/>
  </svg>
  Remove
</button>`;

  const destructiveButtonCSS = `/* Destructive Button Base Styles */
.btn-destructive {
  padding: 0.5rem 1rem;
  background-color: #dc2626; /* red-600 */
  color: #ffffff;
  font-weight: 600;
  border-radius: 0.375rem;
  border: none;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
}

.btn-destructive:hover {
  background-color: #b91c1c; /* red-700 */
}

/* Outline variant */
.btn-destructive-outline {
  background-color: transparent;
  color: #dc2626; /* red-600 */
  border: 2px solid #fca5a5; /* red-300 */
}

.btn-destructive-outline:hover {
  background-color: #fef2f2; /* red-50 */
}`;

  const destructiveButtonPrompt = `# AI PROMPT: Generate Destructive Button Component

## CONTEXT
Warning button for dangerous or irreversible actions like delete or remove.

## REQUIREMENTS
- Background: red-600 (both modes)
- Text: white
- Hover: red-700
- Use for destructive actions (delete, remove, cancel)
- Always confirm before executing action
- Consider adding confirmation dialog

Generate following Strata DS specifications.`;

  // Code examples for Link Button
  const linkButtonReact = `import { ChevronRight } from 'lucide-react';

export function LinkButton() {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Basic Link Button */}
      <button className="px-0 py-0 text-foreground font-semibold underline underline-offset-4 hover:text-muted-foreground transition-colors">
        Link Button
      </button>

      {/* Link Button with Icon */}
      <button className="px-0 py-0 text-foreground font-semibold underline underline-offset-4 hover:text-muted-foreground transition-colors flex items-center gap-1">
        View details
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}`;

  const linkButtonHTML = `<!-- Basic Link Button -->
<button class="px-0 py-0 text-zinc-900 dark:text-zinc-50 font-semibold underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
  Link Button
</button>

<!-- Link Button with Icon -->
<button class="px-0 py-0 text-zinc-900 dark:text-zinc-50 font-semibold underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1">
  View details
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round"/>
  </svg>
</button>`;

  const linkButtonCSS = `/* Link Button Base Styles */
.btn-link {
  padding: 0;
  background: none;
  border: none;
  color: #18181b; /* zinc-900 */
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: color 0.15s ease-in-out;
  cursor: pointer;
}

.btn-link:hover {
  color: #52525b; /* zinc-600 */
}

/* Dark Mode Styles */
@media (prefers-color-scheme: dark) {
  .btn-link {
    color: #fafafa; /* zinc-50 */
  }
  
  .btn-link:hover {
    color: #d4d4d8; /* zinc-300 */
  }
}`;

  const linkButtonPrompt = `# AI PROMPT: Generate Link Button Component

## CONTEXT
Text-style button for inline navigation and text-like actions.

## REQUIREMENTS
- No background or padding
- Text: zinc-900 (light) / zinc-50 (dark)
- Underlined text with 4px offset
- Hover: zinc-600 (light) / zinc-300 (dark)
- Use for inline navigation and secondary links

Generate following Strata DS specifications.`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Buttons
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Primary interaction elements with variants, sizes, and states for all use cases.
        </p>
      </div>

      {/* Brand Button */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Brand Button
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          High-visibility primary action button using the Volt Lime brand color. Optimized for accessibility with dark text in both modes or light backgrounds.
        </p>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-600 rounded-md p-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-32">
              <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Variant
              </div>
              <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                Brand
              </code>
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Usage
              </div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Major conversion actions (e.g., "Upgrade", "Buy Now", "Sign Up").
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="px-4 py-2 bg-brand-200 text-zinc-900 font-semibold rounded-md hover:bg-brand-300 dark:bg-brand-400 dark:text-zinc-900 dark:hover:bg-brand-500 transition-colors">
              Brand Action
            </button>
            <button className="px-4 py-2 bg-brand-200 text-zinc-900 font-semibold rounded-md hover:bg-brand-300 dark:bg-brand-400 dark:text-zinc-900 dark:hover:bg-brand-500 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              With Icon
            </button>
          </div>
          <CodeViewer
            title="Brand Button"
            react={`<Button variant="brand">Brand Action</Button>`}
            html={`<button class="bg-brand-200 dark:bg-brand-400 text-zinc-900 ...">Brand Action</button>`}
            css={`.btn-brand { background-color: #f5ff92; color: #18181b; }`}
            prompt="Generate a brand-colored primary button."
          />
        </div>
      </div>

      {/* Button Variants */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Button Variants
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          6 button styles for different emphasis levels and contexts.
        </p>

        <div className="space-y-6">
          {/* Primary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-600 rounded-md p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-32">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Variant
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  Primary
                </code>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Main CTAs, primary actions, highest emphasis
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                Primary
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
                Button
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                With Icon
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-muted text-muted-foreground font-semibold rounded-md cursor-not-allowed opacity-50" disabled>
                Disabled
              </button>
            </div>

            {/* Code Viewer */}
            <CodeViewer
              title="Primary Button"
              react={primaryButtonReact}
              html={primaryButtonHTML}
              css={primaryButtonCSS}
              prompt={primaryButtonPrompt}
              enableFigmaExport={true}
              figmaSpecs={{
                padding: '16px horizontal, 8px vertical',
                backgroundColor: '#18181b (light) / #fafafa (dark)',
                color: '#fafafa (light) / #18181b (dark)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
              figmaTokens={{
                colors: {
                  'button-bg-light': '#18181b',
                  'button-bg-dark': '#fafafa',
                  'button-text-light': '#fafafa',
                  'button-text-dark': '#18181b',
                  'button-hover-light': '#27272a',
                  'button-hover-dark': '#e4e4e7',
                },
                spacing: {
                  'button-padding-x': '16px',
                  'button-padding-y': '8px',
                  'button-gap': '8px',
                },
                borders: {
                  'button-radius': '6px',
                },
              }}
            />
          </div>

          {/* Secondary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-600 rounded-md p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-32">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Variant
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  Secondary
                </code>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Secondary actions, medium emphasis
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">
                Primary
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors border border-input">
                Button
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors border border-input flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors border border-input flex items-center gap-2">
                Settings
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Code Viewer */}
            <CodeViewer
              title="Secondary Button"
              react={secondaryButtonReact}
              html={secondaryButtonHTML}
              css={secondaryButtonCSS}
              prompt={secondaryButtonPrompt}
              enableFigmaExport={true}
              figmaSpecs={{
                padding: '16px horizontal, 8px vertical',
                backgroundColor: '#f4f4f5 (light) / #27272a (dark)',
                color: '#18181b (light) / #fafafa (dark)',
                border: '1px solid #d4d4d8 (light) / #3f3f46 (dark)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
              figmaTokens={{
                colors: {
                  'button-bg-light': '#f4f4f5',
                  'button-bg-dark': '#27272a',
                  'button-text-light': '#18181b',
                  'button-text-dark': '#fafafa',
                  'button-border-light': '#d4d4d8',
                  'button-border-dark': '#3f3f46',
                },
                spacing: {
                  'button-padding-x': '16px',
                  'button-padding-y': '8px',
                },
                borders: {
                  'button-radius': '6px',
                  'button-width': '1px',
                },
              }}
            />
          </div>

          {/* Outline */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-32">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Variant
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  Outline
                </code>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tertiary actions, lower emphasis
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-2 border-zinc-300 dark:border-zinc-700">
                Button
              </button>
              <button className="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-2 border-zinc-300 dark:border-zinc-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>

            {/* Code Viewer */}
            <CodeViewer
              title="Outline Button"
              react={outlineButtonReact}
              html={outlineButtonHTML}
              css={outlineButtonCSS}
              prompt={outlineButtonPrompt}
              enableFigmaExport={true}
              figmaSpecs={{
                padding: '16px horizontal, 8px vertical',
                backgroundColor: 'transparent',
                color: '#18181b (light) / #fafafa (dark)',
                border: '2px solid #d4d4d8 (light) / #3f3f46 (dark)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
              figmaTokens={{
                colors: {
                  'button-text-light': '#18181b',
                  'button-text-dark': '#fafafa',
                  'button-border-light': '#d4d4d8',
                  'button-border-dark': '#3f3f46',
                  'button-hover-bg-light': '#fafafa',
                  'button-hover-bg-dark': '#18181b',
                },
                spacing: {
                  'button-padding-x': '16px',
                  'button-padding-y': '8px',
                },
                borders: {
                  'button-radius': '6px',
                  'button-width': '2px',
                },
              }}
            />
          </div>

          {/* Ghost */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-32">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Variant
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  Ghost
                </code>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Minimal actions, no background
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                Button
              </button>
              <button className="px-4 py-2 bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2">
                Learn more
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Code Viewer */}
            <CodeViewer
              title="Ghost Button"
              react={ghostButtonReact}
              html={ghostButtonHTML}
              css={ghostButtonCSS}
              prompt={ghostButtonPrompt}
              enableFigmaExport={true}
              figmaSpecs={{
                padding: '16px horizontal, 8px vertical',
                backgroundColor: 'transparent',
                color: '#18181b (light) / #fafafa (dark)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
              figmaTokens={{
                colors: {
                  'button-text-light': '#18181b',
                  'button-text-dark': '#fafafa',
                  'button-hover-bg-light': '#f4f4f5',
                  'button-hover-bg-dark': '#27272a',
                },
                spacing: {
                  'button-padding-x': '16px',
                  'button-padding-y': '8px',
                },
                borders: {
                  'button-radius': '6px',
                },
              }}
            />
          </div>

          {/* Destructive */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-32">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Variant
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  Destructive
                </code>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Delete, remove, dangerous actions
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-red-600 dark:bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 dark:hover:bg-red-700 transition-colors">
                Delete
              </button>
              <button className="px-4 py-2 bg-red-600 dark:bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 dark:hover:bg-red-700 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button className="px-4 py-2 bg-transparent text-red-600 dark:text-red-500 font-semibold rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-2 border-red-300 dark:border-red-800">
                Delete Outline
              </button>
            </div>

            {/* Code Viewer */}
            <CodeViewer
              title="Destructive Button"
              react={destructiveButtonReact}
              html={destructiveButtonHTML}
              css={destructiveButtonCSS}
              prompt={destructiveButtonPrompt}
              enableFigmaExport={true}
              figmaSpecs={{
                padding: '16px horizontal, 8px vertical',
                backgroundColor: '#dc2626 (red-600)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
              figmaTokens={{
                colors: {
                  'button-bg': '#dc2626',
                  'button-text': '#ffffff',
                  'button-hover-bg': '#b91c1c',
                  'button-outline-border': '#fca5a5',
                  'button-outline-text': '#dc2626',
                },
                spacing: {
                  'button-padding-x': '16px',
                  'button-padding-y': '8px',
                },
                borders: {
                  'button-radius': '6px',
                },
              }}
            />
          </div>

          {/* Link */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="w-32">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Variant
                </div>
                <code className="text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  Link
                </code>
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Usage
                </div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Inline navigation, text-like actions
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-0 py-0 text-zinc-900 dark:text-zinc-50 font-semibold underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                Link Button
              </button>
              <button className="px-0 py-0 text-zinc-900 dark:text-zinc-50 font-semibold underline underline-offset-4 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1">
                View details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Code Viewer */}
            <CodeViewer
              title="Link Button"
              react={linkButtonReact}
              html={linkButtonHTML}
              css={linkButtonCSS}
              prompt={linkButtonPrompt}
              enableFigmaExport={true}
              figmaSpecs={{
                padding: 'none',
                backgroundColor: 'transparent',
                color: '#18181b (light) / #fafafa (dark)',
                textDecoration: 'underline with 4px offset',
                fontSize: '14px',
                fontWeight: '600',
              }}
              figmaTokens={{
                colors: {
                  'link-text-light': '#18181b',
                  'link-text-dark': '#fafafa',
                  'link-hover-light': '#52525b',
                  'link-hover-dark': '#d4d4d8',
                },
                typography: {
                  'link-decoration': 'underline',
                  'link-offset': '4px',
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Button Sizes
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          4 size options from compact to large. Medium is the default size.
        </p>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="text-center">
              <button className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mb-2">
                Small
              </button>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">sm</div>
            </div>
            <div className="text-center">
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mb-2">
                Medium
              </button>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">md (default)</div>
            </div>
            <div className="text-center">
              <button className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-lg font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mb-2">
                Large
              </button>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">lg</div>
            </div>
            <div className="text-center">
              <button className="px-6 py-3 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-xl font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mb-2">
                Extra Large
              </button>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">xl</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CodeViewer
            title="Button Sizes"
            react={`{/* Small */}
<button className="px-3 py-1.5. text-sm ..">Small</button>

{/* Medium */}
<button className="px-4 py-2 ...">Medium</button>

{/* Large */}
<button className="px-5 py-2.5 text-lg ...">Large</button>

{/* Extra Large */}
<button className="px-6 py-3 text-xl ...">Extra Large</button>`}
            html={`<!-- Button Size Examples -->`}
            css={`/* Utility classes */`}
            prompt="Generate button size variants."
          />
        </div>
      </div>

      {/* Icon Buttons */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Icon Buttons
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Square buttons with icons only for compact interfaces.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Icon */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Primary
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ghost Icon */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Ghost
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 text-zinc-900 dark:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 text-zinc-900 dark:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 text-zinc-900 dark:text-zinc-50 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Destructive Icon */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Destructive
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 text-red-600 dark:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Brand Icon */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Brand
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 bg-brand-200 text-zinc-900 rounded-md hover:bg-brand-300 dark:bg-brand-400 dark:text-zinc-900 dark:hover:bg-brand-500 transition-colors flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-brand-200 text-zinc-900 rounded-md hover:bg-brand-300 dark:bg-brand-400 dark:text-zinc-900 dark:hover:bg-brand-500 transition-colors flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-brand-200 text-zinc-900 rounded-md hover:bg-brand-300 dark:bg-brand-400 dark:text-zinc-900 dark:hover:bg-brand-500 transition-colors flex items-center justify-center">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CodeViewer
            title="Icon Buttons"
            react={`{/* Primary Icon */}
<button className="w-10 h-10 bg-zinc-900 text-white ..."><Plus /></button>

{/* Brand Icon */}
<button className="w-10 h-10 bg-brand-200 text-zinc-900 ..."><Plus /></button>

{/* Ghost Icon */}
<button className="w-10 h-10 hover:bg-zinc-100 ..."><Plus /></button>`}
            html={`<!-- Icon Buttons -->`}
            css={`/* Icon button styles */`}
            prompt="Generate icon buttons."
          />
        </div>
      </div>

      {/* Button Groups */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Button Groups
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Connected buttons for related actions.
        </p>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-l-md border-r border-zinc-700 dark:border-zinc-300 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                Save
              </button>
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold border-r border-zinc-700 dark:border-zinc-300 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                Preview
              </button>
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-r-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                Publish
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="inline-flex rounded-md" role="group">
              <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold rounded-l-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Day
              </button>
              <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-t border-b border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Week
              </button>
              <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border-t border-b border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                Month
              </button>
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-r-md border border-zinc-900 dark:border-zinc-50">
                Year
              </button>
            </div>
          </div>

          {/* Brand Group */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button className="px-4 py-2 bg-brand-200 dark:bg-brand-400 text-zinc-900 font-semibold rounded-l-md border-r border-brand-300 dark:border-brand-500 hover:bg-brand-300 dark:hover:bg-brand-500 transition-colors">
                Left
              </button>
              <button className="px-4 py-2 bg-brand-200 dark:bg-brand-400 text-zinc-900 font-semibold border-r border-brand-300 dark:border-brand-500 hover:bg-brand-300 dark:hover:bg-brand-500 transition-colors">
                Middle
              </button>
              <button className="px-4 py-2 bg-brand-200 dark:bg-brand-400 text-zinc-900 font-semibold rounded-r-md hover:bg-brand-300 dark:hover:bg-brand-500 transition-colors">
                Right
              </button>
            </div>
          </div>
        </div>

        <CodeViewer
          title="Button Groups"
          react={`{/* Group 1 */}
<div className="inline-flex rounded-md shadow-sm" role="group">
  <button className="rounded-l-md ...">Save</button>
  <button className="...">Preview</button>
  <button className="rounded-r-md ...">Publish</button>
</div>

{/* Brand Group */}
<div className="inline-flex rounded-md shadow-sm" role="group">
  <button className="bg-brand-200 ...">Left</button>
  <button className="...">Middle</button>
  <button className="bg-brand-200 ...">Right</button>
</div>`}
          html={`<!-- Button Group -->`}
          css={`/* Button group styles */`}
          prompt="Generate button group."
        />
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
                <span>Use Primary buttons for main CTAs (1 per section)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use Secondary for supporting actions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Keep button text concise (1-3 words)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Use icon buttons for space-constrained layouts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                <span>Always confirm destructive actions</span>
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
                <span>Don't use multiple Primary buttons in one view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid long text labels that wrap to multiple lines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't use Destructive variant for non-destructive actions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Avoid icon-only buttons without tooltips</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                <span>Don't mix different button sizes in the same group</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Project Examples */}
      <section className="space-y-4 pt-12 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Project Examples (Custom)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Real-world usage patterns extracted from the Catalyst application. These are specific implementations using utility classes rather than the generic component.
        </p>
        <ProjectButtonsDemo />
      </section>
    </div>
  );
}