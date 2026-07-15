/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./packages/strata-ds/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "rgb(from var(--border) r g b / <alpha-value>)",
                input: "rgb(from var(--input) r g b / <alpha-value>)",
                ring: "rgb(from var(--ring) r g b / <alpha-value>)",
                background: "rgb(from var(--background) r g b / <alpha-value>)",
                foreground: "rgb(from var(--foreground) r g b / <alpha-value>)",
                primary: {
                    DEFAULT: "rgb(from var(--primary) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--primary-foreground) r g b / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "rgb(from var(--secondary) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--secondary-foreground) r g b / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "rgb(from var(--destructive) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--destructive-foreground) r g b / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "rgb(from var(--muted) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--muted-foreground) r g b / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "rgb(from var(--accent) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--accent-foreground) r g b / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "rgb(from var(--popover) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--popover-foreground) r g b / <alpha-value>)",
                },
                card: {
                    DEFAULT: "rgb(from var(--card) r g b / <alpha-value>)",
                    foreground: "rgb(from var(--card-foreground) r g b / <alpha-value>)",
                },
                // Semantic status tokens (added 2026-04 · used by MBI + shared DS).
                // Dark mode handled via --color-* overrides in variables-dark.css.
                success: "rgb(from var(--color-success) r g b / <alpha-value>)",
                warning: "rgb(from var(--color-warning) r g b / <alpha-value>)",
                info: "rgb(from var(--color-info) r g b / <alpha-value>)",
                ai: "rgb(from var(--color-ai) r g b / <alpha-value>)",
                danger: "rgb(from var(--color-danger) r g b / <alpha-value>)",
                brand: {
                    50: "rgb(from var(--color-brand-50) r g b / <alpha-value>)",
                    100: "rgb(from var(--color-brand-100) r g b / <alpha-value>)",
                    200: "rgb(from var(--color-brand-200) r g b / <alpha-value>)",
                    300: "rgb(from var(--color-brand-300) r g b / <alpha-value>)",
                    400: "rgb(from var(--color-brand-400) r g b / <alpha-value>)",
                    500: "rgb(from var(--color-brand-500) r g b / <alpha-value>)",
                    600: "rgb(from var(--color-brand-600) r g b / <alpha-value>)",
                    700: "rgb(from var(--color-brand-700) r g b / <alpha-value>)",
                    800: "rgb(from var(--color-brand-800) r g b / <alpha-value>)",
                    900: "rgb(from var(--color-brand-900) r g b / <alpha-value>)",
                    950: "rgb(from var(--color-brand-950) r g b / <alpha-value>)",
                    lime: "rgb(from var(--color-brand-lime) r g b / <alpha-value>)",
                },
                zinc: {
                    50: "rgb(from var(--color-zinc-50) r g b / <alpha-value>)",
                    100: "rgb(from var(--color-zinc-100) r g b / <alpha-value>)",
                    200: "rgb(from var(--color-zinc-200) r g b / <alpha-value>)",
                    300: "rgb(from var(--color-zinc-300) r g b / <alpha-value>)",
                    400: "rgb(from var(--color-zinc-400) r g b / <alpha-value>)",
                    500: "rgb(from var(--color-zinc-500) r g b / <alpha-value>)",
                    600: "rgb(from var(--color-zinc-600) r g b / <alpha-value>)",
                    700: "rgb(from var(--color-zinc-700) r g b / <alpha-value>)",
                    800: "rgb(from var(--color-zinc-800) r g b / <alpha-value>)",
                    900: "rgb(from var(--color-zinc-900) r g b / <alpha-value>)",
                    950: "rgb(from var(--color-zinc-950) r g b / <alpha-value>)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["var(--fontFamily-sans)"],
                brand: ["var(--fontFamily-brand)"],
            },
            boxShadow: {
                "glow-sm": "var(--shadow-glow-sm)",
                "glow-md": "var(--shadow-glow-md)", // Standard
                "glow-lg": "var(--shadow-glow-lg)",
            },
        },
    },
    plugins: [],
}
