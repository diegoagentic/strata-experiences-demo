import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-zinc-950 dark:file:text-zinc-50 placeholder:text-zinc-500 selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-white transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-brand-500 dark:focus-visible:border-brand-400 focus-visible:ring-brand-500/20 dark:focus-visible:ring-brand-400/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-600/20 dark:aria-invalid:ring-red-500/20 aria-invalid:border-red-600 dark:aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
