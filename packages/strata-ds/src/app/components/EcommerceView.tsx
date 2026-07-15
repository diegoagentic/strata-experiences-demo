import * as React from "react"
import { CodeViewer } from "./CodeViewer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { OrderTracking, ProgressTracker } from "./ui/tracking"
import { Banner } from "./ui/banner"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"

const trackingSteps = [
    { id: '1', name: 'Order Placed', description: 'We have received your order.', status: 'complete' as const, date: 'Oct 12' },
    { id: '2', name: 'Processing', description: 'Your order is being prepared.', status: 'complete' as const, date: 'Oct 13' },
    { id: '3', name: 'Shipped', description: 'Your package is on the way.', status: 'current' as const, date: 'Oct 14' },
    { id: '4', name: 'Out for Delivery', description: 'Expected today by 8 PM.', status: 'upcoming' as const },
    { id: '5', name: 'Delivered', status: 'upcoming' as const },
]

export function EcommerceView() {
    return (
        <div className="space-y-12 pb-20">
            <section className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ecommerce & tracking</h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                    Specialized components for storefronts, product management, and order fulfillment tracking.
                </p>
            </section>

            {/* Banners */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Storefront Banners</h2>
                <div className="space-y-4">
                    <Banner variant="info" dismissible>
                        Get free shipping on orders over $50! <Button variant="ghost" size="sm" className="ml-2 underline text-white">Learn more</Button>
                    </Banner>
                    <Banner variant="success">
                        Your order has been shipped successfully.
                    </Banner>
                    <Banner variant="warning" dismissible>
                        Inventory is low for items in your cart. Check out now to secure them.
                    </Banner>
                </div>
            </section>

            {/* Order Tracking */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Order tracking</h2>
                <div className="grid gap-8 lg:grid-cols-2">
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle>Shipment Status</CardTitle>
                            <CardDescription>Track the journey of order #ORD-7721-B</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrderTracking steps={trackingSteps} />
                        </CardContent>
                        <CardFooter className="border-t pt-6">
                            <ProgressTracker currentStep={2} totalSteps={5} />
                        </CardFooter>
                    </Card>

                    <CodeViewer
                        title="Tracking Usage"
                        react={`import { OrderTracking, ProgressTracker } from "./ui/tracking"

const steps = [
  { id: '1', name: 'Placed', status: 'complete', date: 'Oct 12' },
  { id: '2', name: 'Shipped', status: 'current', date: 'Oct 14' },
  { id: '3', name: 'Delivered', status: 'upcoming' }
]

export function TrackingPanel() {
  return (
    <Card>
      <OrderTracking steps={steps} />
      <ProgressTracker currentStep={1} totalSteps={3} />
    </Card>
  )
}`}
                        html="<div class='flow-root'>...</div>"
                        css="/* Tracking styles */"
                        prompt="Display an order tracking timeline with progress."
                    />
                </div>
            </section>

            {/* Card Variants */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Card Variants</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card variant="default">
                        <CardHeader>
                            <CardTitle>Default Card</CardTitle>
                            <CardDescription>Standard border and shadow.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Used for main content blocks and standard data display.
                        </CardContent>
                    </Card>

                    <Card variant="flat">
                        <CardHeader>
                            <CardTitle>Flat Card</CardTitle>
                            <CardDescription>Subtle background, no shadow.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Perfect for nesting inside other cards or secondary content.
                        </CardContent>
                    </Card>

                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle>Glass Card</CardTitle>
                            <CardDescription>Transparent with backdrop blur.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Ideal for floating elements, hero sections, or over image backgrounds.
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Skeleton Screens */}
            <section className="space-y-6">
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Skeleton Screens</h2>
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
