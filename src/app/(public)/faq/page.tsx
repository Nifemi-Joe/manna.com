'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQCategory {
    id: string;
    label: string;
    items: FAQItem[];
}

const FAQS: FAQCategory[] = [
    {
        id: 'hr',
        label: 'For HR Teams',
        items: [
            {
                q: 'How do I get my company started on Manna?',
                a: 'Request a pilot via our landing page. Our onboarding team will reach out within one business day to collect company details, employee list, and delivery address. Setup takes less than 48 hours.',
            },
            {
                q: 'How do I add or remove employees?',
                a: 'Log in to the HR portal and navigate to Employees. You can add individuals one at a time or bulk-upload via a CSV template. Removing an employee deactivates their access and stops future allowance accruals immediately.',
            },
            {
                q: 'Can I set different allowance amounts per employee?',
                a: 'Currently, allowances are set at company level (same for all employees). Department-level rules are on our roadmap for Q3.',
            },
            {
                q: 'What if an employee leaves mid-month?',
                a: 'Deactivate them in the HR portal and they lose access immediately. Any unused allowance balance for that month is credited back to your company account on the next billing cycle.',
            },
            {
                q: 'How does billing work?',
                a: 'You receive a monthly invoice covering all meals ordered by your employees during that period. Payment is due within 7 days of invoice date. We support bank transfer and card payment.',
            },
            {
                q: 'Can employees order meals that exceed their allowance?',
                a: 'Yes — if your company policy allows top-ups, employees can pay the difference via Paystack at the time of ordering. You can disable this in Budget & Rules settings.',
            },
        ],
    },
    {
        id: 'employees',
        label: 'For Employees',
        items: [
            {
                q: 'How do I place an order?',
                a: "Log in to app.mannaworkmeals.com (or use the PWA shortcut). Today's menu shows your available allowance balance at the top. Select a meal and confirm — that's it. Orders close at 10:00 AM daily.",
            },
            {
                q: 'Can I order for a future date?',
                a: 'Not currently. Manna operates on a same-day ordering model to ensure freshness. Orders open each morning and close at 10:00 AM.',
            },
            {
                q: "What if I don't order today?",
                a: "No problem — your allowance doesn't roll over (per company policy), but there's no penalty either. Just order tomorrow.",
            },
            {
                q: 'How do I cancel an order?',
                a: 'Go to My Orders and cancel before 10:30 AM. Cancellations after 10:30 AM cannot be processed as packing has already begun.',
            },
            {
                q: 'What if my meal is wrong or missing?',
                a: 'Contact your HR admin or flag the issue via the app. Manna ops team investigates all reported issues within the same day and applies credits where appropriate.',
            },
            {
                q: 'What payment methods are accepted for top-ups?',
                a: 'Paystack-supported Nigerian payment methods: Verve, Mastercard, Visa cards, and bank transfer.',
            },
        ],
    },
    {
        id: 'billing',
        label: 'Billing',
        items: [
            {
                q: 'When is my company invoiced?',
                a: 'Invoices are generated on the 1st of each month for the previous month\'s activity. Payment is due by the 7th.',
            },
            {
                q: 'What happens if payment is late?',
                a: 'Service continues for a 3-day grace period after the due date. After that, new orders are paused until payment is received. We send reminders at due date and at 3 days overdue.',
            },
            {
                q: 'Can I get a PDF invoice?',
                a: 'Yes — every invoice in the HR billing section has a PDF download link.',
            },
            {
                q: 'Do employees pay directly or does the company pay?',
                a: 'The company covers the allowance amount. If an employee orders a meal that exceeds their allowance, they pay the difference directly via Paystack. The company invoice only reflects the allowance portion.',
            },
            {
                q: 'Is there a setup fee?',
                a: 'No. Manna charges zero setup fees. You only pay for meals ordered.',
            },
        ],
    },
    {
        id: 'delivery',
        label: 'Delivery',
        items: [
            {
                q: 'What areas does Manna serve?',
                a: 'Currently Lagos Island, Victoria Island, Lekki Phase 1, and Ikoyi. Expansion to Lagos Mainland and Abuja is planned for H2 2025.',
            },
            {
                q: 'What time does lunch arrive?',
                a: 'Deliveries are made between 12:30 PM and 1:30 PM. Your office receives a single consolidated delivery — no multiple riders.',
            },
            {
                q: "What if a delivery is late?",
                a: 'Our SLA is delivery by 1:30 PM. If a delivery is late beyond 2:00 PM, affected employees automatically receive a credit applied to the next order.',
            },
            {
                q: 'Is there a minimum order count?',
                a: 'Yes — a minimum of 5 orders per delivery day is required. This is waived during your first 30 days as a pilot company.',
            },
            {
                q: 'How is food kept fresh during delivery?',
                a: 'Meals are packed in insulated containers and delivered within 45 minutes of preparation. Each container is sealed and labelled with the employee\'s name and meal.',
            },
        ],
    },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-[var(--line)] last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
                aria-expanded={isOpen}
            >
        <span className="body-m font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
          {item.q}
        </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-[var(--muted)] flex-shrink-0" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        <p className="body-s text-[var(--muted)] pb-5 leading-relaxed">{item.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('hr');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const toggle = (key: string) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const category = FAQS.find((c) => c.id === activeCategory)!;

    return (
        <div className="min-h-screen bg-[var(--surface-soft)]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="heading-m text-[var(--brand-green)] mb-4">Frequently asked questions</h1>
                    <p className="body-l text-[var(--muted)]">
                        Everything you need to know about Manna Office Meals.
                    </p>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Category nav */}
                    <nav className="md:w-48 flex-shrink-0">
                        <div className="md:sticky md:top-24 flex md:flex-col gap-2">
                            {FAQS.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setOpenItems(new Set());
                                    }}
                                    className={`text-left px-3 py-2 rounded-lg body-s font-medium transition-all ${
                                        activeCategory === cat.id
                                            ? 'bg-[var(--accent)] text-white'
                                            : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* FAQ list */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.18 }}
                            className="flex-1 bg-[var(--surface)] rounded-2xl border border-[var(--line)] px-6"
                        >
                            {category.items.map((item, i) => (
                                <AccordionItem
                                    key={i}
                                    item={item}
                                    isOpen={openItems.has(`${activeCategory}-${i}`)}
                                    onToggle={() => toggle(`${activeCategory}-${i}`)}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Still have questions */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 text-center bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-8"
                >
                    <h2 className="heading-s text-[var(--text)] mb-2">Still have questions?</h2>
                    <p className="body-s text-[var(--muted)] mb-4">
                        Our team is happy to walk you through anything before you sign up.
                    </p>
                    <a
                        href="mailto:hello@mannaworkmeals.com"
                        className="inline-block bg-[var(--accent)] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity body-s"
                    >
                        Contact us
                    </a>
                </motion.div>
            </div>
        </div>
    );
}