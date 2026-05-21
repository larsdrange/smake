import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
          {
            primary: "bg-brand-gradient text-white shadow-brand-glow-sm hover:shadow-brand-glow hover:opacity-95",
            secondary: "bg-white/08 text-white/80 border border-white/10 hover:bg-white/12",
            ghost: "text-white/50 hover:text-white/80 hover:bg-white/06",
            danger: "bg-red-500/90 text-white hover:bg-red-500",
          }[variant],
          {
            sm: "text-sm px-3 py-1.5",
            md: "text-sm px-4 py-2.5",
            lg: "text-base px-5 py-3",
          }[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
