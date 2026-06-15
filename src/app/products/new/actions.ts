'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요해요 🔐' }
  }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const price = parseInt(formData.get('price') as string, 10) || 0
  const category = formData.get('category') as string

  if (!title) return { error: '제목을 입력해주세요' }
  if (!description) return { error: '설명을 입력해주세요' }
  if (price < 0) return { error: '가격은 0원 이상이어야 해요' }

  const { data, error } = await supabase
    .from('products')
    .insert({ user_id: user.id, title, description, price, category })
    .select('id')
    .single()

  if (error) return { error: '등록 중 오류가 발생했어요 😢' }

  redirect(`/products/${data.id}`)
}
