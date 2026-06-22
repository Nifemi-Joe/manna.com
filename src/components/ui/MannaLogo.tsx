import React from "react";
import { cn } from "@/lib/utils";

interface MannaLogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "full" | "mark";
    className?: string;
}

const sizeMap = {
    sm: { height: 28, markSize: 24, fontSize: 16 },
    md: { height: 36, markSize: 32, fontSize: 20 },
    lg: { height: 48, markSize: 44, fontSize: 28 },
};

export function MannaLogo({
                              size = "md",
                              variant = "full",
                              className,
                          }: MannaLogoProps) {
    const { height, markSize, fontSize } = sizeMap[size];

    return (
        <span
            className={cn("inline-flex items-center gap-2.5 select-none", className)}
            aria-label="Manna Office Meals"
        >
      {/* Mark: stylised grain/bowl icon */}
            <svg
                width={markSize}
                height={markSize}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
        <rect width="40" height="40" rx="10" fill="var(--brand-green)" />
                {/* Grain stalks */}
                <path
                    d="M20 30 L20 14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
        <path
            d="M20 20 C17 18 14 19 14 16 C14 13 17 12 20 14"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
        />
        <path
            d="M20 17 C23 15 26 16 26 13 C26 10 23 9 20 11"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
        />
                {/* Bowl arc */}
                <path
                    d="M12 30 Q12 34 20 34 Q28 34 28 30"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />
      </svg>

            {variant === "full" && (
                <span
                    className="font-[var(--font-display)] font-700 text-[var(--brand-green)]"
                    style={{ fontSize, lineHeight: 1 }}
                >
          Manna
        </span>
            )}
    </span>
    );
}