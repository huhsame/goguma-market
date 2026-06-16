'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateStatus(productId: number, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', productId)
    .eq('user_id', user.id)

  if (error) return { error: '변경 중 오류가 발생했어요' }
  return { success: true }
}

const BUCKET = 'product-images'

function storagePath(url: string): string | null {
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  return idx === -1 ? null : url.slice(idx + marker.length)
}

export async function deleteProduct(productId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  // 먼저 이미지 경로 확보 (삭제 후 정리용)
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', user.id)

  if (error) return { error: '삭제 중 오류가 발생했어요' }

  // 스토리지 이미지 정리 (베스트 에포트)
  const images: string[] = product?.images ?? []
  const paths = images
    .map(storagePath)
    .filter((p): p is string => p !== null)
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths)
  }

  redirect('/products')
}

// ── 좋아요 ───────────────────────────────────────────────

export async function toggleLike(
  productId: number
): Promise<{ error: string } | { liked: boolean; count: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요 🔐' }

  // 이미 눌렀는지 확인
  const { data: existing } = await supabase
    .from('likes')
    .select('product_id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.id)
    if (error) return { error: '좋아요 취소 중 오류가 발생했어요' }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ product_id: productId, user_id: user.id })
    if (error) return { error: '좋아요 중 오류가 발생했어요' }
  }

  // 최신 카운트 조회
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId)

  // 목록 페이지의 좋아요 수도 갱신
  revalidatePath('/products')

  return { liked: !existing, count: count ?? 0 }
}

// ── 댓글 ─────────────────────────────────────────────────

export async function addComment(productId: number, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요 🔐' }

  const trimmed = content.trim()
  if (!trimmed) return { error: '댓글 내용을 입력해주세요' }
  if (trimmed.length > 1000) return { error: '댓글은 1000자 이내로 입력해주세요' }

  const { error } = await supabase
    .from('comments')
    .insert({ product_id: productId, user_id: user.id, content: trimmed })

  if (error) return { error: '댓글 등록 중 오류가 발생했어요 😢' }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}

export async function deleteComment(commentId: number, productId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요 🔐' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: '댓글 삭제 중 오류가 발생했어요' }

  revalidatePath(`/products/${productId}`)
  return { success: true }
}
