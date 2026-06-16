import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('products')
    .select('id, title, price, category, status, created_at, images, profiles!products_user_id_profiles_fk(nickname), likes(count), comments(count)')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data: products } = await query

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-purple-700">🛍️ 판매 중인 상품</h1>
        {user ? (
          <Link href="/products/new" className="goguma-btn-sm shrink-0">
            판매하기 🍠
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="shrink-0 text-sm text-purple-400 hover:text-purple-600 border border-purple-200 hover:border-purple-400 px-3 py-1.5 rounded-full transition-colors"
          >
            로그인 후 판매하기
          </Link>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <Suspense>
          <CategoryFilter />
        </Suspense>
      </div>

      {/* 상품 목록 */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🍠</div>
          <p className="text-purple-400 text-lg font-semibold">
            {category ? `'${category}' 카테고리의 상품이 없어요` : '아직 판매 중인 상품이 없어요'}
          </p>
          <p className="text-purple-300 text-sm mt-1 mb-6">
            {category ? '다른 카테고리를 확인해보세요!' : '첫 번째 판매자가 되어보세요!'}
          </p>
          {user && !category && (
            <Link href="/products/new" className="goguma-btn">
              첫 상품 등록하기 🍠
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
