"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  showToggle?: boolean;
  helperText?: string;
  disabled?: boolean;   
}

export function PasswordInput({
  value,
  onChange,
  label = "Password",
  placeholder = "••••••••",
  required = true,
  showToggle = true,
  disabled = false, 
  helperText,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-ink-700 block mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-10 px-3 pr-10 text-sm text-ink-900 border border-surface-200 bg-surface-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${
            disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
          }`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={disabled} 
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-700 ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-ink-700/40 mt-1">{helperText}</p>
      )}
    </div>
  );
}