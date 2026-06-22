"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
    label: string;
    error?: string;
    hint?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            hint,
            leadingIcon,
            trailingIcon,
            className,
            type = "text",
            ...props
        },
        ref
    ) => {
        const id = useId();
        const errorId = `${id}-error`;
        const hintId = `${id}-hint`;

        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;

        return (
            <div className="flex flex-col gap-1.5">
                <div className="input-floating-wrap">
                    {leadingIcon && (
                        <span
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10"
                            aria-hidden="true"
                        >
              {leadingIcon}
            </span>
                    )}
                    <input
                        ref={ref}
                        id={id}
                        type={inputType}
                        placeholder=" "
                        className={cn(
                            "input-floating",
                            error && "error",
                            leadingIcon && "pl-10",
                            (trailingIcon || isPassword) && "pr-10",
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={cn(
                            error ? errorId : undefined,
                            hint ? hintId : undefined
                        ) || undefined}
                        {...props}
                    />
                    <label htmlFor={id} className="input-floating-label">
                        {label}
                    </label>
                    {isPassword && (
                        <button
                            type="button"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            onClick={() => setShowPassword((p) => !p)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    )}
                    {trailingIcon && !isPassword && (
                        <span
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
                            aria-hidden="true"
                        >
              {trailingIcon}
            </span>
                    )}
                </div>

                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        className="flex items-center gap-1 text-[var(--danger)] text-body-s"
                    >
                        <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={hintId} className="text-[var(--muted)] text-body-s">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

// ─── Textarea variant ─────────────────────────────────────
export interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
    label: string;
    error?: string;
    hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className, ...props }, ref) => {
        const id = useId();
        const errorId = `${id}-error`;

        return (
            <div className="flex flex-col gap-1.5">
                <div className="input-floating-wrap">
          <textarea
              ref={ref}
              id={id}
              placeholder=" "
              className={cn(
                  "input-floating resize-none pt-6 pb-3 min-h-[120px]",
                  error && "error",
                  className
              )}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              {...props}
          />
                    <label htmlFor={id} className="input-floating-label">
                        {label}
                    </label>
                </div>
                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        className="flex items-center gap-1 text-[var(--danger)] text-body-s"
                    >
                        <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p className="text-[var(--muted)] text-body-s">{hint}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

// ─── Select variant ────────────────────────────────────────
export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
    label: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
    placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className, ...props }, ref) => {
        const id = useId();
        const errorId = `${id}-error`;

        return (
            <div className="flex flex-col gap-1.5">
                <div className="input-floating-wrap">
                    <select
                        ref={ref}
                        id={id}
                        className={cn(
                            "input-floating appearance-none cursor-pointer",
                            error && "error",
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <label htmlFor={id} className="input-floating-label">
                        {label}
                    </label>
                </div>
                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        className="flex items-center gap-1 text-[var(--danger)] text-body-s"
                    >
                        <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";