'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
