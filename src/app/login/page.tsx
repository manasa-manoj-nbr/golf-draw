'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button, Input, Card, CardContent } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-bauhaus-white pattern-dots">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center gap-1 mb-4">
                  <div className="w-3 h-3 bg-bauhaus-red rounded-full" />
                  <div className="w-3 h-3 bg-bauhaus-blue rounded-full" />
                  <div className="w-3 h-3 bg-bauhaus-yellow rounded-full" />
                </div>
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-bauhaus-gray mt-2">Sign in to your GolfDraw account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-bauhaus-red/10 border-2 border-bauhaus-red text-bauhaus-red flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bauhaus-gray" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-bauhaus-blue hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-bauhaus-black/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-bauhaus-gray">or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-bauhaus-gray">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-bauhaus-red font-bold hover:underline">
                  Sign up now
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-bauhaus-blue/10 border-2 border-bauhaus-blue">
            <p className="text-sm font-bold text-bauhaus-blue mb-2">Demo Credentials</p>
            <p className="text-xs text-bauhaus-gray">
              <strong>User:</strong> demo@golfdraw.com / demo123
            </p>
            <p className="text-xs text-bauhaus-gray">
              <strong>Admin:</strong> admin@golfdraw.com / admin123
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
