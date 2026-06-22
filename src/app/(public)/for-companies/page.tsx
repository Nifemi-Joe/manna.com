import { Check, X } from 'lucide-react';

const FEATURES = [
    { name: 'Employee meal allowance', pilot: true, standard: true, enterprise: true },
    { name: 'Daily menu customisation', pilot: false, standard: true, enterprise: true },
    { name: 'HR dashboard', pilot: true, standard: true, enterprise: true },
    { name: 'Order reports & analytics', pilot: false, standard: true, enterprise: true },
    { name: 'RBAC access control', pilot: false, standard: false, enterprise: true },
    { name: 'Dedicated ops support', pilot: false, standard: false, enterprise: true },
    { name: 'Custom onboarding', pilot: false, standard: false, enterprise: true },
    { name: 'SLA guarantee', pilot: false, standard: true, enterprise: true },
    { name: 'Employee count', pilot: 'Up to 50', standard: 'Up to 300', enterprise: 'Unlimited' },
    { name: 'Setup fee', pilot: '₦0', standard: '₦0', enterprise: 'Custom' },
];

function Cell({ value }: { value: boolean | string }) {
    if (typeof value === 'string') return <span className="text-body-s text-[var(--text)] font-medium">{value}</span>;
    return value
        ? <Check size={18} className="text-[var(--success)] mx-auto" />
        : <X size={18} className="text-[var(--line-strong)] mx-auto" />;
}

export default function ForCompaniesPage() {
    return (
        <main className="pt-24 pb-20">
            {/* Hero */}
            <section className="max-w-4xl mx-auto px-6 text-center mb-20">
                <h1 className="text-display-l text-[var(--brand-green)] mb-4">
                    Simple pricing.<br />Serious results.
                </h1>
                <p className="text-body-l text-[var(--muted)] max-w-xl mx-auto">
                    Whether you&apos;re running a pilot or scaling to hundreds of employees,
                    Manna has a plan built for your team.
                </p>
            </section>

            {/* Plans table */}
            <section className="max-w-4xl mx-auto px-6 mb-20">
                <div className="overflow-x-auto rounded-2xl border border-[var(--line)] shadow-md">
                    <table className="w-full text-body-s">
                        <thead>
                        <tr className="border-b border-[var(--line)]">
                            <th className="p-6 text-left text-[var(--muted)] font-normal w-1/2">Feature</th>
                            {['Pilot', 'Standard', 'Enterprise'].map((plan) => (
                                <th key={plan} className="p-6 text-center">
                                    <p className="text-heading-s text-[var(--text)]">{plan}</p>
                                    <p className="text-body-s text-[var(--muted)] font-normal mt-0.5">
                                        {plan === 'Pilot' ? 'Free to start' : plan === 'Standard' ? '₦350/employee/day' : 'Custom pricing'}
                                    </p>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--line)]">
                        {FEATURES.map((f) => (
                            <tr key={f.name} className="hover:bg-[var(--surface-soft)] transition-colors">
                                <td className="px-6 py-4 text-[var(--text)]">{f.name}</td>
                                <td className="px-6 py-4 text-center"><Cell value={f.pilot} /></td>
                                <td className="px-6 py-4 text-center"><Cell value={f.standard} /></td>
                                <td className="px-6 py-4 text-center"><Cell value={f.enterprise} /></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* How billing works */}
            <section className="max-w-4xl mx-auto px-6 mb-20">
                <h2 className="text-heading-m text-[var(--brand-green)] mb-8 text-center">How billing works</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        {
                            title: 'Company invoice',
                            description: 'Your company receives a single monthly invoice covering all employee meals. Pay by bank transfer on the 5th of each month.',
                            badge: 'For HR',
                        },
                        {
                            title: 'Employee top-ups',
                            description: 'When a meal exceeds the company allowance, employees can top up the difference using Paystack — card, bank transfer, or USSD.',
                            badge: 'For Employees',
                        },
                    ].map(({ title, description, badge }) => (
                        <div key={title} className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
              <span className="inline-block px-2 py-0.5 bg-[var(--surface-soft)] border border-[var(--line)] rounded text-label-xs text-[var(--muted)] mb-3">
                {badge}
              </span>
                            <h3 className="text-heading-s text-[var(--text)] mb-2">{title}</h3>
                            <p className="text-body-s text-[var(--muted)]">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Service standards */}
            <section className="max-w-4xl mx-auto px-6">
                <h2 className="text-heading-m text-[var(--brand-green)] mb-8 text-center">Our service standards</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'Delivery SLA', items: ['Cutoff: 10:00 AM daily', 'Delivery: 12:00–1:00 PM', '95%+ on-time guarantee', 'Credit on late delivery'] },
                        { title: 'Support', items: ['HR dashboard access', 'WhatsApp ops support', 'Dedicated account manager (Enterprise)', '24h SLA on issues'] },
                        { title: 'Onboarding', items: ['Setup in under 48h', 'Employee CSV import', 'Training session included', 'No tech integration required'] },
                    ].map(({ title, items }) => (
                        <div key={title} className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                            <h3 className="text-heading-s text-[var(--text)] mb-4">{title}</h3>
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-body-s text-[var(--muted)]">
                                        <Check size={14} className="text-[var(--success)] mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}