import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductOwnerActions from '@/components/ProductOwnerActions'
import ProductGallery from '@/components/ProductGallery'

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

const STATUS_LABEL: Record<string, string> = {
  selling: '판매중',
  reserved: '예약중',
  sold: '판매완료',
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, profiles!products_user_id_profiles_fk(nickname)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.user_id
  const isGift = product.price === 0
  const nickname = (product.profiles as any)?.nickname ?? '고구마'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/products" className="inline-block text-purple-400 hover:text-purple-600 transition-colors mb-6">
        ← 목록으로
      </Link>

      <div className="goguma-card p-8">
        {/* 이미지 갤러리 */}
        <ProductGallery images={product.images ?? []} title={product.title} />

        {/* 상태 배지 + 카테고리 */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            product.status === 'selling' ? 'bg-green-100 text-green-600' :
            product.status === 'reserved' ? 'bg-yellow-100 text-yellow-600' :
            'bg-gray-100 text-gray-400'
          }`}>
            {STATUS_LABEL[product.status]}
          </span>
          <span className="text-xs bg-purple-100 text-purple-500 px-2.5 py-1 rounded-full font-medium">
            {product.category}
          </span>
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-purple-800 mb-3 leading-snug">
          {product.title}
        </h1>

        {/* 가격 */}
        <p className={`text-3xl font-bold mb-6 ${isGift ? 'text-pink-500' : 'text-purple-700'}`}>
          {isGift ? '🎁 나눔' : `${product.price.toLocaleString()}원`}
        </p>

        <hr className="border-pink-100 mb-6" />

        {/* 설명 */}
        <p className="text-purple-700 leading-relaxed whitespace-pre-wrap mb-8 min-h-[80px]">
          {product.description}
        </p>

        <hr className="border-pink-100 mb-5" />

        {/* 판매자 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
              {nickname[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-700">{nickname}</p>
              <p className="text-xs text-purple-300">{timeAgo(product.created_at)}</p>
            </div>
          </div>
          {/* 로그인한 비소유자에게 채팅 버튼 자리 (추후 구현) */}
          {!isOwner && user && (
            <button
              disabled
              className="text-sm text-purple-300 border border-purple-200 px-4 py-2 rounded-xl cursor-not-allowed"
              title="채팅 기능은 준비 중이에요"
            >
              채팅하기 💬
            </button>
          )}
        </div>

        {/* 소유자 액션 */}
        {isOwner && (
          <ProductOwnerActions
            productId={product.id}
            currentStatus={product.status}
          />
        )}
      </div>
    </div>
  )
}
