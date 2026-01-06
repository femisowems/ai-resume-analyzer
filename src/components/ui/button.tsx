import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}

// Base styles
const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95"

// Variants
const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border-2 border-input hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary",
}

// Sizes
const sizes = {
    default: "h-11 py-2 px-5",
    sm: "h-9 px-3 rounded-lg",
    lg: "h-12 px-8 rounded-xl text-base",
    icon: "h-11 w-11",
}

export function buttonVariants({ variant = 'default', size = 'default', className = '' }: { variant?: keyof typeof variants, size?: keyof typeof sizes, className?: string } = {}) {
    return cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
    )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        return (
            <button
                className={buttonVariants({ variant, size, className })}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
