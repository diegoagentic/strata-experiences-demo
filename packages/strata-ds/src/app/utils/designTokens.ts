/**
 * Design Tokens Generator
 * Generates complete design tokens JSON based on the Strata DS design system
 */

export interface DesignTokensJSON {
  color: {
    primary: { value: string };
    secondary: { value: string };
    accent: { value: string };
    neutral: Record<string, { value: string }>;
    semantic: {
      success: { value: string };
      warning: { value: string };
      error: { value: string };
      info: { value: string };
    };
    furniture: {
      wood: Record<string, { value: string; category: string }>;
      metal: Record<string, { value: string; category: string }>;
      fabric: Record<string, { value: string; category: string }>;
      leather: Record<string, { value: string; category: string }>;
    };
  };
  font: {
    family: {
      base: { value: string };
      display: { value: string };
      mono: { value: string };
    };
    size: Record<string, { value: string }>;
    weight: Record<string, { value: number }>;
    lineHeight: Record<string, { value: string }>;
  };
  spacing: Record<string, { value: string }>;
  borderRadius: Record<string, { value: string }>;
  shadow: Record<string, { value: string }>;
  component: Record<string, any>;
}

export function generateDesignTokens(): DesignTokensJSON {
  return {
    color: {
      primary: { 
        value: "#18181b" // zinc-900
      },
      secondary: { 
        value: "#71717a" // zinc-500
      },
      accent: { 
        value: "#6366f1" // indigo-600
      },
      neutral: {
        "50": { value: "#fafafa" },
        "100": { value: "#f4f4f5" },
        "200": { value: "#e4e4e7" },
        "300": { value: "#d4d4d8" },
        "400": { value: "#a1a1aa" },
        "500": { value: "#71717a" },
        "600": { value: "#52525b" },
        "700": { value: "#3f3f46" },
        "800": { value: "#27272a" },
        "900": { value: "#18181b" },
        "950": { value: "#09090b" }
      },
      semantic: {
        success: { value: "#10b981" }, // emerald-600
        warning: { value: "#f59e0b" }, // amber-600
        error: { value: "#dc2626" },   // red-600
        info: { value: "#3b82f6" }     // blue-600
      },
      furniture: {
        wood: {
          oak: { 
            value: "#DEB887",
            category: "wood"
          },
          walnut: { 
            value: "#5C4033",
            category: "wood"
          },
          mahogany: { 
            value: "#C04000",
            category: "wood"
          },
          pine: {
            value: "#E3C16F",
            category: "wood"
          },
          maple: {
            value: "#D4A574",
            category: "wood"
          }
        },
        metal: {
          brass: { 
            value: "#B5A642",
            category: "metal"
          },
          steel: { 
            value: "#71797E",
            category: "metal"
          },
          aluminum: {
            value: "#A8A8A8",
            category: "metal"
          },
          copper: {
            value: "#B87333",
            category: "metal"
          }
        },
        fabric: {
          linen: { 
            value: "#FAF0E6",
            category: "fabric"
          },
          velvet: { 
            value: "#800020",
            category: "fabric"
          },
          cotton: {
            value: "#FFFEF0",
            category: "fabric"
          },
          wool: {
            value: "#F5F5DC",
            category: "fabric"
          }
        },
        leather: {
          brown: { 
            value: "#8B4513",
            category: "leather"
          },
          black: {
            value: "#1C1C1C",
            category: "leather"
          },
          tan: {
            value: "#D2B48C",
            category: "leather"
          }
        }
      }
    },
    font: {
      family: {
        base: { value: "Inter, system-ui, -apple-system, sans-serif" },
        display: { value: "Inter, system-ui, -apple-system, sans-serif" },
        mono: { value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }
      },
      size: {
        xs: { value: "0.75rem" },    // 12px
        sm: { value: "0.875rem" },   // 14px
        base: { value: "1rem" },     // 16px
        lg: { value: "1.125rem" },   // 18px
        xl: { value: "1.25rem" },    // 20px
        "2xl": { value: "1.5rem" },  // 24px
        "3xl": { value: "1.875rem" }, // 30px
        "4xl": { value: "2.25rem" },  // 36px
        "5xl": { value: "3rem" },     // 48px
        "6xl": { value: "3.75rem" }   // 60px
      },
      weight: {
        normal: { value: 400 },
        medium: { value: 500 },
        semibold: { value: 600 },
        bold: { value: 700 },
        extrabold: { value: 800 }
      },
      lineHeight: {
        none: { value: "1" },
        tight: { value: "1.25" },
        snug: { value: "1.375" },
        normal: { value: "1.5" },
        relaxed: { value: "1.625" },
        loose: { value: "2" }
      }
    },
    spacing: {
      "0": { value: "0" },
      "1": { value: "0.25rem" },  // 4px
      "2": { value: "0.5rem" },   // 8px
      "3": { value: "0.75rem" },  // 12px
      "4": { value: "1rem" },     // 16px
      "5": { value: "1.25rem" },  // 20px
      "6": { value: "1.5rem" },   // 24px
      "8": { value: "2rem" },     // 32px
      "10": { value: "2.5rem" },  // 40px
      "12": { value: "3rem" },    // 48px
      "16": { value: "4rem" },    // 64px
      "20": { value: "5rem" },    // 80px
      "24": { value: "6rem" },    // 96px
      "furniture-grid": { value: "8cm" } // Furniture grid unit
    },
    borderRadius: {
      none: { value: "0" },
      sm: { value: "0.125rem" },   // 2px
      base: { value: "0.25rem" },  // 4px
      md: { value: "0.375rem" },   // 6px
      lg: { value: "0.5rem" },     // 8px
      xl: { value: "0.75rem" },    // 12px
      "2xl": { value: "1rem" },    // 16px
      full: { value: "9999px" }
    },
    shadow: {
      sm: { value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
      base: { value: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)" },
      md: { value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
      lg: { value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
      xl: { value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
      "2xl": { value: "0 25px 50px -12px rgb(0 0 0 / 0.25)" },
      none: { value: "none" }
    },
    component: {
      button_primary: {
        background_color: { value: "{color.neutral.900.value}" },
        font_color: { value: "{color.neutral.50.value}" },
        font_size: { value: "{font.size.sm.value}" },
        font_weight: { value: "{font.weight.semibold.value}" },
        padding_x: { value: "{spacing.4.value}" },
        padding_y: { value: "{spacing.2.value}" },
        border_radius: { value: "{borderRadius.md.value}" },
        hover_background_color: { value: "{color.neutral.800.value}" }
      },
      button_secondary: {
        background_color: { value: "{color.neutral.100.value}" },
        font_color: { value: "{color.neutral.900.value}" },
        font_size: { value: "{font.size.sm.value}" },
        font_weight: { value: "{font.weight.semibold.value}" },
        padding_x: { value: "{spacing.4.value}" },
        padding_y: { value: "{spacing.2.value}" },
        border_radius: { value: "{borderRadius.md.value}" },
        border_color: { value: "{color.neutral.300.value}" },
        hover_background_color: { value: "{color.neutral.200.value}" }
      },
      input_default: {
        background_color: { value: "{color.neutral.50.value}" },
        font_color: { value: "{color.neutral.900.value}" },
        font_size: { value: "{font.size.sm.value}" },
        padding_x: { value: "{spacing.3.value}" },
        padding_y: { value: "{spacing.2.value}" },
        border_radius: { value: "{borderRadius.md.value}" },
        border_color: { value: "{color.neutral.300.value}" },
        focus_border_color: { value: "{color.accent.value}" }
      },
      card_default: {
        background_color: { value: "{color.neutral.50.value}" },
        border_radius: { value: "{borderRadius.lg.value}" },
        padding: { value: "{spacing.6.value}" },
        border_color: { value: "{color.neutral.200.value}" },
        shadow: { value: "{shadow.sm.value}" }
      },
      modal_default: {
        background_color: { value: "{color.neutral.50.value}" },
        border_radius: { value: "{borderRadius.xl.value}" },
        padding: { value: "{spacing.6.value}" },
        shadow: { value: "{shadow.2xl.value}" },
        overlay_color: { value: "rgb(0 0 0 / 0.5)" }
      },
      badge_default: {
        background_color: { value: "{color.neutral.100.value}" },
        font_color: { value: "{color.neutral.900.value}" },
        font_size: { value: "{font.size.xs.value}" },
        font_weight: { value: "{font.weight.semibold.value}" },
        padding_x: { value: "{spacing.2.value}" },
        padding_y: { value: "{spacing.1.value}" },
        border_radius: { value: "{borderRadius.base.value}" }
      },
      badge_success: {
        background_color: { value: "rgb(16 185 129 / 0.1)" },
        font_color: { value: "{color.semantic.success.value}" },
        font_size: { value: "{font.size.xs.value}" },
        font_weight: { value: "{font.weight.semibold.value}" },
        padding_x: { value: "{spacing.2.value}" },
        padding_y: { value: "{spacing.1.value}" },
        border_radius: { value: "{borderRadius.base.value}" }
      },
      badge_warning: {
        background_color: { value: "rgb(245 158 11 / 0.1)" },
        font_color: { value: "{color.semantic.warning.value}" },
        font_size: { value: "{font.size.xs.value}" },
        font_weight: { value: "{font.weight.semibold.value}" },
        padding_x: { value: "{spacing.2.value}" },
        padding_y: { value: "{spacing.1.value}" },
        border_radius: { value: "{borderRadius.base.value}" }
      },
      badge_error: {
        background_color: { value: "rgb(220 38 38 / 0.1)" },
        font_color: { value: "{color.semantic.error.value}" },
        font_size: { value: "{font.size.xs.value}" },
        font_weight: { value: "{font.weight.semibold.value}" },
        padding_x: { value: "{spacing.2.value}" },
        padding_y: { value: "{spacing.1.value}" },
        border_radius: { value: "{borderRadius.base.value}" }
      },
      navbar_default: {
        background_color: { value: "{color.neutral.50.value}" },
        border_color: { value: "{color.neutral.200.value}" },
        padding_x: { value: "{spacing.6.value}" },
        padding_y: { value: "{spacing.4.value}" },
        height: { value: "4rem" }
      },
      table_default: {
        background_color: { value: "{color.neutral.50.value}" },
        border_color: { value: "{color.neutral.200.value}" },
        header_background_color: { value: "{color.neutral.100.value}" },
        row_hover_background_color: { value: "{color.neutral.100.value}" },
        padding_x: { value: "{spacing.4.value}" },
        padding_y: { value: "{spacing.3.value}" }
      },
      furniture_product_card: {
        background_color: { value: "{color.neutral.50.value}" },
        border_radius: { value: "{borderRadius.lg.value}" },
        padding: { value: "{spacing.6.value}" },
        shadow: { value: "{shadow.md.value}" },
        image_aspect_ratio: { value: "2/3" },
        material_swatch_size: { value: "{spacing.8.value}" }
      }
    }
  };
}

/**
 * Download design tokens as JSON file
 */
export function downloadDesignTokens(): void {
  const tokens = generateDesignTokens();
  const json = JSON.stringify(tokens, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'design-tokens.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get design tokens as formatted JSON string
 */
export function getDesignTokensJSON(): string {
  const tokens = generateDesignTokens();
  return JSON.stringify(tokens, null, 2);
}

/**
 * Copy design tokens to clipboard
 */
export async function copyDesignTokensToClipboard(): Promise<boolean> {
  try {
    const json = getDesignTokensJSON();
    
    // Try modern Clipboard API first (silently fail if blocked)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(json);
        return true;
      } catch (err) {
        // Silently fall through to fallback
      }
    }
    
    // Fallback method using textarea + execCommand
    const textArea = document.createElement('textarea');
    textArea.value = json;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return success;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
