import type { Metadata } from 'next'
import LandingNavbar from '@/components/landing/LandingNavbar'
import Hero from '@/components/landing/Hero'
import SocialProof from '@/components/landing/SocialProof'
import HowItWorks from '@/components/landing/HowItWorks'
import Benefits from '@/components/landing/Benefits'
import Philosophy from '@/components/landing/Philosophy'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: "Verquo - AI-Powered Interview Marketplace",
  description: "Take one AI technical interview. Get verified. Share your performance profile with multiple recruiters, avoiding repetitive early-stage technical rounds.",
  alternates: {
    canonical: "/",
  },
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://verquo.com/#application",
        "name": "Verquo",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "url": "https://verquo.com",
        "description": "AI-powered technical interviewing platform enabling candidates to take a single verified technical assessment and share it with multiple recruiters.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://verquo.com/#organization",
        "name": "Verquo",
        "url": "https://verquo.com",
        "logo": "https://verquo.com/logo.png"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dynamic structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <LandingNavbar />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Benefits />
      <Philosophy />
      <CTA />
      <Footer />
    </div>
  )
}
