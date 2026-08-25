import * as React from "react";
import { cn } from "@/lib/utils/cn";

const VARIANTS = {
  default: "bg-rp-secondary text-rp-data hover:bg-rp-secondary/80",
  secondary: "bg-rp-secondary text-rp-data hover:bg-rp-secondary/80",
  outline: "border border-rp-hairline bg-transparent text-rp-data-muted hover:bg-rp-secondary hover:text-rp-data",
  ghost: "text-rp-data-muted hover:bg-rp-secondary hover:text-rp-data",
} as const;

const SIZES = {
  default: "h-9 px-4",
  sm: "h-8 px-3 text-xs",
  icon: "h-9 w-9",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rp-ring disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
