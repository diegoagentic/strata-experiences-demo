import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { StarIcon } from '@heroicons/react/24/solid';

export function BrandedCardDemo() {
    return (
        <Card className="max-w-[350px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-brand-400/30 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-400" />
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-brand-50 dark:bg-brand-400/10 rounded-lg text-brand-700 dark:text-brand-400">
                        <StarIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                        Premium Plan
                    </span>
                </div>
                <CardTitle className="text-zinc-900 dark:text-white">Professional</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                    Advanced features for growing teams.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">$29</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">/month</span>
                </div>
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                    Includes priority support, audit logs, and advanced analytics.
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full bg-brand-300 hover:bg-brand-400 text-zinc-900 dark:bg-brand-400 dark:hover:bg-brand-500 dark:text-zinc-900 border-transparent shadow-sm font-semibold">
                    Upgrade Now
                </Button>
            </CardFooter>
        </Card>
    );
}
