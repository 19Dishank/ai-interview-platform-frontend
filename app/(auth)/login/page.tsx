'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('otp') }, 1000)
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); router.push('/candidate/dashboard') }, 1000)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/verquo-lockup-dark.svg"
            alt="Verquo Logo"
            width={112}
            height={32}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <div>
          <blockquote className="font-display text-2xl font-medium leading-relaxed mb-6 opacity-90">
            &ldquo;One structured interview replaced six screening calls. I heard back from three companies within a week.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format"
              alt="Arjun Mehta" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="font-medium text-sm">Arjun Mehta</div>
              <div className="text-sm opacity-70">Senior Frontend Engineer</div>
            </div>
          </div>
        </div>
        <p className="text-sm opacity-50">© 2026 Verquo AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your Verquo account</p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <Input
                id="login-input-email"
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button
                id="login-btn-continue"
                type="submit"
                loading={loading}
                className="w-full"
              >
                Continue <ArrowRight size={16} />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                We&apos;ll send a one-time code — no password needed.
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                </p>
                <Input
                  id="login-input-otp"
                  label="Verification code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button
                id="login-btn-signin"
                type="submit"
                loading={loading}
                className="w-full"
              >
                Sign in <ArrowRight size={16} />
              </Button>
              <button
                id="login-btn-back"
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors cursor-pointer"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="text-sm text-center text-muted-foreground mt-8">
            No account? <Link href="/signup" className="text-primary hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
