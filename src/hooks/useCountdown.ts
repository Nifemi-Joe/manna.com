"use client";

import { useState, useEffect } from "react";

interface CountdownResult {
    hours: number;
    minutes: number;
    seconds: number;
    total: number; // milliseconds remaining
    expired: boolean;
    formatted: string; // "2h 14m remaining"
}

export function useCountdown(targetTime: string | Date | null): CountdownResult {
    const getRemaining = () => {
        if (!targetTime) return 0;
        const target = typeof targetTime === "string" ? new Date(targetTime) : targetTime;
        return Math.max(0, target.getTime() - Date.now());
    };

    const [total, setTotal] = useState(getRemaining);

    useEffect(() => {
        if (!targetTime) return;
        const interval = setInterval(() => {
            setTotal(getRemaining());
        }, 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetTime]);

    const hours = Math.floor(total / 1000 / 3600);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    const expired = total === 0;

    let formatted = "";
    if (!expired) {
        if (hours > 0) formatted = `${hours}h ${minutes}m remaining`;
        else if (minutes > 0) formatted = `${minutes}m ${seconds}s remaining`;
        else formatted = `${seconds}s remaining`;
    }

    return { hours, minutes, seconds, total, expired, formatted };
}