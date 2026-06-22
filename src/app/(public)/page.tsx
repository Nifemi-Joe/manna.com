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
    ChevronRight,
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

// ─── Animations ───────────────────────────────────────────
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
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
            // Try API first, fallback to mailto
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
            // Fallback: mailto
            window.location.href = `mailto:hello@mannaworkmeals.com?subject=Pilot Request — ${data.companyName}&body=Company: ${data.companyName}%0AContact: ${data.contactName}%0AEmail: ${data.email}%0ATeam size: ${data.employees}`;
            toast.success("Opening your email client — we'll be in touch soon.");
        }
    };

    return (
        <>
            {/* ─── Hero ──────────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                    className="space-y-6"
                >
                    <motion.span
                        variants={fadeUp}
                        custom={0}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--brand-green)]/10 text-[var(--brand-green)] text-label-xs border border-[var(--brand-green)]/20"
                    >
                        <Sparkles size={12} aria-hidden="true" />
                        Now onboarding pilot companies in Lagos
                    </motion.span>

                    <motion.h1
                        variants={fadeUp}
                        custom={1}
                        className="text-display-xl text-[var(--text)] max-w-3xl mx-auto"
                    >
                        Office meals,{" "}
                        <span className="text-[var(--brand-green)]">finally</span>{" "}
                        under control.
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        custom={2}
                        className="text-body-l text-[var(--muted)] max-w-xl mx-auto"
                    >
                        Manna handles daily lunch for your team — HR sets the budget,
                        employees order from a fresh menu, and we deliver. Simple.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        custom={3}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    >
                        <Button
                            variant="filled"
                            size="lg"
                            trailingIcon={<ChevronRight size={18} />}
                            onClick={() =>
                                document.getElementById("pilot-form")?.scrollIntoView({ behavior: "smooth" })
                            }
                        >
                            Request a Pilot
                        </Button>
                        <Link href="/for-companies">
                            <Button variant="ghost" size="lg">
                                See how it works
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Hero visual */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 relative"
                >
                    <div className="bg-gradient-to-br from-[var(--brand-green)]/8 to-[var(--accent)]/8 rounded-[var(--radius-xl)] border border-[var(--line)] p-8 max-w-2xl mx-auto">
                        <HeroDashboardMockup />
                    </div>
                </motion.div>
            </section>

            {/* ─── Stats bar ───────────────────────────────────────── */}
            <section className="border-y border-[var(--line)] bg-[var(--surface-soft)]">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-3 divide-x divide-[var(--line)]">
                        {[
                            { value: "95%+", label: "On-time delivery" },
                            { value: "3", label: "Companies onboarded" },
                            { value: "₦0", label: "Setup fee" },
                        ].map((stat) => (
                            <div key={stat.label} className="px-8 text-center first:pl-0 last:pr-0">
                                <p className="text-display-l text-[var(--brand-green)]">{stat.value}</p>
                                <p className="text-body-s text-[var(--muted)] mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How it works ────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-12">
                    <p className="text-label-xs text-[var(--brand-green)] mb-3">How it works</p>
                    <h2 className="text-heading-m text-[var(--text)]">
                        Three steps, zero overhead
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* connector line */}
                    <div
                        className="hidden md:block absolute top-10 left-[calc(33%+20px)] right-[calc(33%+20px)] h-px bg-[var(--line)]"
                        aria-hidden="true"
                    />
                    {[
                        {
                            step: "01",
                            icon: <Building2 size={24} className="text-[var(--brand-green)]" />,
                            heading: "Setup in minutes",
                            body: "HR adds employees, sets the daily allowance, and picks meal days. We handle everything else.",
                        },
                        {
                            step: "02",
                            icon: <UtensilsCrossed size={24} className="text-[var(--brand-green)]" />,
                            heading: "Employees order",
                            body: "Staff browse the week's menu and place their order before the 10 AM cutoff — from any device.",
                        },
                        {
                            step: "03",
                            icon: <Clock size={24} className="text-[var(--brand-green)]" />,
                            heading: "Manna delivers",
                            body: "Hot meals arrive at your office at lunchtime. HR tracks spend and delivery in real time.",
                        },
                    ].map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="flex flex-col items-center text-center gap-4"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-[var(--brand-green)]/10 border border-[var(--brand-green)]/20 flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--brand-green)] text-white text-[10px] font-bold flex items-center justify-center">
                  {step.step}
                </span>
                            </div>
                            <h3 className="text-heading-s text-[var(--text)]">{step.heading}</h3>
                            <p className="text-body-s text-[var(--muted)]">{step.body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Benefits grid ───────────────────────────────────── */}
            <section className="bg-[var(--surface-soft)] border-y border-[var(--line)]">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-heading-m text-[var(--text)]">
                            Built for both sides of the table
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { icon: <ShieldCheck size={20} />, tag: "For HR", heading: "Full spend control", body: "Set per-employee daily budgets and monthly caps. No surprise invoices." },
                            { icon: <TrendingUp size={20} />, tag: "For HR", heading: "Real-time reporting", body: "Track participation, spend vs budget, and delivery status from one dashboard." },
                            { icon: <Banknote size={20} />, tag: "For HR", heading: "Simple billing", body: "One monthly invoice per company. No cash handling, no reimbursements." },
                            { icon: <UtensilsCrossed size={20} />, tag: "For Employees", heading: "Fresh daily menu", body: "A curated, rotating menu every week. Something new every day." },
                            { icon: <Users size={20} />, tag: "For Employees", heading: "Dietary options", body: "Vegan, halal, and spice-free options clearly labelled on every menu." },
                            { icon: <Sparkles size={20} />, tag: "For Employees", heading: "Zero admin", body: "Order in under a minute. No wallets, no cash, no queuing." },
                        ].map((card, i) => (
                            <motion.div
                                key={card.heading}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: i * 0.06 }}
                                className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] p-6 space-y-3"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--brand-green)]/10 text-[var(--brand-green)] flex items-center justify-center shrink-0">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <span className="text-label-xs text-[var(--brand-green)]">{card.tag}</span>
                                        <h3 className="text-[15px] font-semibold text-[var(--text)] mt-0.5 font-[var(--font-sans)]">{card.heading}</h3>
                                    </div>
                                </div>
                                <p className="text-body-s text-[var(--muted)]">{card.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Pilot CTA ───────────────────────────────────────── */}
            <section id="pilot-form" className="bg-[var(--brand-green)]">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10 space-y-3">
                            <h2 className="text-heading-m text-white">
                                Ready to feed your team better?
                            </h2>
                            <p className="text-body-m text-white/70">
                                We're running a free pilot programme. Zero setup cost, full service,
                                real metrics for your team.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="bg-white/10 rounded-[var(--radius-xl)] p-8 text-center space-y-3">
                                <CheckCircle size={40} className="text-white mx-auto" />
                                <h3 className="text-[20px] font-semibold text-white font-[var(--font-sans)]">
                                    Request received!
                                </h3>
                                <p className="text-white/70 text-body-s">
                                    We'll reach out within one business day to set up your pilot.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                noValidate
                                className="bg-white rounded-[var(--radius-xl)] p-8 space-y-4"
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
                                <Button
                                    type="submit"
                                    variant="filled"
                                    size="lg"
                                    fullWidth
                                    loading={isSubmitting}
                                >
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

// ─── Dashboard mockup (hero visual) ──────────────────────
function HeroDashboardMockup() {
    const meals = [
        { name: "Jollof Rice & Chicken", price: 2500, tag: "Popular" },
        { name: "Egusi Soup & Pounded Yam", price: 2800, tag: "Halal" },
        { name: "Grilled Fish & Plantain", price: 3200, tag: "Spice-free" },
    ];

    return (
        <div className="space-y-4 text-left">
            {/* Allowance card */}
            <div className="bg-[var(--brand-green)] rounded-[var(--radius-lg)] p-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">
                    Today&apos;s allowance
                </p>
                <p className="text-[28px] font-bold font-[var(--font-display)] mt-1">₦3,000</p>
                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-white rounded-full" />
                </div>
                <p className="text-[11px] opacity-60 mt-1">₦1,000 used · ₦2,000 remaining</p>
            </div>

            {/* Meal cards */}
            <div className="grid grid-cols-3 gap-3">
                {meals.map((meal) => (
                    <div
                        key={meal.name}
                        className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] p-3 space-y-2"
                    >
                        <div className="h-16 bg-gradient-to-br from-[var(--brand-green)]/20 to-[var(--accent)]/10 rounded-[var(--radius-md)]" />
                        <p className="text-[11px] font-semibold text-[var(--text)] leading-tight line-clamp-2">
                            {meal.name}
                        </p>
                        <div className="flex items-center justify-between">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--brand-green)]/10 text-[var(--brand-green)] font-semibold">
                {meal.tag}
              </span>
                            <span className="text-[11px] font-bold text-[var(--text)]">
                ₦{(meal.price / 1000).toFixed(1)}k
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}