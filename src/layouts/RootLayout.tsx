import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeft, ScrollText, Play, Settings } from 'lucide-react'
import { cn } from '../lib/utils'
import { ThemeToggle } from '../components/ui/theme-toggle'
import { ImportExportControls } from '../components/ImportExportControls'
import { Button } from '../components/ui/button'

export function RootLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const navItems = {
    main: [
      { href: '/', label: 'Prompts', icon: ScrollText },
      { href: '/use', label: 'Use Prompts', icon: Play },
    ],
    bottom: [
      { href: '/settings', label: 'Settings', icon: Settings }
    ]
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-4">
        <div className="flex items-center justify-between flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Prompt Builder</h2>
          <div className="flex items-center gap-4">
            <ImportExportControls />
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <div 
          className={cn(
            "relative border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 min-h-[calc(100vh-4rem)] transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 top-3 h-8 w-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>

          <nav className="flex flex-col justify-between h-full p-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navItems.main.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isCollapsed ? "justify-center" : "justify-start",
                    location.pathname === item.href
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              ))}
            </div>

            {/* Bottom Navigation */}
            <div className="space-y-1">
              {navItems.bottom.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isCollapsed ? "justify-center" : "justify-start",
                    location.pathname === item.href
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}