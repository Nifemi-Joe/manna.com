'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { TopBar } from '@/components/layout/TopBar';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard portal="studio">
                <div className="flex flex-col h-screen overflow-hidden page-wash">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </AuthGuard>
        </AuthProvider>
    );
}
