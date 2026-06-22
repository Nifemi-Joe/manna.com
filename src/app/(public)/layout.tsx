import React from "react";
import Link from "next/link";
import { MannaLogo } from "@/components/ui/MannaLogo";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--surface)]">
            <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" aria-label="Manna home">
                        <MannaLogo size="md" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
                        <Link href="/for-companies" className="text-body-s text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                            For Companies
                        </Link>
                        <Link href="/menu" className="text-body-s text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                            Menu Sample
                        </Link>
                        <Link href="/faq" className="text-body-s text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                            FAQ
                        </Link>
                    </nav>
                    <Link
                        href="/login"
                        className="inline-flex h-9 items-center px-4 rounded-[var(--radius-md)] bg-[var(--accent)] text-white text-[13px] font-semibold hover:bg-[var(--accent-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                    >
                        Sign in
                    </Link>
                </div>
            </header>

            <main>{children}</main>

            <footer className="border-t border-[var(--line)] bg-[var(--surface-soft)]">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-start gap-8 justify-between">
                        <div className="space-y-3">
                            <MannaLogo size="md" />
                            <p className="text-body-s text-[var(--muted)] max-w-xs">
                                Office meals, finally under control. Food benefits for Nigerian companies.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-16 gap-y-2">
                            <FooterLink href="/for-companies" label="For Companies" />
                            <FooterLink href="/menu" label="Menu Sample" />
                            <FooterLink href="/faq" label="FAQ" />
                            <FooterLink href="mailto:hello@mannaworkmeals.com" label="Contact" />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[var(--line)]">
                        <p className="text-[12px] text-[var(--muted)]">
                            © {new Date().getFullYear()} Manna Work Meals Ltd. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FooterLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="text-body-s text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
            {label}
        </Link>
    );
}