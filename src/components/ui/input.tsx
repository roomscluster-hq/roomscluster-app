import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-ink-700">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-10 border border-surface-200 bg-surface-0 rounded-lg px-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 disabled:bg-surface-50 disabled:cursor-not-allowed",
            error && "border-danger-600 focus:ring-danger-600 focus:border-danger-600",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };