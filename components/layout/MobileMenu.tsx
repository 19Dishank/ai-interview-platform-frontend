'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinkItem {
  label: string
  href: string
}

interface MobileMenuProps {
  links: LinkItem[]
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  if (links.length === 0) return null

  return (
    <>
      <button
        className="md:hidden p-2 rounded-md hover:bg-secondary cursor-pointer"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle mobile menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 border-t border-border bg-background px-4 py-3 flex flex-col gap-1 z-50 shadow-md md:hidden">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'px-3 py-2 rounded-md text-sm transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-secondary font-medium'
                  : 'text-muted-foreground hover:bg-secondary/60',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
