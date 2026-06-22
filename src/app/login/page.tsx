"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { getPortalHome, type Portal } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MannaLogo } from "@/components/ui/MannaLogo";

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

type Step = "form" | "sent" | "verifying" | "error";

const PORTAL_LABELS: Record<string, string> = {
    employee: "Employee Portal",
    hr: "HR Portal",
    ops: "Ops Portal",
    admin: "Admin Portal",
    studio: "Content Studio",
};

function getPortalFromPath(pathname: string): string {
    if (pathname.startsWith("/employee")) return "employee";
    if (pathname.startsWith("/hr")) return "hr";
    if (pathname.startsWith("/ops")) return "ops";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/studio")) return "studio";
    return "";
}

/**
 * Renders the fallback sign-in link block, shown whenever the API returns
 * a `debugLink` — which happens either in non-production environments, or
 * in any environment when real email delivery failed (e.g. an unverified
 * sending domain) and the backend operator has explicitly opted in via
 * ALLOW_DEBUG_LOGIN_LINK. This is NOT gated on build-time NODE_ENV, since
 * a deployed Render/Vercel environment is still "production" from Next.js's
 * point of view even during testing before a domain is verified.
 */
function FallbackSignInLink({
                                link,
                                reason,
                            }: {
    link: string;
    reason?: string;
}) {
    return (
        <div className="border border-[var(--line)] rounded-[var(--radius-md)] p-3 bg-[var(--surface-soft)] text-left space-y-2">
            <div className="flex items-center gap-1.5 text-label-xs text-[var(--muted)]">
                <KeyRound size={12} aria-hidden="true" />
                <span>{reason ? "Email delivery failed — use this link instead" : "Sign-in link"}</span>
            </div>
            {reason && (
                <p className="text-label-xs text-[var(--warning)] break-words">{reason}</p>
            )}
            <a
                href={link}
                className="block text-body-s text-[var(--accent)] break-all underline"
            >
                {link}
            </a>
        </div>
    );
}

function LoginContent() {
    const [step, setStep] = useState<Step>("form");
    const [errorMsg, setErrorMsg] = useState("");
    const [debugLink, setDebugLink] = useState<string | null>(null);
    const [debugReason, setDebugReason] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const redirect = searchParams.get("redirect") ?? "";
    const token = searchParams.get("token");
    const portalLabel =
        PORTAL_LABELS[getPortalFromPath(redirect)] ?? "Manna";

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    // Handle magic link token verification
    useEffect(() => {
        if (!token) return;
        setStep("verifying");
        api.auth
            .verify(token)
            .then((res) => {
                const dest = redirect || getPortalHome(res.portal as Portal);
                router.replace(dest);
            })
            .catch(() => {
                setErrorMsg("This link has expired or is invalid. Request a new one.");
                setStep("error");
            });
    }, [token, redirect, router]);

    const onSubmit = async (data: FormData) => {
        try {
            const res = await api.auth.requestLink(data);
            setDebugLink(res.debugLink ?? null);
            setDebugReason(res.debugReason ?? null);
            setStep("sent");
        } catch (err) {
            const msg =
                err instanceof ApiError ? err.message : "Something went wrong. Try again.";
            setErrorMsg(msg);
            setStep("error");
        }
    };

    const cardVariants = {
        enter: { opacity: 0, y: 8 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    };

    return (
        <div className="min-h-screen bg-[var(--surface-soft)] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <MannaLogo size="lg" />
                </div>

                <AnimatePresence mode="wait">
                    {(step === "form" || step === "error") && (
                        <motion.div
                            key="form"
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--line)] shadow-[var(--shadow-md)] p-8 space-y-6"
                        >
                            <div className="space-y-1">
                                <h1 className="text-heading-s text-[var(--text)]">
                                    Sign in
                                    {portalLabel !== "Manna" && (
                                        <span className="text-[var(--muted)] font-normal text-[16px]">
                      {" — "}{portalLabel}
                    </span>
                                    )}
                                </h1>
                                <p className="text-body-s text-[var(--muted)]">
                                    We&apos;ll send you a secure link — no password needed.
                                </p>
                            </div>

                            {step === "error" && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--danger-bg)] text-[var(--danger)] text-body-s"
                                >
                                    <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                                <Input
                                    label="Work email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    error={errors.email?.message}
                                    leadingIcon={<Mail size={16} />}
                                    {...register("email")}
                                />
                                <Button
                                    type="submit"
                                    variant="filled"
                                    size="lg"
                                    fullWidth
                                >
                                    Send magic link
                                </Button>
                            </form>

                            {debugLink && (
                                <FallbackSignInLink link={debugLink} reason={debugReason ?? undefined} />
                            )}
                        </motion.div>
                    )}

                    {step === "sent" && (
                        <motion.div
                            key="sent"
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--line)] shadow-[var(--shadow-md)] p-8 space-y-6 text-center"
                        >
                            <div className="flex justify-center">
                <span className="w-16 h-16 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                  <CheckCircle size={32} className="text-[var(--success)]" />
                </span>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-heading-s text-[var(--text)]">Check your email</h2>
                                <p className="text-body-s text-[var(--muted)]">
                                    We sent a link to{" "}
                                    <strong className="text-[var(--text)]">{getValues("email")}</strong>.
                                    It expires in 15 minutes.
                                </p>
                            </div>
                            <button
                                onClick={() => setStep("form")}
                                className="inline-flex items-center gap-1.5 text-body-s text-[var(--accent)] hover:underline"
                            >
                                <ArrowLeft size={14} aria-hidden="true" />
                                Use a different email
                            </button>

                            {debugLink && (
                                <FallbackSignInLink link={debugLink} reason={debugReason ?? undefined} />
                            )}
                        </motion.div>
                    )}

                    {step === "verifying" && (
                        <motion.div
                            key="verifying"
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--line)] shadow-[var(--shadow-md)] p-8 text-center space-y-4"
                        >
                            <div className="flex justify-center">
                                <div className="w-10 h-10 border-2 border-[var(--line)] border-t-[var(--accent)] rounded-full animate-spin" />
                            </div>
                            <p className="text-body-m text-[var(--muted)]">Signing you in…</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}