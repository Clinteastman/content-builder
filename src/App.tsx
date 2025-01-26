import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'

import { RootLayout } from './layouts/RootLayout'
import PromptsPage from './pages/PromptsPage'
import UsePromptsPage from './pages/UsePromptsPage'
import SettingsPage from './pages/SettingsPage'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <PromptsPage /> },
      { path: '/use', element: <UsePromptsPage /> },
      { path: '/settings', element: <SettingsPage /> }
    ]
  }
])

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
