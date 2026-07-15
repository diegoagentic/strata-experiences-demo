/**
 * Components Data for Mock API
 */

export interface Component {
  id: string;
  name: string;
  category: string;
  status: 'ai-ready' | 'in-progress' | 'special';
  description: string;
  variants: number;
  code?: {
    react: string;
    html: string;
    css: string;
    aiPrompt: string;
  };
  tokens?: {
    colors: Record<string, string>;
    spacing: Record<string, string>;
  };
}

export const components: Component[] = [
  {
    id: 'button',
    name: 'Buttons',
    category: 'Application UI',
    status: 'ai-ready',
    description: 'Interactive button components with multiple variants and states',
    variants: 6,
    code: {
      react: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-md transition-colors';
  
  const variantClasses = {
    primary: 'bg-zinc-900 dark:bg-zinc-700 text-zinc-50 hover:bg-zinc-800',
    secondary: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50',
    ghost: 'text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}`,
      html: `<button class="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-zinc-50 font-semibold rounded-md hover:bg-zinc-800 transition-colors">
  Click me
</button>`,
      css: `.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-weight: 600;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #18181b;
  color: #fafafa;
}

.btn-primary:hover {
  background-color: #27272a;
}`,
      aiPrompt: `# AI PROMPT: Generate Button Component

## CONTEXT
Create a button component for Strata DS using Zinc greyscale and Tailwind CSS.

## REQUIREMENTS
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- Full light/dark mode support
- Hover and active states
- TypeScript types
- Accessible (ARIA labels)

## DESIGN TOKENS
- Primary bg: zinc-900 (light) / zinc-700 (dark)
- Padding: 8px, 16px, 24px
- Border radius: 6px
- Font weight: 600

Generate the React component with TypeScript.`
    },
    tokens: {
      colors: {
        'primary-bg-light': '#18181b',
        'primary-bg-dark': '#3f3f46',
        'primary-text': '#fafafa'
      },
      spacing: {
        'padding-sm': '6px 12px',
        'padding-md': '8px 16px',
        'padding-lg': '12px 24px'
      }
    }
  },
  {
    id: 'badge',
    name: 'Badges',
    category: 'Application UI',
    status: 'ai-ready',
    description: 'Small count and labeling components with semantic colors',
    variants: 4,
    code: {
      react: `export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };
  
  return (
    <span className={\`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold \${variants[variant]}\`}>
      {children}
    </span>
  );
}`,
      html: `<span class="inline-flex items-center px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-md text-xs font-semibold">
  Badge
</span>`,
      css: `.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.375rem;
}`,
      aiPrompt: `# AI PROMPT: Generate Badge Component

Create a badge component with semantic variants (default, success, error, warning).`
    },
    tokens: {
      colors: {
        'default-bg': '#f4f4f5',
        'success-bg': '#d1fae5'
      },
      spacing: {
        padding: '4px 8px'
      }
    }
  },
  {
    id: 'modal',
    name: 'Modals',
    category: 'Overlays',
    status: 'ai-ready',
    description: 'Dialog overlays for important actions and content',
    variants: 3
  },
  {
    id: 'alert',
    name: 'Alerts',
    category: 'Overlays',
    status: 'ai-ready',
    description: 'Feedback messages with semantic colors',
    variants: 4
  },
  {
    id: 'navbar',
    name: 'Navbars',
    category: 'Application UI',
    status: 'ai-ready',
    description: 'Primary navigation components',
    variants: 5
  },
  {
    id: 'input',
    name: 'Input Groups',
    category: 'Forms',
    status: 'ai-ready',
    description: 'Text input fields with labels and validation',
    variants: 6
  },
  {
    id: 'data-table',
    name: 'Data Tables',
    category: 'Data Display',
    status: 'in-progress',
    description: 'Complex data tables with sorting and filtering',
    variants: 2
  },
  {
    id: 'avatar',
    name: 'Avatars',
    category: 'Application UI',
    status: 'ai-ready',
    description: 'User profile images and placeholders',
    variants: 4
  }
];
