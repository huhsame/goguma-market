'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike } from '@/app/products/[id]/actions'

export default function LikeButton({
  productId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  productId: number
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }

    // 낙관적 업데이트
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(c => c + (nextLiked ? 1 : -1))

    startTransition(async () => {
      const res = await toggleLike(productId)
      if ('error' in res) {
        // 실패 시 롤백
        setLiked(!nextLiked)
        setCount(c => c + (nextLiked ? -1 : 1))
      } else {
        // 서버 기준으로 동기화
        setLiked(res.liked)
        setCount(res.count)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold transition-colors disabled:opacity-60 ${
        liked
          ? 'border-pink-300 bg-pink-50 text-pink-500'
          : 'border-purple-100 text-purple-400 hover:border-pink-200 hover:text-pink-400'
      }`}
    >
      <span className={`text-xl leading-none transition-transform ${isPending ? 'scale-90' : ''}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span>좋아요</span>
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
