import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-stone-800 text-white shadow hover:bg-stone-900 dark:bg-orange-800 dark:hover:bg-orange-500",
        destructive:
          "bg-stone-600 text-white shadow-sm hover:bg-stone-700",
        outline:
          "border border-stone-200 bg-paper shadow-sm hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-100",
        secondary:
          "bg-stone-100 text-stone-800 shadow-sm hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700",
        ghost:
          "hover:bg-stone-100 dark:hover:bg-stone-800",
        link: "text-stone-700 underline-offset-4 hover:underline dark:text-stone-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
