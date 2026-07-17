'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { UserMenu } from './UserMenu'
import { MobileMenu } from './MobileMenu'

interface NavbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  portal?: 'candidate' | 'recruiter' | 'admin' | null
  userName?: string
}

const portalLinks = {
  candidate: [
    { label: 'Dashboard', href: '/candidate/dashboard' },
    { label: 'My Report', href: '/candidate/report' },
    { label: 'Interview History', href: '/candidate/history' },
  ],
  recruiter: [
    { label: 'Find Candidates', href: '/recruiter/search' },
    { label: 'Compare', href: '/recruiter/compare' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Templates', href: '/admin/templates' },
    { label: 'Subscriptions', href: '/admin/subscriptions' },
  ],
}

export function Navbar({ theme, onToggleTheme, portal, userName }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const links = portal ? portalLinks[portal] : []

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Mobile Icon */}
            <img
              src={`/verquo-icon${theme === "dark" ? '-dark' : ''}.svg`}
              alt="Verquo Icon"
              width={28}
              height={28}
              className="w-7 h-7 object-contain hidden dark:block sm:dark:hidden"
            />
            {/* Desktop Lockup Logo */}
            <img
              src={`/verquo-lockup-${theme}.svg`}
              alt="Verquo Logo"
              width={98}
              height={28}
              className="h-7 w-auto object-contain hidden dark:sm:block"
            />
          </Link>

          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm transition-colors duration-150',
                    pathname.startsWith(link.href)
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {portal && (
            <span className="hidden sm:inline font-mono text-xs px-2 py-1 rounded bg-secondary text-muted-foreground uppercase tracking-wider">
              {portal}
            </span>
          )}

          <button
            id="nav-btn-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-md hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {portal && userName ? (
            <UserMenu userName={userName} portal={portal} />
          ) : !portal ? (
            <div className="flex items-center gap-2">
              <Button
                id="nav-btn-signin"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
              >
                Sign in
              </Button>
              <Button
                id="nav-btn-getstarted"
                size="sm"
                onClick={() => router.push('/signup')}
              >
                Get started
              </Button>
            </div>
          ) : null}

          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  )
}
