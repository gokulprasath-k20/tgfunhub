import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CallProvider } from '@/providers/CallProvider';
import { AIChatBot } from '@/components/ai/AIChatBot';

import { UserProvider } from '@/components/shared/UserProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CallProvider>
      <UserProvider>
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
          <Navbar />
          <div className="max-w-5xl mx-auto flex">
            <Sidebar />
            <main className="flex-1 min-w-0 pb-16 md:pb-0">
              <div className="max-w-[1200px] mx-auto p-0 md:p-8">
                {children}
              </div>
            </main>
            <MobileBottomNav />
            <AIChatBot />
          </div>
        </div>
      </UserProvider>
    </CallProvider>
  );
}
