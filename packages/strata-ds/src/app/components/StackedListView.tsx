import { StackedList, StackedListItem } from '../../components/catalyst/stacked-list';
import { CopyButton } from './CopyButton';

const people = [
    {
        name: 'Leslie Alexander',
        email: 'leslie.alexander@example.com',
        role: 'Co-Founder / CEO',
        imageUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        lastSeen: '3h ago',
        lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
        name: 'Michael Foster',
        email: 'michael.foster@example.com',
        role: 'Co-Founder / CTO',
        imageUrl:
            'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        lastSeen: '3h ago',
        lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
        name: 'Dries Vincent',
        email: 'dries.vincent@example.com',
        role: 'Business Relations',
        imageUrl:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        lastSeen: null,
    },
]

export function StackedListView() {
    return (
        <div>
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                        Stacked List
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Condensed rows for displaying lists of items with metadata.
                    </p>
                </div>
            </div>

            {/* Examples */}
            <div className="grid grid-cols-1 gap-10">

                {/* Simple List with Avatars */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                        With Avatars
                    </h2>
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                        <StackedList className="px-6">
                            {people.map((person) => (
                                <StackedListItem key={person.email}>
                                    <div className="flex min-w-0 gap-x-4">
                                        <img className="h-12 w-12 flex-none rounded-full bg-zinc-50" src={person.imageUrl} alt="" />
                                        <div className="min-w-0 flex-auto">
                                            <p className="text-sm font-semibold leading-6 text-zinc-900 dark:text-white">{person.name}</p>
                                            <p className="mt-1 truncate text-xs leading-5 text-zinc-500">{person.email}</p>
                                        </div>
                                    </div>
                                    <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                                        <p className="text-sm leading-6 text-zinc-900 dark:text-white">{person.role}</p>
                                        {person.lastSeen ? (
                                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                Last seen <time dateTime={person.lastSeenDateTime}>{person.lastSeen}</time>
                                            </p>
                                        ) : (
                                            <div className="mt-1 flex items-center gap-x-1.5">
                                                <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                                <p className="text-xs leading-5 text-zinc-500">Online</p>
                                            </div>
                                        )}
                                    </div>
                                </StackedListItem>
                            ))}
                        </StackedList>
                    </div>
                    <div className="mt-4">
                        <CopyButton
                            formats={[{
                                label: 'React', value: `<StackedList>
  {people.map((person) => (
    <StackedListItem key={person.email}>
      {/* Content */}
    </StackedListItem>
  ))}
</StackedList>` }]}
                        />
                    </div>
                </section>

            </div>
        </div>
    );
}
