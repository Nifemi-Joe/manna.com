import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { RouteProgress } from "@/components/ui/RouteProgress";
import "./globals.css";

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["500", "600"],
    variable: "--font-plex-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: { default: "Manna Office Meals", template: "%s | Manna" },
    description: "Office meals, finally under control. B2B food benefits for Nigerian companies.",
    manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
    themeColor: "#2E9E52",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${manrope.variable} ${plexMono.variable}`}>
        {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
            attributes onto <body> before React hydrates — not our bug. */}
        <body suppressHydrationWarning>
        <Suspense fallback={null}>
            <RouteProgress />
        </Suspense>
        {children}
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    fontFamily: "var(--font-manrope)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    border: "1.5px solid var(--line)",
                    borderRadius: "var(--radius-md)",
                },
            }}
        />
        </body>
        </html>
    );
}
