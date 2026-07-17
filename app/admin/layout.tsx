import type { Metadata } from 'next'
import { Shell } from '@/components/layout/Shell'

export const metadata: Metadata = {
  title: {
    default: 'Admin Portal - Verquo',
    template: '%s | Admin Portal - Verquo',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Shell portal="admin" userName="Admin">{children}</Shell>
}
