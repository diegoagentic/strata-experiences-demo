/**
 * Design System Foundations Data
 * Complete foundations data for the mock API
 */

export const foundations = {
  colors: {
    zinc: {
      '50': '#fafafa',
      '100': '#f4f4f5',
      '200': '#e4e4e7',
      '300': '#d4d4d8',
      '400': '#a1a1aa',
      '500': '#71717a',
      '600': '#52525b',
      '700': '#3f3f46',
      '800': '#27272a',
      '900': '#18181b',
      '950': '#09090b'
    },
    semantic: {
      success: {
        light: '#10b981',
        dark: '#6ee7b7',
        description: 'Success states, confirmations, positive actions'
      },
      error: {
        light: '#ef4444',
        dark: '#f87171',
        description: 'Error states, destructive actions, warnings'
      },
      warning: {
        light: '#f59e0b',
        dark: '#fbbf24',
        description: 'Warning states, caution messages'
      },
      info: {
        light: '#3b82f6',
        dark: '#60a5fa',
        description: 'Informational messages, help text'
      }
    },
    dataViz: [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#3b82f6',
      '#ef4444',
      '#14b8a6'
    ],
    metadata: {
      updated: '2024-01-15',
      version: '1.0.0',
      usage: 'Use Zinc scale for neutral UI. Semantic colors for states. Data viz for charts.'
    }
  },

  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, Monaco, monospace'
    },
    scale: {
      'display-lg': {
        size: '36px',
        lineHeight: '40px',
        weight: 700,
        letterSpacing: '-0.02em',
        usage: 'Large page titles, hero headings'
      },
      'heading-1': {
        size: '30px',
        lineHeight: '36px',
        weight: 700,
        letterSpacing: '-0.01em',
        usage: 'Page headings, section titles'
      },
      'heading-2': {
        size: '24px',
        lineHeight: '32px',
        weight: 700,
        letterSpacing: '-0.01em',
        usage: 'Subsection headings'
      },
      'body-base': {
        size: '16px',
        lineHeight: '24px',
        weight: 400,
        letterSpacing: '0',
        usage: 'Default body text'
      }
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    metadata: {
      updated: '2024-01-15',
      version: '1.0.0'
    }
  },

  spacing: {
    scale: {
      '0': '0px',
      '1': '8px',
      '2': '16px',
      '3': '24px',
      '4': '32px',
      '5': '40px',
      '6': '48px',
      '8': '64px',
      '10': '80px',
      '12': '96px'
    },
    grid: {
      base: 8,
      description: 'All spacing multiples of 8px'
    },
    containers: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    },
    metadata: {
      updated: '2024-01-15',
      version: '1.0.0'
    }
  },

  borders: {
    radius: {
      none: '0px',
      sm: '2px',
      base: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px'
    },
    width: {
      none: '0px',
      thin: '1px',
      base: '2px',
      thick: '4px'
    },
    metadata: {
      updated: '2024-01-15',
      version: '1.0.0'
    }
  },

  shadows: {
    elevation: {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    },
    metadata: {
      updated: '2024-01-15',
      version: '1.0.0'
    }
  }
};
