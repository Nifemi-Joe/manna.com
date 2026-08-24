"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * A thin top-of-viewport progress bar, in the spirit of GitHub/YouTube's
 * nav indicator. Next.js App Router gives no direct "navigation started"
 * event, so this starts the bar on any internal <a> click (immediate —
 * before the new route has even begun rendering) and completes it once
 * the pathname/search params actually change to match the click target.
 *
 * This directly answers "clicking Sign in doesn't go immediately, it
 * should show the page is loading" — the bar now appears within the
 * same tick as the click, everywhere in the app, without every page
 * needing its own loading state.
 */
export function RouteProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const currentKey = `${pathname}?${searchParams?.toString() ?? ""}`;
    const prevKeyRef = useRef(currentKey);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        clearTimer();
        setVisible(true);
        setProgress(15);
        intervalRef.current = setInterval(() => {
            setProgress((p) => (p < 85 ? p + (85 - p) * 0.15 : p));
        }, 160);
    }, [clearTimer]);

    const finish = useCallback(() => {
        clearTimer();
        setProgress(100);
        const t = setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 240);
        return () => clearTimeout(t);
    }, [clearTimer]);

    // Route actually changed — complete the bar
    useEffect(() => {
        if (prevKeyRef.current !== currentKey) {
            prevKeyRef.current = currentKey;
            finish();
        }
    }, [currentKey, finish]);

    // Any internal link click starts the bar immediately, before Next
    // has done any work — this is the part that makes it feel instant.
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const anchor = (e.target as HTMLElement)?.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
            if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
            if (/^https?:\/\//.test(href) && !href.startsWith(window.location.origin)) return;
            if (href === pathname) return;

            start();
        }

        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [start, pathname]);

    useEffect(() => clearTimer, [clearTimer]);

    if (!visible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none" aria-hidden="true">
            <div
                className="h-full transition-[width] duration-200 ease-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, var(--brand-green), var(--accent-2), var(--accent-3))",
                    boxShadow: "0 0 8px rgba(217, 138, 43, 0.5)",
                }}
            />
        </div>
    );
}
