import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-900 shadow hover:bg-gray-800 dark:hover:bg-gray-100",
        destructive:
          "bg-red-500 dark:bg-red-900 text-white shadow-sm hover:bg-red-600 dark:hover:bg-red-800",
        outline:
          "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800",
        secondary:
          "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700",
        ghost: "text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800",
        link: "text-gray-900 dark:text-gray-50 underline-offset-4 hover:underline",
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
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }