"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { toast } from "sonner";

// UPDATED: phone is now required — "so we can call them" was the whole
// point of adding it. Nothing else in this schema changed.
const pilotSchema = z.object({
    companyName: z.string().min(2, "Company name required"),
    contactName: z.string().min(2, "Your name required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(7, "Valid phone number required"),
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

// FIXED: these were pointing at /images/<short-name>.jpg, which doesn't
// exist in the repo — the actual assets live under /images/menu/ with
// longer, more specific filenames (confirmed against the project's
// public/images/menu directory). That mismatch is why every photo was
// broken on Netlify while stray local files masked the bug in dev.
const FAN_FAVORITES = [
    { src: "/images/menu/jollof-fried-rice-chicken-plantain.jpg", name: "Jollof Rice, Chicken & Plantain", tag: "Most ordered" },
    { src: "/images/menu/white-rice-buka-stew-plantain.jpg", name: "Buka Stew & Rice", tag: "Classic" },
    { src: "/images/menu/spaghetti-chicken.jpg", name: "Spaghetti & Chicken", tag: "Fan favorite" },
    { src: "/images/menu/chicken-sandwich.jpg", name: "Chicken Sandwich", tag: "Light lunch" },
    { src: "/images/menu/meat-pie.jpg", name: "Meat Pie", tag: "Snack" },
    { src: "/images/menu/juiceup-zobo.jpg", name: "Zobo Juice", tag: "Drink" },
];

export default function HomePage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PilotFormData>({ resolver: zodResolver(pilotSchema) });

    const [submitted, setSubmitted] = useState(false);

    // UPDATED: phone now included in the payload sent to POST /api/v1/leads.
    // The backend needs its own small update to accept and store it — see
    // schema_v7_lead_phone.sql for the column, and add `phone:
    // z.string().optional()` (or required, matching this form) to that
    // route's validation schema plus the INSERT statement.
    const onSubmit = async (data: PilotFormData) => {
        try {
            const res = await fetch("/api/v1/leads", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyName: data.companyName,
                    contactName: data.contactName,
                    email: data.email,
                    phone: data.phone,
                    employees: data.employees,
                }),
            });
            if (!res.ok) throw new Error("API unavailable");
            setSubmitted(true);
            reset();
        } catch {
            window.location.href = `mailto:hello@mannaworkmeals.com?subject=Pilot Request — ${data.companyName}&body=Company: ${data.companyName}%0AContact: ${data.contactName}%0AEmail: ${data.email}%0APhone: ${data.phone}%0ATeam size: ${data.employees}`;
            toast.success("Opening your email client — we'll be in touch soon.");
        }
    };

    return (
        <>
            {/* ─── Hero ──────────────────────────────────────────── */}
            <section className="marketing-wash relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 pt-16 pb-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        className="space-y-7"
                    >
                        <motion.div variants={fadeUp} className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)] text-label-xs">
                                <Sparkles size={12} aria-hidden="true" />
                                Now onboarding in Lagos
                            </span>
                            <span className="inline-flex items-center gap-1 text-label-xs text-[var(--muted)]">
                                <Star size={12} className="fill-[var(--accent-2)] text-[var(--accent-2)]" />
                                4.8 pilot satisfaction
                            </span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-display-xl text-[var(--text)] max-w-xl">
                            Great food.{" "}
                            <span className="text-[var(--brand-green)]">Happier teams.</span>{" "}
                            Better workdays.
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-body-l text-[var(--muted)] max-w-md">
                            HR sets the budget once. Employees order a hot meal from a fresh
                            daily menu. Manna handles delivery, tracking, and one clean
                            invoice at month end.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                            <Button
                                variant="filled"
                                size="lg"
                                trailingIcon={<ArrowRight size={17} />}
                                onClick={() => document.getElementById("pilot-form")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Request a pilot
                            </Button>
                            <Link
                                href="/menu"
                                className="inline-flex h-12 items-center px-1 text-body-m font-medium text-[var(--text)] hover:text-[var(--brand-green)] transition-colors"
                            >
                                See this week's menu →
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeUp} className="flex items-center gap-6 pt-4 border-t border-[var(--line)] max-w-md">
                            <Stat value="95%+" label="On-time delivery" color="var(--brand-green)" />
                            <Stat value="3" label="Pilot companies" color="var(--accent-2-hover)" />
                            <Stat value="₦0" label="Setup fee" color="var(--accent-3)" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative mx-auto w-full max-w-md"
                    >
                        <div className="relative aspect-square rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-lg)]">
                            <Image
                                src="/images/menu/jollof-fried-rice-chicken-plantain.jpg"
                                alt="Jollof rice, chicken and plantain — a Manna favorite"
                                fill
                                sizes="(max-width: 768px) 100vw, 480px"
                                className="object-cover"
                                priority
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -left-4 top-6 bg-[var(--surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] px-4 py-3 -rotate-3"
                        >
                            <p className="text-label-xs text-[var(--muted)]">Today's allowance</p>
                            <p className="font-mono-num text-[20px] text-[var(--brand-green)]">₦3,000</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="absolute -right-3 bottom-6 bg-[var(--brand-green)] text-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] px-4 py-3 rotate-2 flex items-center gap-2"
                        >
                            <Clock size={16} className="text-white/80" />
                            <div>
                                <p className="text-[11px] text-white/70">Cutoff in</p>
                                <p className="font-mono-num text-[16px]">2h 14m</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── How it works ────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <div className="max-w-xl mb-14">
                    <p className="text-label-xs text-[var(--accent-2-hover)] mb-3">How it works</p>
                    <h2 className="text-display-l text-[var(--text)]">Simple for HR. Seamless for everyone.</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
                    {[
                        { step: "01", icon: <Building2 size={22} />, tint: "var(--brand-green)", tintSoft: "var(--brand-green-tint)", heading: "Set up in minutes", body: "HR adds employees, sets the daily allowance, and picks meal days. We handle everything else." },
                        { step: "02", icon: <UtensilsCrossed size={22} />, tint: "var(--accent-2-hover)", tintSoft: "var(--accent-2-soft)", heading: "Employees order", body: "Staff browse the week's menu and place their order before the 10 AM cutoff, from any device." },
                        { step: "03", icon: <Clock size={22} />, tint: "var(--accent-3)", tintSoft: "var(--accent-3-soft)", heading: "Manna delivers", body: "Hot meals arrive at your office at lunchtime. HR tracks spend and delivery in real time." },
                    ].map((s, i) => (
                        <motion.div
                            key={s.step}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="font-mono-num text-[13px]" style={{ color: s.tint }}>{s.step}</span>
                                <div className="h-px flex-1 bg-[var(--line)]" />
                                <span className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: s.tintSoft, color: s.tint }}>
                                    {s.icon}
                                </span>
                            </div>
                            <h3 className="text-heading-s text-[var(--text)] mb-2">{s.heading}</h3>
                            <p className="text-body-s text-[var(--muted)]">{s.body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Fan favorites ────────────────────────────────────── */}
            <section className="bg-[var(--surface-soft)] border-y border-[var(--line)]">
                <div className="max-w-6xl mx-auto px-6 py-24">
                    <div className="max-w-xl mb-12">
                        <p className="text-label-xs text-[var(--accent-2-hover)] mb-3">On the menu</p>
                        <h2 className="text-display-l text-[var(--text)]">Real meals. Real fast.</h2>
                        <p className="text-body-m text-[var(--muted)] mt-3">
                            Every dish on Manna is made fresh — no stock photography, this is what actually arrives at your desk.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {FAN_FAVORITES.map((meal, i) => (
                            <motion.div
                                key={meal.name}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                                className="group relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                            >
                                <div className="relative aspect-square">
                                    <Image
                                        src={meal.src}
                                        alt={meal.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 300px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute top-2 left-2 text-label-xs px-2 py-1 rounded-full bg-white/90 text-[var(--brand-green)] font-semibold">
                                        {meal.tag}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <p className="text-body-s font-semibold text-[var(--text)] leading-snug">{meal.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Benefits grid ───────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <div className="max-w-xl mb-12">
                    <p className="text-label-xs text-[var(--accent-2-hover)] mb-3">Built for both sides</p>
                    <h2 className="text-display-l text-[var(--text)]">One system, two experiences.</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { icon: <ShieldCheck size={18} />, tag: "For HR", heading: "Full spend control", body: "Set per-employee daily budgets and monthly caps. No surprise invoices.", tint: "var(--brand-green)", soft: "var(--brand-green-tint)" },
                        { icon: <TrendingUp size={18} />, tag: "For HR", heading: "Real-time reporting", body: "Track participation, spend vs budget, and delivery status from one dashboard.", tint: "var(--brand-green)", soft: "var(--brand-green-tint)" },
                        { icon: <Banknote size={18} />, tag: "For HR", heading: "Simple billing", body: "One monthly invoice per company. No cash handling, no reimbursements.", tint: "var(--brand-green)", soft: "var(--brand-green-tint)" },
                        { icon: <UtensilsCrossed size={18} />, tag: "For Employees", heading: "Fresh daily menu", body: "A curated, rotating menu every week — something new every day.", tint: "var(--accent-2-hover)", soft: "var(--accent-2-soft)" },
                        { icon: <Users size={18} />, tag: "For Employees", heading: "Dietary options", body: "Vegan, halal, and spice-free options clearly labelled on every menu.", tint: "var(--accent-2-hover)", soft: "var(--accent-2-soft)" },
                        { icon: <Sparkles size={18} />, tag: "For Employees", heading: "Zero admin", body: "Order in under a minute. No wallets, no cash, no queuing.", tint: "var(--accent-2-hover)", soft: "var(--accent-2-soft)" },
                    ].map((card, i) => (
                        <motion.div
                            key={card.heading}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            whileHover={{ y: -3 }}
                            transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                            className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] p-6 space-y-3 hover:shadow-[var(--shadow-md)] transition-shadow"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: card.soft, color: card.tint }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <span className="text-label-xs" style={{ color: card.tint }}>{card.tag}</span>
                                    <h3 className="text-heading-s text-[var(--text)] mt-0.5">{card.heading}</h3>
                                </div>
                            </div>
                            <p className="text-body-s text-[var(--muted)]">{card.body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── Pilot CTA ───────────────────────────────────────── */}
            <section id="pilot-form" className="relative bg-[var(--brand-green-dark)] overflow-hidden">
                <div className="absolute inset-0" style={{ background: "radial-gradient(800px 420px at 85% 0%, rgba(217,138,43,0.18) 0%, transparent 60%)" }} aria-hidden="true" />
                <div className="relative max-w-6xl mx-auto px-6 py-24">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10 space-y-3">
                            <p className="text-label-xs text-[var(--accent-2)]">Free pilot programme</p>
                            <h2 className="text-display-l text-white">Ready to feed your team better?</h2>
                            <p className="text-body-m text-white/60">Zero setup cost, full service, real metrics for your team within the first month.</p>
                        </div>

                        {submitted ? (
                            <div className="bg-white/10 rounded-[var(--radius-xl)] p-10 text-center space-y-3 border border-white/10">
                                <CheckCircle size={40} className="text-[var(--accent-2)] mx-auto" />
                                <h3 className="text-heading-m text-white">Request received</h3>
                                <p className="text-white/60 text-body-s">We'll reach out within one business day to set up your pilot.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-white rounded-[var(--radius-xl)] p-8 space-y-4 shadow-[var(--shadow-lg)]">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Company name" autoComplete="organization" error={errors.companyName?.message} {...register("companyName")} />
                                    <Input label="Your name" autoComplete="name" error={errors.contactName?.message} {...register("contactName")} />
                                </div>
                                {/* NEW: phone, alongside email — this is the field that
                                    actually lets sales call the lead instead of only
                                    being able to email them. */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Work email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
                                    <Input label="Phone number" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
                                </div>
                                <Select label="Team size" options={employeeOptions} error={errors.employees?.message} {...register("employees")} />
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

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
    return (
        <div>
            <p className="font-mono-num text-[22px]" style={{ color }}>{value}</p>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">{label}</p>
        </div>
    );
}