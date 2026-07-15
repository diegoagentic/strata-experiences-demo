import { UserIcon } from '@heroicons/react/24/outline';

export function ProjectAvatarsDemo() {
    return (
        <div className="space-y-8">
            {/* User with Role Pattern */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">User with Role (List Item)</h4>
                <div className="flex items-center gap-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-zinc-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">Sarah Johnson</p>
                            <p className="text-xs text-zinc-500">Project Manager</p>
                        </div>
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Standard pattern for displaying user information in lists or headers. Combines an avatar (image or icon fallback) with name and role.
                </p>
            </div>

            {/* Initials Fallback */}
            <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Initials Fallback (Gradient)</h4>
                <div className="flex items-center gap-8 p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                        SJ
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                        JD
                    </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                    Used when no user image is available. Uses branded gradients for visual interest instead of plain gray.
                </p>
            </div>
        </div>
    )
}
