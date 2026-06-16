import Link from 'next/link'
import Image from 'next/image'

type Product = {
  id: number
  title: string
  price: number
  category: string
  status: string
  created_at: string
  images: string[] | null
  profiles: { nickname: string } | null
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function ProductCard({ product }: { product: Product }) {
  const isGift = product.price === 0
  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'
  const thumbnail = product.images?.[0]

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="goguma-card p-5 hover:shadow-lg transition-shadow">
        {/* 썸네일 */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-purple-50">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${isSold ? 'opacity-50' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-purple-200">
              🍠
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white font-bold text-lg">판매완료</span>
            </div>
          )}
        </div>

        {/* 카테고리 배지 + 상태 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-purple-100 text-purple-500 px-2 py-0.5 rounded-full font-medium">
            {product.category}
          </span>
          {(isSold || isReserved) && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isSold ? 'bg-gray-100 text-gray-400' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {isSold ? '판매완료' : '예약중'}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3 className={`font-bold text-base leading-snug mb-2 group-hover:text-purple-600 transition-colors line-clamp-2 ${
          isSold ? 'text-gray-400' : 'text-purple-800'
        }`}>
          {product.title}
        </h3>

        {/* 가격 */}
        <p className={`font-bold text-lg mb-3 ${
          isSold ? 'text-gray-300' : isGift ? 'text-pink-500' : 'text-purple-700'
        }`}>
          {isGift ? '🎁 나눔' : `${product.price.toLocaleString()}원`}
        </p>

        {/* 판매자 + 시간 */}
        <div className="flex items-center justify-between text-xs text-purple-300">
          <span>{product.profiles?.nickname ?? '고구마'}</span>
          <span>{timeAgo(product.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
