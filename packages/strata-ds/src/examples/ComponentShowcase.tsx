import React, { useState } from 'react';
import {
    Button,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Badge,
    Modal,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalContent,
    ModalFooter,
    ThemeProvider
} from '../components';
import '../styles/index.css';

/**
 * Comprehensive Component Showcase
 * 
 * Demonstrates all token-based components with theming examples
 */

export function ComponentShowcase() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        White Label Design System
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Token-based components with easy theming
                    </p>
                </div>

                {/* Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buttons</CardTitle>
                        <CardDescription>
                            5 variants with 3 sizes - all customizable via tokens
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Destructive</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Inputs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inputs</CardTitle>
                        <CardDescription>
                            Form inputs with size variants and states
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Default input"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Input size="sm" placeholder="Small input" />
                            <Input size="lg" placeholder="Large input" />
                            <Input placeholder="Disabled input" disabled />
                        </div>
                    </CardContent>
                </Card>

                {/* Badges */}
                <Card>
                    <CardHeader>
                        <CardTitle>Badges</CardTitle>
                        <CardDescription>
                            Status indicators with semantic colors
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="error">Error</Badge>
                            <Badge variant="outline">Outline</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cards</CardTitle>
                        <CardDescription>
                            Flexible containers with composable sub-components
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card padding="sm">
                                <CardHeader>
                                    <CardTitle>Small Padding</CardTitle>
                                    <CardDescription>Compact card layout</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">This card uses small padding.</p>
                                </CardContent>
                            </Card>
                            <Card padding="lg">
                                <CardHeader>
                                    <CardTitle>Large Padding</CardTitle>
                                    <CardDescription>Spacious card layout</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">This card uses large padding.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal */}
                <Card>
                    <CardHeader>
                        <CardTitle>Modal</CardTitle>
                        <CardDescription>
                            Accessible dialog with overlay
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setIsModalOpen(true)}>
                            Open Modal
                        </Button>
                    </CardContent>
                </Card>

                {/* Theme Customization Example - REMOVED (Strict Catalyst Mode uses utility classes) */}

            </div>

            {/* Modal Component */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="md"
            >
                <ModalHeader>
                    <ModalTitle>Example Modal</ModalTitle>
                    <ModalDescription>
                        This is a token-based modal component
                    </ModalDescription>
                </ModalHeader>
                <ModalContent>
                    <p className="text-sm">
                        The modal uses design tokens for background, shadow, and overlay.
                        You can customize it by overriding CSS variables.
                    </p>
                </ModalContent>
                <ModalFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                        Confirm
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default ComponentShowcase;
