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

export async function deleteProduct(productId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요' }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', user.id)

  if (error) return { error: '삭제 중 오류가 발생했어요' }
  redirect('/products')
}
