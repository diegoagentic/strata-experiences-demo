import * as React from "react"

export type Theme = "dark" | "light" | "system"

export interface ThemeConfig {
    [key: string]: string | number;
}

export interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
    /** Optional theme object for CSS variables override */
    theme?: ThemeConfig
    className?: string
}

export interface ThemeProviderState {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    // Token utilities
    getTokenValue: (tokenName: string) => string
    setTokenValue: (tokenName: string, value: string) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    toggleTheme: () => null,
    getTokenValue: () => "",
    setTokenValue: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    theme: themeConfig,
    className,
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = React.useState<Theme>(
        () => (typeof window !== "undefined" ? (localStorage.getItem(storageKey) as Theme) || defaultTheme : defaultTheme)
    )

    React.useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    // Effect for updating CSS variables from themeConfig
    React.useEffect(() => {
        if (!themeConfig) return;
        const root = window.document.documentElement;
        Object.entries(themeConfig).forEach(([key, value]) => {
            const cssKey = key.startsWith('--') ? key : `--${key}`;
            root.style.setProperty(cssKey, String(value));
        });
    }, [themeConfig]);

    const value = React.useMemo<ThemeProviderState>(
        () => ({
            theme,
            setTheme: (theme: Theme) => {
                localStorage.setItem(storageKey, theme)
                setTheme(theme)
            },
            toggleTheme: () => {
                setTheme((prev) => {
                    const next = prev === 'dark' ? 'light' : 'dark';
                    localStorage.setItem(storageKey, next);
                    return next;
                });
            },
            getTokenValue: (tokenName: string) => {
                if (typeof window === 'undefined') return '';
                const cssVarName = tokenName.startsWith('--') ? tokenName : `--${tokenName}`;
                return getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
            },
            setTokenValue: (tokenName: string, value: string) => {
                if (typeof window === 'undefined') return;
                const cssVarName = tokenName.startsWith('--') ? tokenName : `--${tokenName}`;
                document.documentElement.style.setProperty(cssVarName, value);
            }
        }),
        [theme, storageKey, themeConfig]
    )

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            <div className={className}>{children}</div>
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
