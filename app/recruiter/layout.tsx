import type { Metadata } from 'next'
import { Shell } from '@/components/layout/Shell'

export const metadata: Metadata = {
  title: {
    default: 'Recruiter Portal - Verquo',
    template: '%s | Recruiter Portal - Verquo',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <Shell portal="recruiter" userName="TechHire">{children}</Shell>
}
