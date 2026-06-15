'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않아요 🥺')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-5xl mb-2">🍠</div>
            <h1 className="text-3xl font-bold text-purple-700">고구마마켓</h1>
            <p className="text-sm text-purple-400 mt-1">달콤한 중고거래 🌟</p>
          </Link>
        </div>

        {/* 카드 */}
        <div className="goguma-card p-8">
          <h2 className="text-xl font-bold text-purple-700 mb-6 text-center">로그인</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-600 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="goguma-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-600 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="goguma-input w-full"
              />
            </div>

            {error && (
              <div className="bg-pink-50 border border-pink-200 text-pink-600 px-4 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="goguma-btn w-full"
            >
              {loading ? '로그인 중... ✨' : '로그인 🍠'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-purple-400">
            아직 회원이 아니신가요?{' '}
            <Link href="/auth/signup" className="text-purple-600 font-semibold hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
