import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-neutral-900 to-neutral-800 text-white font-semibold border border-neutral-700/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.15)] hover:from-neutral-800 hover:to-neutral-700 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_8px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] dark:from-white dark:to-neutral-200 dark:text-neutral-950 dark:border-white/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.5)] dark:hover:from-white dark:hover:to-neutral-100 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_10px_rgba(0,0,0,0.6)]",
        secondary:
          "bg-gradient-to-b from-neutral-100 to-neutral-200 text-neutral-900 font-medium border border-neutral-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.08)] hover:from-neutral-200 hover:to-neutral-300 hover:border-neutral-400/80 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] dark:from-[#2a2a2a] dark:to-[#1c1c1c] dark:text-white dark:border-white/12 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.5)] dark:hover:from-[#333333] dark:hover:to-[#222222] dark:hover:border-white/20 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_4px_10px_rgba(0,0,0,0.6)] dark:active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]",
        outline:
          "bg-gradient-to-b from-white to-neutral-50 text-neutral-800 font-medium border border-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.05)] hover:from-neutral-50 hover:to-neutral-100 hover:text-neutral-950 hover:border-neutral-300 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] dark:from-[#222222] dark:to-[#161616] dark:text-neutral-200 dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_2px_4px_rgba(0,0,0,0.4)] dark:hover:from-[#2c2c2c] dark:hover:to-[#1e1e1e] dark:hover:text-white dark:hover:border-white/20 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_3px_8px_rgba(0,0,0,0.5)] dark:active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]",
        volumetric:
          "bg-gradient-to-b from-neutral-100 to-neutral-200 text-neutral-900 font-medium border border-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.08)] hover:from-neutral-200 hover:to-neutral-300 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] dark:from-[#2c2c2c] dark:to-[#1d1d1d] dark:text-white dark:border-white/14 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.5)] dark:hover:from-[#363636] dark:hover:to-[#242424] dark:hover:border-white/22 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_10px_rgba(0,0,0,0.6)] dark:active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]",
        emerald:
          "bg-gradient-to-b from-emerald-500/15 to-emerald-500/25 text-emerald-700 font-medium border border-emerald-500/35 shadow-[inset_0_1px_0_rgba(52,211,153,0.35),0_1px_3px_rgba(0,0,0,0.08)] hover:border-emerald-500/50 hover:shadow-[inset_0_1px_0_rgba(52,211,153,0.5),0_2px_5px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] dark:from-emerald-500/20 dark:to-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/35 dark:shadow-[inset_0_1px_0_rgba(52,211,153,0.35),0_2px_6px_rgba(0,0,0,0.4)] dark:hover:border-emerald-500/50 dark:hover:shadow-[inset_0_1px_0_rgba(52,211,153,0.5),0_3px_8px_rgba(0,0,0,0.5)]",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-foreground active:scale-[0.98] active:translate-y-0.5",
        destructive:
          "bg-destructive/15 text-destructive font-medium border border-destructive/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.05)] hover:bg-destructive/25 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] dark:bg-destructive/20 dark:border-destructive/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4)] dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3.5",
        xs: "h-6 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-2 px-4 text-sm",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
