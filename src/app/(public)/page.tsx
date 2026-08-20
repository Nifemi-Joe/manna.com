"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Building2,
    Users,
    TrendingUp,
    Clock,
    ShieldCheck,
    Banknote,
    UtensilsCrossed,
    Sparkles,
    CheckCircle,
    ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { toast } from "sonner";

// ─── Pilot form schema ────────────────────────────────────
const pilotSchema = z.object({
    companyName: z.string().min(2, "Company name required"),
    contactName: z.string().min(2, "Your name required"),
    email: z.string().email("Valid email required"),
    employees: z.string().min(1, "Select team size"),
});

type PilotFormData = z.infer<typeof pilotSchema>;

const employeeOptions = [
    { value: "1-10", label: "1–10 employees" },
    { value: "11-50", label: "11–50 employees" },
    { value: "51-200", label: "51–200 employees" },
    { value: "201-500", label: "201–500 employees" },
    { value: "500+", label: "500+ employees" },
];

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function HomePage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PilotFormData>({ resolver: zodResolver(pilotSchema) });

    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (data: PilotFormData) => {
        try {
            const res = await fetch("/api/v1/leads", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("API unavailable");
            setSubmitted(true);
            reset();
        } catch {
            window.location.href = `mailto:hello@mannaworkmeals.com?subject=Pilot Request — ${data.companyName}&body=Company: ${data.companyName}%0AContact: ${data.contactName}%0AEmail: ${data.email}%0ATeam size: ${data.employees}`;
            toast.success("Opening your email client — we'll be in touch soon.");
        }
    };

    return (
        <>
            {/* ─── Hero ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* ambient field — quiet, not a spotlight gradient */}
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        background:
                            "radial-gradient(1100px 480px at 18% -10%, var(--brand-green-tint) 0%, transparent 60%)",
                    }}
                    aria-hidden="true"
                />

                <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="space-y-7"
                    >
                        <motion.span
                            variants={fadeUp}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)] text-label-xs"
                        >
                            <Sparkles size={12} aria-hidden="true" />
                            Now onboarding pilot companies in Lagos
                        </motion.span>

                        <motion.h1 variants={fadeUp} className="text-display-xl text-[var(--text)] max-w-xl">
                            Office meals,{" "}
                            <span className="italic text-[var(--brand-green)]">finally</span> under
                            control.
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-body-l text-[var(--muted)] max-w-md">
                            HR sets the budget once. Employees order from a fresh daily menu.
                            Manna handles the rest — delivery, tracking, and one clean invoice
                            at month end.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                            <Button
                                variant="filled"
                                size="lg"
                                trailingIcon={<ArrowRight size={17} />}
                                onClick={() =>
                                    document.getElementById("pilot-form")?.scrollIntoView({ behavior: "smooth" })
                                }
                            >
                                Request a pilot
                            </Button>
                            <Link
                                href="/for-companies"
                                className="inline-flex h-12 items-center px-1 text-body-m font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors"
                            >
                                See how billing works →
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4 border-t border-[var(--line)] max-w-md">
                            <Stat value="95%+" label="On-time delivery" />
                            <Stat value="3" label="Pilot companies" />
                            <Stat value="₦0" label="Setup fee" />
                        </motion.div>
                    </motion.div>

                    {/* Hero visual — a real meal ticket */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, rotate: -1.5 }}
                        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ rotate: 0 }}
                        className="mx-auto w-full max-w-sm"
                    >
                        <MealTicket />
                    </motion.div>
                </div>
            </section>

            {/* ─── How it works ────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <div className="max-w-xl mb-14">
                    <p className="text-label-xs text-[var(--accent-2-hover)] mb-3">How it works</p>
                    <h2 className="text-display-l text-[var(--text)]">Three steps. No spreadsheets.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
                    {[
                        {
                            step: "01",
                            icon: <Building2 size={20} />,
                            heading: "Set up in minutes",
                            body: "HR adds employees, sets the daily allowance, and picks meal days. We handle everything else.",
                        },
                        {
                            step: "02",
                            icon: <UtensilsCrossed size={20} />,
                            heading: "Employees order",
                            body: "Staff browse the week's menu and place their order before the 10 AM cutoff, from any device.",
                        },
                        {
                            step: "03",
                            icon: <Clock size={20} />,
                            heading: "Manna delivers",
                            body: "Hot meals arrive at your office at lunchtime. HR tracks spend and delivery in real time.",
                        },
                    ].map((s, i) => (
                        <motion.div
                            key={s.step}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="relative pl-0"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="font-[var(--font-mono)] text-[13px] text-[var(--accent-2-hover)] font-semibold">
                                    {s.step}
                                </span>
                                <div className="h-px flex-1 bg-[var(--line)]" />
                                <span className="w-9 h-9 rounded-full bg-[var(--brand-green-tint)] text-[var(--brand-green)] flex items-center justify-center shrink-0">
                                    {s.icon}
                                </span>
                            </div>
                            <h3 className="text-heading-s text-[var(--text)] mb-2">{s.heading}</h3>
                            <p className="text-body-s text-[var(--muted)]">{s.body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Benefits grid ───────────────────────────────────── */}
            <section className="bg-[var(--surface-soft)] border-y border-[var(--line)]">
                <div className="max-w-6xl mx-auto px-6 py-24">
                    <div className="max-w-xl mb-12">
                        <p className="text-label-xs text-[var(--accent-2-hover)] mb-3">Built for both sides</p>
                        <h2 className="text-display-l text-[var(--text)]">One system, two experiences.</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { icon: <ShieldCheck size={18} />, tag: "For HR", heading: "Full spend control", body: "Set per-employee daily budgets and monthly caps. No surprise invoices." },
                            { icon: <TrendingUp size={18} />, tag: "For HR", heading: "Real-time reporting", body: "Track participation, spend vs budget, and delivery status from one dashboard." },
                            { icon: <Banknote size={18} />, tag: "For HR", heading: "Simple billing", body: "One monthly invoice per company. No cash handling, no reimbursements." },
                            { icon: <UtensilsCrossed size={18} />, tag: "For Employees", heading: "Fresh daily menu", body: "A curated, rotating menu every week — something new every day." },
                            { icon: <Users size={18} />, tag: "For Employees", heading: "Dietary options", body: "Vegan, halal, and spice-free options clearly labelled on every menu." },
                            { icon: <Sparkles size={18} />, tag: "For Employees", heading: "Zero admin", body: "Order in under a minute. No wallets, no cash, no queuing." },
                        ].map((card, i) => (
                            <motion.div
                                key={card.heading}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                                className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] p-6 space-y-3 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)] transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--brand-green-tint)] text-[var(--brand-green)] flex items-center justify-center shrink-0">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <span className="text-label-xs text-[var(--accent-2-hover)]">{card.tag}</span>
                                        <h3 className="text-heading-s text-[var(--text)] mt-0.5">{card.heading}</h3>
                                    </div>
                                </div>
                                <p className="text-body-s text-[var(--muted)]">{card.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pilot CTA ───────────────────────────────────────── */}
            <section id="pilot-form" className="relative bg-[var(--brand-green-dark)] overflow-hidden">
                <div
                    className="absolute inset-0 -z-0"
                    style={{ background: "radial-gradient(800px 420px at 85% 0%, rgba(217,138,43,0.16) 0%, transparent 60%)" }}
                    aria-hidden="true"
                />
                <div className="relative max-w-6xl mx-auto px-6 py-24">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10 space-y-3">
                            <p className="text-label-xs text-[var(--accent-2)]">Free pilot programme</p>
                            <h2 className="text-display-l text-white">Ready to feed your team better?</h2>
                            <p className="text-body-m text-white/60">
                                Zero setup cost, full service, real metrics for your team within the first month.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="bg-white/10 rounded-[var(--radius-xl)] p-10 text-center space-y-3 border border-white/10">
                                <CheckCircle size={40} className="text-[var(--accent-2)] mx-auto" />
                                <h3 className="text-heading-m text-white">Request received</h3>
                                <p className="text-white/60 text-body-s">
                                    We'll reach out within one business day to set up your pilot.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                                className="bg-white rounded-[var(--radius-xl)] p-8 space-y-4 shadow-[var(--shadow-lg)]"
                            >
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Company name"
                                        autoComplete="organization"
                                        error={errors.companyName?.message}
                                        {...register("companyName")}
                                    />
                                    <Input
                                        label="Your name"
                                        autoComplete="name"
                                        error={errors.contactName?.message}
                                        {...register("contactName")}
                                    />
                                </div>
                                <Input
                                    label="Work email"
                                    type="email"
                                    autoComplete="email"
                                    error={errors.email?.message}
                                    {...register("email")}
                                />
                                <Select
                                    label="Team size"
                                    options={employeeOptions}
                                    error={errors.employees?.message}
                                    {...register("employees")}
                                />
                                <Button type="submit" variant="filled" size="lg" fullWidth loading={isSubmitting}>
                                    Request pilot access
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="font-mono-num text-[22px] text-[var(--brand-green)]">{value}</p>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">{label}</p>
        </div>
    );
}

// ─── Meal ticket (hero signature element) ────────────────
function MealTicket() {
    const meals = [
        { name: "Jollof Rice & Chicken", price: 2500, tag: "Popular" },
        { name: "Egusi & Pounded Yam", price: 2800, tag: "Halal" },
        { name: "Grilled Fish & Plantain", price: 3200, tag: "Spice-free" },
    ];

    return (
        <div className="ticket ticket-tear ticket-tear-bottom shadow-[var(--shadow-lg)] p-6 pt-8">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-label-xs text-[var(--muted)]">Today's allowance</p>
                    <p className="font-mono-num text-[30px] text-[var(--brand-green)]">₦3,000</p>
                </div>
                <span className="text-label-xs px-2.5 py-1 rounded-full bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]">
                    Acme Corp
                </span>
            </div>

            <div className="h-1.5 bg-[var(--surface-soft)] rounded-full overflow-hidden mb-1.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "33%" }}
                    transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-[var(--brand-green)] rounded-full"
                />
            </div>
            <p className="text-[11px] text-[var(--muted)] mb-6">₦1,000 used · ₦2,000 remaining</p>

            <div className="ticket-stub pt-5 space-y-3">
                {meals.map((meal) => (
                    <div key={meal.name} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-body-s font-medium text-[var(--text)] truncate">{meal.name}</p>
                            <span className="text-[11px] text-[var(--muted)]">{meal.tag}</span>
                        </div>
                        <span className="font-mono-num text-[13px] text-[var(--text)] shrink-0">
                            ₦{meal.price.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
