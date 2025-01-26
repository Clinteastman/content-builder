import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PanelLeftClose, PanelLeft, ScrollText, Play, Settings } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './ui/button'

interface ResizableSidebarProps {
  isCollapsed: boolean
  onCollapse: (collapsed: boolean) => void
  minWidth?: number
  maxWidth?: number
}

const navItems = {
  main: [
    { href: '/', label: 'Prompts', icon: ScrollText },
    { href: '/use', label: 'Use Prompts', icon: Play },
  ],
  bottom: [
    { href: '/settings', label: 'Settings', icon: Settings }
  ]
}

export function ResizableSidebar({ 
  isCollapsed, 
  onCollapse, 
  minWidth = 64, 
  maxWidth = 320 
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(256)
  const [isDragging, setIsDragging] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sidebarRef.current) return

      const newWidth = e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth])

  // Handle touch events for mobile
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !sidebarRef.current) return
      const touch = e.touches[0]
      const newWidth = touch.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }

    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove)
      return () => document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isDragging, minWidth, maxWidth])

  return (
    <div 
      ref={sidebarRef}
      style={{ width: isCollapsed ? minWidth : width }}
      className={cn(
        "relative border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 min-h-screen transition-all duration-300",
        isDragging && "select-none"
      )}
    >
      {/* App Title */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className={cn(
          "font-semibold transition-all duration-300 text-gray-900 dark:text-gray-50",
          isCollapsed ? "text-center text-sm" : "text-lg"
        )}>
          {isCollapsed ? "PB" : "Prompt Builder"}
        </h2>
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-14 h-8 w-8 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
        onClick={() => onCollapse(!isCollapsed)}
      >
        {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </Button>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="absolute -right-1 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-gray-200 dark:hover:bg-gray-700"
          onMouseDown={() => setIsDragging(true)}
        />
      )}

      <nav className="flex flex-col justify-between h-[calc(100%-4rem)] p-2">
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
  )
}