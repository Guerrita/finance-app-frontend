import { DashboardGuard } from '@/components/auth/DashboardGuard'
import { MonthProvider } from '@/lib/context/month.context'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      <MonthProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </MonthProvider>
    </DashboardGuard>
  )
}
