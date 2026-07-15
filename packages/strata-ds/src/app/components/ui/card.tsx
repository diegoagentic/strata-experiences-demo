import * as React from "react";

import { cn } from "./utils";

interface CardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'flat' | 'glass' | 'brand'
}

function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm",
    flat: "bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 shadow-none",
    glass: "bg-white/70 dark:bg-black/40 backdrop-blur-xl border-white/20 dark:border-zinc-800/50 shadow-lg",
    brand: "bg-brand-50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-900 shadow-sm"
  }

  return (
    <div
      data-slot="card"
      className={cn(
        "text-zinc-950 dark:text-zinc-50 flex flex-col gap-6 rounded-xl border transition-all duration-200",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-zinc-500 dark:text-zinc-400", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
