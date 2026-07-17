import { Shell } from '@/components/layout/Shell'

export default function CandidatePortalLayout({ children }: { children: React.ReactNode }) {
  return <Shell portal="candidate" userName="Arjun Mehta">{children}</Shell>
}
