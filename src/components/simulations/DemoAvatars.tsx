import { SparklesIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

// ─── Persona Avatar Registry ─────────────────────────────────────────────────
// Centralized avatar mapping for all demo personas.
// Humans get profile photos, AI/system actors get a robot chip icon.

export interface Persona {
    name: string;
    type: 'human' | 'ai';
    photo?: string;
    initials?: string;
}

const PERSONAS: Record<string, Persona> = {
    // ── Humans ──
    'Sara Chen': {
        name: 'Sara Chen',
        type: 'human',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
        initials: 'SC',
    },
    'David Park': {
        name: 'David Park',
        type: 'human',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        initials: 'DP',
    },
    'James Liu': {
        name: 'James Liu',
        type: 'human',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        initials: 'JL',
    },
    'Mike Ross': {
        name: 'Mike Ross',
        type: 'human',
        photo: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=80&h=80&fit=crop&crop=face',
        initials: 'MR',
    },

    'Carlos Rivera': {
        name: 'Carlos Rivera',
        type: 'human',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
        initials: 'CR',
    },

    // ── AI / System Actors ──
    'System Policy Engine': { name: 'System Policy Engine', type: 'ai', initials: 'SP' },
    'Operations Manager': { name: 'Operations Manager', type: 'ai', initials: 'OM' },
    'Finance System': { name: 'Finance System', type: 'ai', initials: 'FS' },
    'Compliance Engine': { name: 'Compliance Engine', type: 'ai', initials: 'CE' },
};

function getPersona(name: string): Persona {
    return PERSONAS[name] || { name, type: 'ai', initials: name.slice(0, 2).toUpperCase() };
}

// ─── Avatar Component ────────────────────────────────────────────────────────

interface DemoAvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
};

const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};

export default function DemoAvatar({ name, size = 'md', className }: DemoAvatarProps) {
    const persona = getPersona(name);

    if (persona.type === 'human' && persona.photo) {
        return (
            <img
                src={persona.photo}
                alt={persona.name}
                className={clsx(sizes[size], 'rounded-full object-cover ring-2 ring-white dark:ring-zinc-800 shrink-0', className)}
            />
        );
    }

    // AI / System actor — sparkles icon with glow
    return (
        <div className={clsx(
            sizes[size],
            'rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-400/25 dark:to-teal-400/25 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/30 dark:ring-emerald-400/30 animate-ai-glow',
            className,
        )}>
            <SparklesIcon className={clsx(iconSizes[size], 'text-success dark:text-success')} />
        </div>
    );
}

// ─── AI Context Avatar (smaller, for inline agent messages) ──────────────────

export function AIAgentAvatar({ className }: { className?: string }) {
    return (
        <div className={clsx(
            'w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-400/25 dark:to-teal-400/25 flex items-center justify-center shrink-0 ring-1 ring-emerald-500/30 dark:ring-emerald-400/30 animate-ai-glow',
            className,
        )}>
            <SparklesIcon className="w-3.5 h-3.5 text-success dark:text-success" />
        </div>
    );
}
