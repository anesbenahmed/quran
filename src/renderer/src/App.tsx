'use client'

import { Sidebar } from '@renderer/components/sidebar/Sidebar'
import { Dashboard } from '@renderer/components/dashboard/Dashboard'
import { Farms } from '@renderer/components/farms/Farms'
import { Batches } from '@renderer/components/batches/Batches'
import { Costs } from '@renderer/components/costs/Costs'
import { Schedules } from '@renderer/components/schedules/Schedules'
import { Reports } from '@renderer/components/reports/Reports'
import { useAppContext } from './context/AppContext'

export default function App(): React.ReactNode {
  const { activeSection } = useAppContext()

  const renderContent = (): React.ReactNode => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'farms':
        return <Farms />
      case 'batches':
        return <Batches />
      case 'costs':
        return <Costs />
      case 'schedules':
        return <Schedules />
      case 'reports':
        return <Reports />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div className="mx-auto px-6 py-6">{renderContent()}</div>
      </main>
    </div>
  )
}
