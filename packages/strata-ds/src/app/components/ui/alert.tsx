import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-white text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800",
        destructive:
          "border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500 dark:border-red-900/50 dark:text-red-900 dark:dark:border-red-900 dark:text-red-500 bg-red-50 dark:bg-red-900/10",
        success:
          "border-emerald-500/50 text-emerald-600 dark:border-emerald-500 [&>svg]:text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
        warning:
          "border-amber-500/50 text-amber-600 dark:border-amber-500 [&>svg]:text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10",
        info:
          "border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-zinc-500 dark:text-zinc-400 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
