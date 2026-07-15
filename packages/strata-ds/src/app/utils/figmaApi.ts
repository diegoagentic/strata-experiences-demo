/**
 * Figma API Integration
 * Real implementation to fetch design data from Figma files
 */

export interface FigmaConfig {
  accessToken: string;
  fileKey: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  [key: string]: any;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface FigmaStylesResponse {
  meta: {
    styles: Array<{
      key: string;
      file_key: string;
      node_id: string;
      style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
      name: string;
      description: string;
    }>;
  };
}

export class FigmaAPIClient {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch file data from Figma
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API Error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch file styles (colors, text styles, etc.)
   */
  async getFileStyles(fileKey: string): Promise<FigmaStylesResponse> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}/styles`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API Error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch specific node data
   */
  async getNode(fileKey: string, nodeId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/files/${fileKey}/nodes?ids=${nodeId}`,
      {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API Error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch file components
   */
  async getFileComponents(fileKey: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}/components`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API Error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get images/exports from Figma
   */
  async getImages(
    fileKey: string,
    nodeIds: string[],
    format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png',
    scale: number = 1
  ): Promise<Record<string, string>> {
    const idsParam = nodeIds.join(',');
    const response = await fetch(
      `${this.baseUrl}/images/${fileKey}?ids=${idsParam}&format=${format}&scale=${scale}`,
      {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API Error: ${error.message || response.statusToken}`);
    }

    const data = await response.json();
    return data.images;
  }

  /**
   * Extract color styles from Figma file
   */
  async extractColorTokens(fileKey: string): Promise<Record<string, string>> {
    const file = await this.getFile(fileKey);
    const colorTokens: Record<string, string> = {};

    // Traverse the document to find color styles
    const traverse = (node: FigmaNode) => {
      // Check for fills (colors)
      if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b, a } = fill.color;
            const hex = this.rgbaToHex(r, g, b, a || 1);
            const tokenName = this.sanitizeTokenName(node.name);
            colorTokens[tokenName] = hex;
          }
        });
      }

      // Recursively traverse children
      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(file.document);
    return colorTokens;
  }

  /**
   * Extract text styles from Figma file
   */
  async extractTextStyles(fileKey: string): Promise<any> {
    const file = await this.getFile(fileKey);
    const textStyles: any = {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
    };

    const traverse = (node: FigmaNode) => {
      if (node.type === 'TEXT' && node.style) {
        const style = node.style;
        const tokenName = this.sanitizeTokenName(node.name);

        if (style.fontFamily) {
          textStyles.fontFamily[tokenName] = style.fontFamily;
        }
        if (style.fontSize) {
          textStyles.fontSize[tokenName] = `${style.fontSize}px`;
        }
        if (style.fontWeight) {
          textStyles.fontWeight[tokenName] = style.fontWeight;
        }
        if (style.lineHeightPx) {
          textStyles.lineHeight[tokenName] = `${style.lineHeightPx}px`;
        }
      }

      if (node.children) {
        node.children.forEach(traverse);
      }
    };

    traverse(file.document);
    return textStyles;
  }

  /**
   * Extract component information
   */
  async extractComponents(fileKey: string): Promise<any[]> {
    const componentsData = await this.getFileComponents(fileKey);
    const file = await this.getFile(fileKey);

    const components: any[] = [];

    for (const [key, component] of Object.entries(componentsData.meta.components)) {
      const comp: any = component;
      components.push({
        id: key,
        name: comp.name,
        description: comp.description || '',
        key: comp.key,
        fileKey,
      });
    }

    return components;
  }

  /**
   * Helper: Convert RGBA to HEX
   */
  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    if (a < 1) {
      return `${hex}${toHex(a)}`;
    }
    
    return hex;
  }

  /**
   * Helper: Sanitize token name
   */
  private sanitizeTokenName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

/**
 * Parse Figma file URL to extract file key
 */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  // Match patterns like:
  // https://www.figma.com/file/FILE_KEY/...
  // https://www.figma.com/design/FILE_KEY/...
  const fileMatch = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  
  if (!fileMatch) {
    return null;
  }

  const fileKey = fileMatch[2];

  // Try to extract node ID if present
  // Pattern: ?node-id=NODE_ID or #NODE_ID
  const nodeMatch = url.match(/node-id=([0-9:-]+)|#([0-9:-]+)/);
  const nodeId = nodeMatch ? (nodeMatch[1] || nodeMatch[2]) : undefined;

  return { fileKey, nodeId };
}

/**
 * Validate Figma access token
 */
export async function validateFigmaToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': token,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get user's Figma information
 */
export async function getFigmaUser(token: string): Promise<any> {
  const response = await fetch('https://api.figma.com/v1/me', {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid Figma token');
  }

  return await response.json();
}

/**
 * Local storage helpers for Figma token
 */
export const FigmaTokenStorage = {
  save(token: string): void {
    localStorage.setItem('figma_access_token', token);
  },

  get(): string | null {
    return localStorage.getItem('figma_access_token');
  },

  remove(): void {
    localStorage.removeItem('figma_access_token');
  },

  exists(): boolean {
    return localStorage.getItem('figma_access_token') !== null;
  },
};
