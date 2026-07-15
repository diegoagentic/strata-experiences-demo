import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        solid: "border-transparent",
        soft: "border-transparent",
        outline: "bg-transparent",
      },
      color: {
        zinc: "",
        red: "",
        orange: "",
        amber: "",
        yellow: "",
        lime: "",
        green: "",
        emerald: "",
        teal: "",
        cyan: "",
        sky: "",
        blue: "",
        indigo: "",
        violet: "",
        purple: "",
        fuchsia: "",
        pink: "",
        rose: "",
        brand: "",
      },
    },
    compoundVariants: [
      // Solid
      { variant: "solid", color: "zinc", class: "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200" },
      { variant: "solid", color: "red", class: "bg-red-600 text-white hover:bg-red-700" },
      { variant: "solid", color: "orange", class: "bg-orange-600 text-white hover:bg-orange-700" },
      { variant: "solid", color: "amber", class: "bg-amber-500 text-white hover:bg-amber-600" },
      { variant: "solid", color: "yellow", class: "bg-yellow-400 text-zinc-950 hover:bg-yellow-500" },
      { variant: "solid", color: "lime", class: "bg-lime-500 text-zinc-950 hover:bg-lime-600" },
      { variant: "solid", color: "green", class: "bg-green-600 text-white hover:bg-green-700" },
      { variant: "solid", color: "emerald", class: "bg-emerald-600 text-white hover:bg-emerald-700" },
      { variant: "solid", color: "teal", class: "bg-teal-600 text-white hover:bg-teal-700" },
      { variant: "solid", color: "cyan", class: "bg-cyan-600 text-white hover:bg-cyan-700" },
      { variant: "solid", color: "sky", class: "bg-sky-600 text-white hover:bg-sky-700" },
      { variant: "solid", color: "blue", class: "bg-blue-600 text-white hover:bg-blue-700" },
      { variant: "solid", color: "indigo", class: "bg-indigo-600 text-white hover:bg-indigo-700" },
      { variant: "solid", color: "violet", class: "bg-violet-600 text-white hover:bg-violet-700" },
      { variant: "solid", color: "purple", class: "bg-purple-600 text-white hover:bg-purple-700" },
      { variant: "solid", color: "fuchsia", class: "bg-fuchsia-600 text-white hover:bg-fuchsia-700" },
      { variant: "solid", color: "pink", class: "bg-pink-600 text-white hover:bg-pink-700" },
      { variant: "solid", color: "rose", class: "bg-rose-600 text-white hover:bg-rose-700" },
      { variant: "solid", color: "brand", class: "bg-brand-200 text-zinc-900 hover:bg-brand-300 dark:bg-brand-400 dark:text-zinc-900 dark:hover:bg-brand-500" },

      // Soft
      { variant: "soft", color: "zinc", class: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700" },
      { variant: "soft", color: "red", class: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70" },
      { variant: "soft", color: "orange", class: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/70" },
      { variant: "soft", color: "amber", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/70" },
      { variant: "soft", color: "yellow", class: "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/70" },
      { variant: "soft", color: "lime", class: "bg-lime-50 text-lime-800 dark:bg-lime-950/50 dark:text-lime-400 hover:bg-lime-100 dark:hover:bg-lime-950/70" },
      { variant: "soft", color: "green", class: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/70" },
      { variant: "soft", color: "emerald", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/70" },
      { variant: "soft", color: "teal", class: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/70" },
      { variant: "soft", color: "cyan", class: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-950/70" },
      { variant: "soft", color: "sky", class: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/70" },
      { variant: "soft", color: "blue", class: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/70" },
      { variant: "soft", color: "indigo", class: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/70" },
      { variant: "soft", color: "violet", class: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/70" },
      { variant: "soft", color: "purple", class: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/70" },
      { variant: "soft", color: "fuchsia", class: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-950/70" },
      { variant: "soft", color: "pink", class: "bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-950/70" },
      { variant: "soft", color: "rose", class: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/70" },
      { variant: "soft", color: "brand", class: "bg-brand-100 text-zinc-900 dark:bg-brand-950/30 dark:text-brand-300 hover:bg-brand-200 dark:hover:bg-brand-900/50" },

      // Outline
      { variant: "outline", color: "zinc", class: "text-zinc-950 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900" },
      { variant: "outline", color: "red", class: "text-red-700 dark:text-red-400 border-red-200 dark:border-red-900" },
      { variant: "outline", color: "orange", class: "text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900" },
      { variant: "outline", color: "amber", class: "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900" },
      { variant: "outline", color: "yellow", class: "text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900" },
      { variant: "outline", color: "lime", class: "text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-900" },
      { variant: "outline", color: "green", class: "text-green-700 dark:text-green-400 border-green-200 dark:border-green-900" },
      { variant: "outline", color: "emerald", class: "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
      { variant: "outline", color: "teal", class: "text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900" },
      { variant: "outline", color: "cyan", class: "text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900" },
      { variant: "outline", color: "sky", class: "text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900" },
      { variant: "outline", color: "blue", class: "text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900" },
      { variant: "outline", color: "indigo", class: "text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900" },
      { variant: "outline", color: "violet", class: "text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900" },
      { variant: "outline", color: "purple", class: "text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900" },
      { variant: "outline", color: "fuchsia", class: "text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900" },
      { variant: "outline", color: "pink", class: "text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900" },
      { variant: "outline", color: "rose", class: "text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900" },
      { variant: "outline", color: "brand", class: "text-zinc-900 dark:text-brand-400 border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/30" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "zinc",
    },
  },
);

function Badge({
  className,
  variant,
  color,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
