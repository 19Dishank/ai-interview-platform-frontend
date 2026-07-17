'use client'

import { useTheme } from '@/context/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'

export default function LandingNavbar() {
  const { theme, toggleTheme } = useTheme()
  return <Navbar theme={theme} onToggleTheme={toggleTheme} />
}
