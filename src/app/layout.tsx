import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-fraunces",
    display: "swap",
    axes: ["opsz", "SOFT", "WONK"],
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    display: "swap",
});

export const metadata: Metadata = {
    title: { default: "Manna Office Meals", template: "%s | Manna" },
    description: "Office meals, finally under control. B2B food benefits for Nigerian companies.",
    manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
    themeColor: "#1765D8",
    width: "device-width",
    initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
        <body>
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