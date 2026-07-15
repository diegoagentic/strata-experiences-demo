import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function TailwindCardsDemo() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
            {/* Horizontal Card */}
            <Card className="flex flex-col sm:flex-row overflow-hidden">
                <div className="relative h-48 sm:h-auto sm:w-48 flex-none">
                    <img
                        src="https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                </div>
                <div className="flex flex-col justify-between p-6 leading-normal">
                    <div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 flex items-center">
                            <span className="text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wide text-xs">Article</span>
                            <span className="mx-2">&bull;</span>
                            <span>Aug 18, 2024</span>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                            Finding customers for your new business
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4">
                            Getting a new business off the ground is a lot of hard work. Here are five ideas you can use to find your first customers.
                        </p>
                    </div>
                    <div className="flex items-center">
                        <img className="w-10 h-10 rounded-full mr-4" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
                        <div className="text-sm">
                            <p className="text-zinc-900 dark:text-white leading-none font-medium">Jonathan Reinink</p>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Writer</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stacked Profile Card */}
            <Card className="text-center p-8">
                <div className="flex justify-center -mt-16 mb-6">
                    <img
                        className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                        alt="Profile"
                    />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Jane Cooper</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Paradigm Representative</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-4 mb-6">
                    Admin of the year, managing over 500 accounts and leading the regional sales team.
                </p>
                <div className="flex justify-center gap-4">
                    <Button className="w-full sm:w-auto rounded-full px-8">
                        Message
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto rounded-full px-8">
                        Call
                    </Button>
                </div>
            </Card>
        </div>
    );
}
