'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ImageUploader from '@/components/ImageUploader'

const CATEGORIES = [
  '디지털기기', '가구/인테리어', '의류/잡화', '도서',
  '스포츠/레저', '생활/주방', '취미/게임', '기타',
]

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('기타')
  const [images, setImages] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: product } = await supabase
        .from('products')
        .select('user_id, title, description, price, category, images')
        .eq('id', id)
        .single()

      if (!product) {
        router.push('/products')
        return
      }
      if (product.user_id !== user.id) {
        // 소유자가 아니면 상세로 돌려보냄
        router.push(`/products/${id}`)
        return
      }

      setUserId(user.id)
      setTitle(product.title)
      setDescription(product.description)
      setPrice(String(product.price))
      setCategory(product.category)
      setImages(product.images ?? [])
      setReady(true)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const titleTrimmed = title.trim()
    const descriptionTrimmed = description.trim()
    const priceNum = parseInt(price, 10) || 0

    if (!titleTrimmed) return setError('제목을 입력해주세요')
    if (!descriptionTrimmed) return setError('설명을 입력해주세요')
    if (priceNum < 0) return setError('가격은 0원 이상이어야 해요')

    setLoading(true)

    const { error: dbError } = await supabase
      .from('products')
      .update({
        title: titleTrimmed,
        description: descriptionTrimmed,
        price: priceNum,
        category,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (dbError) {
      setError('수정 중 오류가 발생했어요 😢')
      setLoading(false)
      return
    }

    router.push(`/products/${id}`)
    router.refresh()
  }

  if (!ready) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-purple-300">
        불러오는 중... 🍠
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/products/${id}`} className="text-purple-400 hover:text-purple-600 transition-colors">
          ← 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-purple-700">판매글 수정 ✏️</h1>
      </div>

      <div className="goguma-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
                    category === cat
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'border-purple-200 text-purple-500 hover:border-purple-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 사진 */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-2">상품 사진</label>
            {userId && <ImageUploader userId={userId} value={images} onChange={setImages} />}
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-1">
              제목 <span className="text-purple-300">({title.length}/40)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={40}
              placeholder="상품 제목을 입력해주세요"
              className="goguma-input w-full"
            />
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-1">가격</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                min={0}
                placeholder="0"
                className="goguma-input w-full pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-medium">원</span>
            </div>
            {price === '0' || price === '' ? (
              <p className="text-xs text-pink-400 mt-1">0원으로 등록하면 나눔 상품으로 표시돼요 🎁</p>
            ) : null}
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-purple-600 mb-1">
              설명 <span className="text-purple-300">({description.length}/500)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              maxLength={500}
              rows={6}
              placeholder="상품 상태, 거래 방법 등을 자세히 적어주세요"
              className="goguma-input w-full resize-none"
            />
          </div>

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-600 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href={`/products/${id}`}
              className="flex-1 text-center text-purple-500 border-2 border-purple-200 hover:border-purple-400 py-3 rounded-2xl font-bold transition-colors"
            >
              취소
            </Link>
            <button type="submit" disabled={loading} className="goguma-btn flex-1">
              {loading ? '저장 중... ✨' : '수정 완료 ✏️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
