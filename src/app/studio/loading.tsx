/**
 * Next.js shows this automatically the instant navigation into this
 * portal segment starts — including the very first visit to a route in
 * dev mode, while Next is still compiling it. This is the actual fix
 * for "nothing happens for a moment after I click": previously there
 * was no loading.tsx anywhere, so Next had nothing to show during that
 * gap except a blank screen.
 */
export default function Loading() {
    return (
        <div className="page-wash min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-9 h-9 border-2 border-[var(--line)] border-t-[var(--brand-green)] rounded-full animate-spin" />
                <p className="text-body-s text-[var(--muted)]">Loading…</p>
            </div>
        </div>
    );
}
