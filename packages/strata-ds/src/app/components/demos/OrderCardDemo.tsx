import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';

export function OrderCardDemo() {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="border-b border-zinc-950/5 dark:border-white/5 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-base">Order #2034</CardTitle>
                        <CardDescription>Placed on Jan 24, 2026</CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                            Shipped
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Items (3)</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">$240.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">$12.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Tax</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">$20.16</span>
                    </div>
                    <div className="pt-4 border-t border-zinc-950/5 dark:border-white/5 flex justify-between text-base font-semibold">
                        <span className="text-zinc-900 dark:text-zinc-50">Total</span>
                        <span className="text-zinc-900 dark:text-zinc-50">$272.16</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-zinc-50 dark:bg-white/5 rounded-b-xl border-t border-zinc-950/5 dark:border-white/5 px-6 py-4">
                <div className="w-full flex justify-between items-center">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        <p className="font-medium text-zinc-900 dark:text-zinc-200">Shipping to</p>
                        <p>123 Main St, Apt 4B</p>
                        <p>San Francisco, CA 94105</p>
                    </div>
                    <Button variant="outline" size="sm">
                        Track Order
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
