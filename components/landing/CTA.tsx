'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CTA() {
  const router = useRouter()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
      <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-4">Ready to be found?</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">It takes under 10 minutes to set up your profile. The interview is 45–65 minutes and valid for 6 months.</p>
      <Button
        id="cta-btn-get-started"
        size="lg"
        onClick={() => router.push('/signup')}
      >
        Get started — it&apos;s free <ArrowRight size={18} />
      </Button>
    </section>
  )
}
