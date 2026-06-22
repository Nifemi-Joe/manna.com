import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

// ─── Install clsx + tailwind-merge ───────────────────────
// These come bundled separately — install below if needed.

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

// ─── Currency ────────────────────────────────────────────
export function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

// ─── Dates (WAT = UTC+1, no DST) ─────────────────────────
const WAT = "Africa/Lagos";

export function formatDate(
    date: string | Date,
    fmt = "d MMM yyyy"
): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatInTimeZone(d, WAT, fmt);
}

export function formatDateTime(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatInTimeZone(d, WAT, "d MMM yyyy, h:mm a");
}

export function formatTimeOnly(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatInTimeZone(d, WAT, "h:mm a");
}

export function formatRelative(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
}

export function toWAT(date: string | Date): Date {
    const d = typeof date === "string" ? parseISO(date) : date;
    return toZonedTime(d, WAT);
}

// ─── Misc ─────────────────────────────────────────────────
export function truncate(str: string, n: number): string {
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export function pluralize(count: number, word: string, plural?: string): string {
    return count === 1 ? `${count} ${word}` : `${count} ${plural ?? word + "s"}`;
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
}