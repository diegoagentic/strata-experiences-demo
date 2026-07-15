/**
 * Mock API Server
 * Provides realistic API responses for demonstration and testing
 * This simulates the backend API until it's deployed
 */

import { foundations } from './foundationsData';
import { components } from './componentsData';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export class MockApiServer {
  private static baseUrl = 'https://api.strata-ds.com/v1';
  private static isValidApiKey(apiKey: string): boolean {
    const validKeys = ['strata_test_key_12345', 'strata_demo_key_67890'];
    return validKeys.includes(apiKey);
  }

  /**
   * Simulate API request with realistic delay and authentication
   */
  private static async simulateRequest<T>(
    endpoint: string,
    apiKey?: string
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    // Check authentication
    if (!apiKey) {
      return {
        success: false,
        error: {
          message: 'Authentication required. Please provide a valid API key or Bearer token.',
          code: 'UNAUTHORIZED',
          details: {
            'x-api-key': 'Provide API key in header',
            'Authorization': 'Or provide Bearer token in header'
          }
        }
      };
    }

    if (!this.isValidApiKey(apiKey)) {
      return {
        success: false,
        error: {
          message: 'Invalid API key',
          code: 'INVALID_API_KEY'
        }
      };
    }

    // Route to appropriate handler
    return this.routeRequest<T>(endpoint);
  }

  private static routeRequest<T>(endpoint: string): ApiResponse<T> {
    // Foundations
    if (endpoint === '/foundations') {
      return { success: true, data: foundations as T };
    }
    if (endpoint === '/foundations/colors') {
      return { success: true, data: foundations.colors as T };
    }
    if (endpoint === '/foundations/typography') {
      return { success: true, data: foundations.typography as T };
    }
    if (endpoint === '/foundations/spacing') {
      return { success: true, data: foundations.spacing as T };
    }
    if (endpoint === '/foundations/borders') {
      return { success: true, data: foundations.borders as T };
    }
    if (endpoint === '/foundations/shadows') {
      return { success: true, data: foundations.shadows as T };
    }

    // Components
    if (endpoint === '/components') {
      const stats = {
        total: components.length,
        aiReady: components.filter(c => c.status === 'ai-ready').length,
        inProgress: components.filter(c => c.status === 'in-progress').length,
        special: components.filter(c => c.status === 'special').length
      };
      return {
        success: true,
        data: { stats, components } as T
      };
    }

    // Component by ID
    const componentMatch = endpoint.match(/^\/components\/([^\/]+)$/);
    if (componentMatch) {
      const id = componentMatch[1];
      const component = components.find(c => c.id === id);
      if (!component) {
        return {
          success: false,
          error: {
            message: `Component '${id}' not found`,
            code: 'COMPONENT_NOT_FOUND'
          }
        };
      }
      return { success: true, data: component as T };
    }

    // Component code by format
    const codeMatch = endpoint.match(/^\/components\/([^\/]+)\/code\/([^\/]+)$/);
    if (codeMatch) {
      const [, id, format] = codeMatch;
      const component = components.find(c => c.id === id);
      if (!component) {
        return {
          success: false,
          error: {
            message: `Component '${id}' not found`,
            code: 'COMPONENT_NOT_FOUND'
          }
        };
      }
      if (!component.code) {
        return {
          success: false,
          error: {
            message: `Code examples not available for component '${id}'`,
            code: 'CODE_NOT_AVAILABLE'
          }
        };
      }

      const formatMap: Record<string, keyof typeof component.code> = {
        'react': 'react',
        'html': 'html',
        'css': 'css',
        'ai-prompt': 'aiPrompt'
      };

      const codeKey = formatMap[format];
      if (!codeKey || !component.code[codeKey]) {
        return {
          success: false,
          error: {
            message: `Format '${format}' not available`,
            code: 'INVALID_FORMAT'
          }
        };
      }

      return {
        success: true,
        data: {
          componentId: id,
          componentName: component.name,
          format,
          code: component.code[codeKey]
        } as T
      };
    }

    // Component tokens
    const tokensMatch = endpoint.match(/^\/components\/([^\/]+)\/tokens$/);
    if (tokensMatch) {
      const id = tokensMatch[1];
      const component = components.find(c => c.id === id);
      if (!component) {
        return {
          success: false,
          error: {
            message: `Component '${id}' not found`,
            code: 'COMPONENT_NOT_FOUND'
          }
        };
      }
      if (!component.tokens) {
        return {
          success: false,
          error: {
            message: `Tokens not available for component '${id}'`,
            code: 'TOKENS_NOT_AVAILABLE'
          }
        };
      }

      return {
        success: true,
        data: {
          componentId: id,
          componentName: component.name,
          tokens: component.tokens
        } as T
      };
    }

    // Search
    const searchMatch = endpoint.match(/^\/search\?q=(.+)$/);
    if (searchMatch) {
      const query = decodeURIComponent(searchMatch[1]).toLowerCase();
      const results = components.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );

      return {
        success: true,
        data: {
          query: decodeURIComponent(searchMatch[1]),
          total: results.length,
          results
        } as T
      };
    }

    // 404
    return {
      success: false,
      error: {
        message: `Route ${endpoint} not found`,
        code: 'NOT_FOUND'
      }
    };
  }

  /**
   * Public API methods
   */

  static async get<T = any>(endpoint: string, apiKey?: string): Promise<ApiResponse<T>> {
    return this.simulateRequest<T>(endpoint, apiKey);
  }

  static getBaseUrl(): string {
    return this.baseUrl;
  }

  static getTestApiKey(): string {
    return 'strata_test_key_12345';
  }

  /**
   * Generate cURL command
   */
  static generateCurl(endpoint: string, apiKey: string = this.getTestApiKey()): string {
    return `curl -X GET "${this.baseUrl}${endpoint}" \\
  -H "x-api-key: ${apiKey}" \\
  -H "Content-Type: application/json"`;
  }

  /**
   * Generate JavaScript fetch example
   */
  static generateFetch(endpoint: string, apiKey: string = this.getTestApiKey()): string {
    return `const response = await fetch('${this.baseUrl}${endpoint}', {
  headers: {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
  }

  /**
   * Generate Python example
   */
  static generatePython(endpoint: string, apiKey: string = this.getTestApiKey()): string {
    return `import requests

headers = {
    'x-api-key': '${apiKey}',
    'Content-Type': 'application/json'
}

response = requests.get('${this.baseUrl}${endpoint}', headers=headers)
data = response.json()
print(data)`;
  }
}

export default MockApiServer;
