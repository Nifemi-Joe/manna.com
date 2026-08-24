import React from "react";

const SIZES = {
    sm: { mark: 22, text: 15, gap: 8 },
    md: { mark: 28, text: 19, gap: 10 },
    lg: { mark: 36, text: 24, gap: 12 },
} as const;

export function MannaLogo({
                              size = "md",
                              variant = "default",
                              iconOnly = false,
                          }: {
    size?: keyof typeof SIZES;
    /** "default" = brand-green mark on light bg · "inverted" = white mark on dark bg */
    variant?: "default" | "inverted";
    /** Renders just the bowl mark, no wordmark — for collapsed sidebars */
    iconOnly?: boolean;
}) {
    const { mark, text, gap } = SIZES[size];
    const markColor = variant === "inverted" ? "#FFFFFF" : "var(--brand-green)";
    const textColor = variant === "inverted" ? "#FFFFFF" : "var(--text)";

    const markSvg = (
        <svg width={mark} height={mark} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
                d="M6 15C6 15 8 9 16 9C24 9 26 15 26 15"
                stroke={markColor}
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <path
                d="M5 15.5H27C27 21.8 22.2 26 16 26C9.8 26 5 21.8 5 15.5Z"
                fill={markColor}
            />
            <circle cx="16" cy="5.5" r="1.6" fill={markColor} />
        </svg>
    );

    if (iconOnly) return markSvg;

    return (
        <span className="inline-flex items-center select-none" style={{ gap }}>
            {/* The mark: a bowl with a rising "steam / grain" arc — reads as
                food + growth at a glance, without leaning on a literal fork icon. */}
            {markSvg}
            <span
                className="font-[var(--font-display)] font-semibold leading-none"
                style={{ fontSize: text, color: textColor }}
            >
                Manna
            </span>
        </span>
    );
}
