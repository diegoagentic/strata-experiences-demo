import React from 'react';
import { Button } from '../components';
import '../styles/index.css';

/**
 * Example: Using the Token-Based Button Component
 * 
 * This demonstrates how the new token-based architecture works:
 * 1. Components use CSS custom properties (--button-primary-background, etc.)
 * 2. Tokens can be customized by overriding CSS variables
 * 3. No hardcoded values - everything is themeable
 */

export function ButtonExample() {
    return (
        <div className="p-8 space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="destructive">Destructive Button</Button>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Button Sizes</h2>
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Button States</h2>
                <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button disabled>Disabled</Button>
                </div>
            </section>

            <section className="mt-12 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Custom Theming Example</h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Override CSS variables to customize the button appearance:
                </p>
                <div
                    className="space-y-4"
                    style={{
                        // Override token values for custom theme
                        '--button-primary-background': '#8B5CF6',
                        '--button-primary-background-hover': '#7C3AED',
                        '--button-primary-text': '#FFFFFF',
                        '--button-secondary-background': '#F3E8FF',
                        '--button-secondary-text': '#6B21A8',
                    } as React.CSSProperties}
                >
                    <div className="flex gap-3">
                        <Button variant="primary">Custom Primary</Button>
                        <Button variant="secondary">Custom Secondary</Button>
                    </div>
                    <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded overflow-x-auto">
                        {`style={{
  '--button-primary-background': '#8B5CF6',
  '--button-primary-background-hover': '#7C3AED',
  '--button-primary-text': '#FFFFFF',
}}`}
                    </pre>
                </div>
            </section>
        </div>
    );
}

export default ButtonExample;
