"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { MannaLogo } from "@/components/ui/MannaLogo";

const NAV_LINKS = [
    { href: "/for-companies", label: "For Companies" },
    { href: "/menu", label: "Menu Sample" },
    { href: "/faq", label: "FAQ" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--surface)] font-[var(--font-sans)]">
            <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]/85 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
                    <Link href="/" aria-label="Manna home">
                        <MannaLogo size="md" />
                    </Link>

                    <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-body-s text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-body-s font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/#pilot-form"
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-[13px] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                        >
                            Request a pilot
                        </Link>
                    </div>

                    <button
                        className="md:hidden p-2 -mr-2 text-[var(--text)]"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="md:hidden border-t border-[var(--line)] overflow-hidden"
                        >
                            <div className="px-6 py-4 flex flex-col gap-1">
                                {NAV_LINKS.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="py-2.5 text-body-m text-[var(--text)]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="h-px bg-[var(--line)] my-2" />
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-body-m text-[var(--text)]">
                                    Sign in
                                </Link>
                                <Link
                                    href="/#pilot-form"
                                    onClick={() => setMobileOpen(false)}
                                    className="mt-2 inline-flex items-center justify-center h-11 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-body-s font-semibold"
                                >
                                    Request a pilot
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main>{children}</main>

            <footer className="border-t border-[var(--line)] bg-[var(--brand-green-dark)] text-white">
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row items-start gap-10 justify-between">
                        <div className="space-y-4 max-w-xs">
                            <MannaLogo size="md" variant="inverted" />
                            <p className="text-body-s text-white/60">
                                Office meals, run like a proper benefit — structured, automated, predictable.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-3">
                            <div className="space-y-3">
                                <p className="text-label-xs text-white/40">Product</p>
                                <FooterLink href="/for-companies" label="For Companies" />
                                <FooterLink href="/menu" label="Menu Sample" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-label-xs text-white/40">Support</p>
                                <FooterLink href="/faq" label="FAQ" />
                                <FooterLink href="mailto:hello@mannaworkmeals.com" label="Contact" external />
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2">
                        <p className="text-[12px] text-white/40">
                            © {new Date().getFullYear()} Manna Work Meals Ltd. All rights reserved.
                        </p>
                        <p className="text-[12px] text-white/40">Lagos, Nigeria</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-1 text-body-s text-white/70 hover:text-white transition-colors w-fit"
        >
            {label}
            {external && <ArrowUpRight size={12} />}
        </Link>
    );
}
