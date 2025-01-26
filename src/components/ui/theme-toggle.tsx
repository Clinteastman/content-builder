import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "./button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => {
        switch (theme) {
          case "light":
            setTheme("dark")
            break
          case "dark":
            setTheme("system")
            break
          default:
            setTheme("light")
        }
      }}
      className="relative h-8 w-8" 
      title={
        theme === "light" ? "Switch to dark mode" :
        theme === "dark" ? "Switch to system" : "Switch to light mode"
      }
    >
      <Sun className={`h-4 w-4 transition-all ${
        theme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
      }`} />
      <Moon className={`absolute h-4 w-4 transition-all ${
        theme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
      }`} />
      <Monitor className={`absolute h-4 w-4 transition-all ${
        theme === "system" ? "rotate-0 scale-100" : "rotate-90 scale-0"
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}