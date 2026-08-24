"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * A stylised, animated jollof plate — the hero's food moment.
 * Built from the brand palette (not a stock photo) so it's ownable and
 * scales/loads instantly. Slowly rotates, with looping steam wisps and
 * a few floating garnish dots for life. Swap for real photography of
 * an actual Manna meal later; keep the same rotate + steam treatment.
 */
export function MealPlateIllustration({ className = "" }: { className?: string }) {
    return (
        <div className={`relative ${className}`} aria-hidden="true">
            {/* steam */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex gap-3 z-10">
                <span className="w-1.5 h-8 rounded-full bg-white/70 blur-[2px] animate-steam" style={{ animationDelay: "0s" }} />
                <span className="w-1.5 h-10 rounded-full bg-white/70 blur-[2px] animate-steam" style={{ animationDelay: "0.9s" }} />
                <span className="w-1.5 h-7 rounded-full bg-white/70 blur-[2px] animate-steam" style={{ animationDelay: "1.7s" }} />
            </div>

            {/* rotating plate */}
            <motion.svg
                viewBox="0 0 400 400"
                className="w-full h-full animate-slow-spin drop-shadow-[0_30px_60px_rgba(14,30,22,0.25)]"
            >
                <circle cx="200" cy="200" r="196" fill="#FDFCF8" stroke="var(--line)" strokeWidth="2" />
                <circle cx="200" cy="200" r="172" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 8" />

                {/* jollof rice base */}
                <circle cx="200" cy="200" r="146" fill="var(--accent-2)" />
                <circle cx="200" cy="200" r="146" fill="url(#grain)" opacity="0.5" />

                {/* grilled protein wedge */}
                <path d="M200 200 L200 54 A146 146 0 0 1 326 128 Z" fill="var(--brand-green)" />
                {/* plantain wedge */}
                <path d="M200 200 L326 128 A146 146 0 0 1 326 272 Z" fill="var(--accent-3)" />
                {/* pepper garnish wedge */}
                <path d="M200 200 L326 272 A146 146 0 0 1 200 346 Z" fill="#E8A23D" />

                {/* garnish dots */}
                <circle cx="150" cy="130" r="6" fill="#2F8F5B" />
                <circle cx="130" cy="160" r="4" fill="#2F8F5B" />
                <circle cx="230" cy="270" r="5" fill="var(--brand-green-dark)" />
                <circle cx="270" cy="230" r="4" fill="#FDFCF8" />
                <circle cx="150" cy="250" r="4" fill="#FDFCF8" />

                <defs>
                    <pattern id="grain" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
                        <circle cx="2" cy="2" r="1.1" fill="#B9721F" />
                    </pattern>
                </defs>
            </motion.svg>

            {/* counter-rotating fork, stays visually "still" relative to plate spin */}
            <motion.div className="absolute inset-0 flex items-center justify-center animate-counter-spin">
                <div className="translate-x-[128px] -rotate-12 w-2.5 h-16 rounded-full bg-[var(--surface)] border border-[var(--line)] shadow-sm" />
            </motion.div>
        </div>
    );
}

export function FloatingBadge({
                                  className = "",
                                  delay = 0,
                                  children,
                              }: {
    className?: string;
    delay?: number;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            className={`animate-float ${className}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </motion.div>
    );
}
