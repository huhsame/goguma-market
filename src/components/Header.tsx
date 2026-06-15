'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const nickname = user?.user_metadata?.nickname || user?.email?.split('@')[0] || '고구마'

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🍠</span>
            <span className="text-xl font-bold text-purple-700">고구마마켓</span>
          </Link>
          <Link href="/products" className="hidden sm:block text-sm text-purple-500 hover:text-purple-700 font-medium transition-colors">
            상품 목록
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-purple-500 hidden sm:block">
                안녕하세요, <strong className="text-purple-700">{nickname}</strong>님! 🌟
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-purple-400 hover:text-purple-600 border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-full transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="goguma-btn-sm"
              >
                회원가입 🍠
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
