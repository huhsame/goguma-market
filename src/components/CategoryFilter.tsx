'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORIES = ['전체', '디지털기기', '가구/인테리어', '의류/잡화', '도서', '스포츠/레저', '생활/주방', '취미/게임', '기타']

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') ?? '전체'

  function select(cat: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === '전체') {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => select(cat)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
            current === cat
              ? 'bg-purple-500 border-purple-500 text-white'
              : 'border-purple-200 text-purple-500 hover:border-purple-400 bg-white/70'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
