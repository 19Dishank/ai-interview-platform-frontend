import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Candidate Portal - Verquo',
    template: '%s | Candidate Portal - Verquo',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
