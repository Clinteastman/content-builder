import { useLocation } from 'react-router-dom'
import { ThemeToggle } from './ui/theme-toggle'

const pageTitles: Record<string, string> = {
  '/': 'Prompts',
  '/use': 'Use Prompts',
  '/settings': 'Settings'
}

export function PageTitleBar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Page Not Found'

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </h1>
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
      </div>
    </div>
  )
}