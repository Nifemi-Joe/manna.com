"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, ArrowLeft, KeyRound, MessageSquare } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { requestOtp, verifyOtp } from "@/lib/api-otp";
import { getPortalHome, type Portal } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MannaLogo } from "@/components/ui/MannaLogo";

const emailSchema = z.object({ email: z.string().email("Enter a valid email address") });
type EmailFormData = z.infer<typeof emailSchema>;

const otpSchema = z.object({ code: z.string().length(6, "Enter the 6-digit code") });
type OtpFormData = z.infer<typeof otpSchema>;

type Step = "form" | "sent" | "otp-entry" | "verifying" | "error";
type Method = "link" | "otp";

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

function FallbackSignInLink({ link, code, reason }: { link?: string; code?: string; reason?: string }) {
    return (
        <div className="border border-[var(--line)] rounded-[var(--radius-md)] p-3 bg-[var(--surface-soft)] text-left space-y-2">
            <div className="flex items-center gap-1.5 text-label-xs text-[var(--muted)]">
                <KeyRound size={12} aria-hidden="true" />
                <span>{reason ? "Delivery failed — use this instead" : "Debug"}</span>
            </div>
            {reason && <p className="text-label-xs text-[var(--warning)] break-words">{reason}</p>}
            {link && <a href={link} className="block text-body-s text-[var(--accent-2-hover)] break-all underline">{link}</a>}
            {code && <p className="text-body-m font-mono-num text-[var(--brand-green)]">{code}</p>}
        </div>
    );
}

function LoginContent() {
    const [method, setMethod] = useState<Method>("link");
    const [step, setStep] = useState<Step>("form");
    const [errorMsg, setErrorMsg] = useState("");
    const [debugLink, setDebugLink] = useState<string | null>(null);
    const [debugCode, setDebugCode] = useState<string | null>(null);
    const [debugReason, setDebugReason] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const redirect = searchParams.get("redirect") ?? "";
    const token = searchParams.get("token");
    const portalLabel = PORTAL_LABELS[getPortalFromPath(redirect)] ?? "Manna";

    const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });
    const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

    // Magic link token verification (unchanged flow)
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

    const submitEmail = async (data: EmailFormData) => {
        setSubmitting(true);
        try {
            if (method === "link") {
                const res = await api.auth.requestLink(data);
                setDebugLink(res.debugLink ?? null);
                setDebugReason(res.debugReason ?? null);
                setStep("sent");
            } else {
                const res = await requestOtp({ email: data.email, channel: "email" });
                setDebugCode(res.debugCode ?? null);
                setDebugReason(res.debugReason ?? null);
                otpForm.setValue("code", "");
                setStep("otp-entry");
            }
        } catch (err) {
            setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
            setStep("error");
        } finally {
            setSubmitting(false);
        }
    };

    const submitOtp = async (data: OtpFormData) => {
        setVerifying(true);
        try {
            const res = await verifyOtp({ email: emailForm.getValues("email"), code: data.code });
            const dest = redirect || getPortalHome(res.portal as Portal);
            router.replace(dest);
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : "Incorrect code. Try again.";
            otpForm.setError("code", { message: msg });
        } finally {
            setVerifying(false);
        }
    };

    const cardVariants = {
        enter: { opacity: 0, y: 8 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[var(--brand-green-dark)]">
            <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(900px 500px at 15% 10%, rgba(217,138,43,0.24) 0%, transparent 60%), radial-gradient(700px 460px at 90% 90%, rgba(46,158,82,0.28) 0%, transparent 55%)" }}
                aria-hidden="true"
            />

            <div className="relative w-full max-w-sm">
                <div className="flex justify-center mb-8">
                    <MannaLogo size="lg" variant="inverted" />
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
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8 space-y-6"
                            style={{ borderTop: "3px solid var(--brand-green)" }}
                        >
                            <div className="space-y-1">
                                <h1 className="text-heading-m text-[var(--text)]">
                                    Sign in
                                    {portalLabel !== "Manna" && (
                                        <span className="text-[var(--muted)] font-normal text-[16px]"> — {portalLabel}</span>
                                    )}
                                </h1>
                                <p className="text-body-s text-[var(--muted)]">
                                    No password needed — we'll send you a {method === "link" ? "secure link" : "one-time code"}.
                                </p>
                            </div>

                            {/* Method toggle */}
                            <div className="flex gap-1 bg-[var(--surface-soft)] p-1 rounded-[var(--radius-md)]">
                                <button
                                    type="button"
                                    onClick={() => setMethod("link")}
                                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium transition-colors"
                                    style={method === "link" ? { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow-sm)" } : { color: "var(--muted)" }}
                                >
                                    <Mail size={14} /> Magic link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod("otp")}
                                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium transition-colors"
                                    style={method === "otp" ? { background: "var(--surface)", color: "var(--text)", boxShadow: "var(--shadow-sm)" } : { color: "var(--muted)" }}
                                >
                                    <MessageSquare size={14} /> Code
                                </button>
                            </div>

                            {step === "error" && (
                                <div role="alert" className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--danger-bg)] text-[var(--danger)] text-body-s">
                                    <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <form onSubmit={emailForm.handleSubmit(submitEmail)} noValidate className="space-y-4">
                                <Input
                                    label="Work email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    error={emailForm.formState.errors.email?.message}
                                    leadingIcon={<Mail size={16} />}
                                    {...emailForm.register("email")}
                                />
                                <Button type="submit" variant="amber" size="lg" fullWidth loading={submitting}>
                                    {method === "link" ? "Send magic link" : "Send code"}
                                </Button>
                            </form>

                            {(debugLink || debugCode) && <FallbackSignInLink link={debugLink ?? undefined} code={debugCode ?? undefined} reason={debugReason ?? undefined} />}
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
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8 space-y-6 text-center"
                            style={{ borderTop: "3px solid var(--success)" }}
                        >
                            <div className="flex justify-center">
                                <span className="w-16 h-16 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                                    <CheckCircle size={32} className="text-[var(--success)]" />
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-heading-m text-[var(--text)]">Check your email</h2>
                                <p className="text-body-s text-[var(--muted)]">
                                    We sent a link to <strong className="text-[var(--text)]">{emailForm.getValues("email")}</strong>. It expires in 15 minutes.
                                </p>
                            </div>
                            <button onClick={() => setStep("form")} className="inline-flex items-center gap-1.5 text-body-s text-[var(--accent-2-hover)] hover:underline">
                                <ArrowLeft size={14} aria-hidden="true" />
                                Use a different email
                            </button>
                            {debugLink && <FallbackSignInLink link={debugLink} reason={debugReason ?? undefined} />}
                        </motion.div>
                    )}

                    {step === "otp-entry" && (
                        <motion.div
                            key="otp-entry"
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8 space-y-6"
                            style={{ borderTop: "3px solid var(--accent-2)" }}
                        >
                            <div className="space-y-1 text-center">
                                <h2 className="text-heading-m text-[var(--text)]">Enter your code</h2>
                                <p className="text-body-s text-[var(--muted)]">
                                    Sent to <strong className="text-[var(--text)]">{emailForm.getValues("email")}</strong>
                                </p>
                            </div>

                            <form onSubmit={otpForm.handleSubmit(submitOtp)} noValidate className="space-y-4">
                                <Input
                                    label="6-digit code"
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoFocus
                                    error={otpForm.formState.errors.code?.message}
                                    leadingIcon={<KeyRound size={16} />}
                                    {...otpForm.register("code")}
                                />
                                <Button type="submit" variant="amber" size="lg" fullWidth loading={verifying}>
                                    Verify & sign in
                                </Button>
                            </form>

                            {debugCode && <FallbackSignInLink code={debugCode} reason={debugReason ?? undefined} />}

                            <button onClick={() => setStep("form")} className="w-full inline-flex items-center justify-center gap-1.5 text-body-s text-[var(--accent-2-hover)] hover:underline">
                                <ArrowLeft size={14} aria-hidden="true" />
                                Use a different email
                            </button>
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
                            className="bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-8 text-center space-y-4"
                        >
                            <div className="flex justify-center">
                                <div className="w-10 h-10 border-2 border-[var(--line)] border-t-[var(--accent-2)] rounded-full animate-spin" />
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
