import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ResizableSidebar } from '../components/ResizableSidebar'
import { PageTitleBar } from '../components/PageTitleBar'

export function RootLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      <div className="flex relative">
        <ResizableSidebar
          isCollapsed={isCollapsed}
          onCollapse={setIsCollapsed}
          minWidth={64}
          maxWidth={320}
        />

        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          <PageTitleBar />
          <main 
            className="flex-1 p-4 md:p-6 overflow-auto"
            style={{ height: 'calc(100vh - 64px)' }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}