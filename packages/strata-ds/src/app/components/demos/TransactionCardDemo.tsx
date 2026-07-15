import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowUpRightIcon, ArrowDownLeftIcon } from '@heroicons/react/20/solid';

const transactions = [
    {
        id: 1,
        name: 'Payment to Molly Sanders',
        date: 'July 11, 2024',
        amount: '$20,000',
        status: 'Sent',
        type: 'outgoing',
        icon: ArrowUpRightIcon,
    },
    {
        id: 2,
        name: 'Refund from AWS',
        date: 'July 10, 2024',
        amount: '$140',
        status: 'Received',
        type: 'incoming',
        icon: ArrowDownLeftIcon,
    },
    {
        id: 3,
        name: 'Payment to Dave Wilson',
        date: 'July 9, 2024',
        amount: '$5,000',
        status: 'Sent',
        type: 'outgoing',
        icon: ArrowUpRightIcon,
    },
];

export function TransactionCardDemo() {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-base font-semibold leading-6 text-zinc-900 dark:text-white">
                    Recent Transactions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul role="list" className="divide-y divide-zinc-100 dark:divide-white/10">
                    {transactions.map((transaction) => (
                        <li key={transaction.id} className="flex gap-x-4 py-4 first:pt-0 last:pb-0">
                            <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${transaction.type === 'outgoing' ? 'bg-zinc-100 dark:bg-white/10' : 'bg-green-50 dark:bg-green-900/20'}`}>
                                <transaction.icon className={`h-5 w-5 ${transaction.type === 'outgoing' ? 'text-zinc-600 dark:text-zinc-400' : 'text-green-600 dark:text-green-400'}`} aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-auto">
                                <p className="text-sm font-semibold leading-6 text-zinc-900 dark:text-white">
                                    {transaction.name}
                                </p>
                                <p className="mt-1 truncate text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                    {transaction.date}
                                </p>
                            </div>
                            <div className="hidden sm:flex sm:flex-col sm:items-end">
                                <p className={`text-sm leading-6 ${transaction.type === 'outgoing' ? 'text-zinc-900 dark:text-zinc-100' : 'text-green-600 dark:text-green-400'}`}>
                                    {transaction.type === 'outgoing' ? '-' : '+'}{transaction.amount}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                    {transaction.status}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="border-t border-zinc-100 dark:border-white/10 pt-4">
                <Button variant="ghost" className="w-full text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    View all transactions <span aria-hidden="true"> &rarr;</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
