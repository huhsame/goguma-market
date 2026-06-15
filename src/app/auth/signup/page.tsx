'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요 🔐')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('이미 가입된 이메일이에요 💌')
      } else {
        setError('회원가입 중 오류가 발생했어요 😢')
      }
      setLoading(false)
      return
    }

    setSuccess('가입 완료! 이메일을 확인해주세요 ✉️')
    setLoading(false)
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
          <h2 className="text-xl font-bold text-purple-700 mb-6 text-center">회원가입</h2>

          {success ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">✉️</div>
              <p className="text-purple-700 font-semibold text-lg">{success}</p>
              <p className="text-purple-400 text-sm mt-2">
                이메일 인증 후 로그인할 수 있어요!
              </p>
              <Link href="/auth/login" className="goguma-btn mt-6 inline-block">
                로그인하러 가기 🍠
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-600 mb-1">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  required
                  placeholder="고구마러버"
                  maxLength={20}
                  className="goguma-input w-full"
                />
              </div>

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
                  비밀번호 <span className="text-purple-300">(6자 이상)</span>
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
                {loading ? '가입 중... ✨' : '가입하기 🍠'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center text-sm text-purple-400">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">
                로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
