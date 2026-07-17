'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, User, Settings, LogOut } from 'lucide-react'

interface UserMenuProps {
  userName: string
  portal: string
}

export function UserMenu({ userName, portal }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-secondary text-sm transition-colors cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
          {userName[0]}
        </div>
        <span className="hidden sm:block text-sm">{userName}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <Link href={`/${portal}/profile`} onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors">
            <User size={14} /><span>Profile</span>
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors">
            <Settings size={14} /><span>Settings</span>
          </Link>
          <hr className="border-border" />
          <button type="button" onClick={() => { setOpen(false); router.push('/') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary text-destructive transition-colors cursor-pointer">
            <LogOut size={14} /><span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
