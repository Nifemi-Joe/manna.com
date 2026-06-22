'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[var(--surface-soft)] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center max-w-md"
            >
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldOff className="w-8 h-8 text-[var(--danger)]" />
                </div>
                <h1 className="heading-s text-[var(--text)] mb-3">Access denied</h1>
                <p className="body-m text-[var(--muted)] mb-8">
                    You don&apos;t have permission to view this page. If you think this is a mistake, contact
                    your HR admin or Manna support.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
                        Go back
                    </Button>
                    <Button variant="filled" onClick={() => router.push('/login')}>
                        Sign in as different user
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}