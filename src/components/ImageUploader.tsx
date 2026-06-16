'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'product-images'
const MAX_IMAGES = 8
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/** public URL에서 스토리지 경로(uid/파일명)를 뽑아낸다 */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

type Props = {
  userId: string
  value: string[]
  onChange: (urls: string[]) => void
}

export default function ImageUploader({ userId, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')

    const remaining = MAX_IMAGES - value.length
    if (remaining <= 0) {
      setError(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요`)
      return
    }

    const picked = Array.from(files).slice(0, remaining)
    setUploading(true)

    const uploaded: string[] = []
    for (const file of picked) {
      if (!ACCEPT.includes(file.type)) {
        setError('이미지 파일만 올릴 수 있어요 (jpg, png, webp, gif)')
        continue
      }
      if (file.size > MAX_SIZE) {
        setError('한 장당 5MB 이하만 올릴 수 있어요')
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}/${crypto.randomUUID()}.${ext}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (upErr) {
        setError('사진 업로드에 실패했어요 😢')
        continue
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded])

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleRemove(url: string) {
    onChange(value.filter(u => u !== url))
    const path = storagePathFromUrl(url)
    if (path) {
      // 베스트 에포트: 스토리지에서도 삭제 (실패해도 UI는 진행)
      await supabase.storage.from(BUCKET).remove([path])
    }
  }

  function makeMain(url: string) {
    onChange([url, ...value.filter(u => u !== url)])
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {/* 추가 버튼 */}
        {value.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 text-purple-300 hover:text-purple-500 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-xs">올리는 중...</span>
            ) : (
              <>
                <span className="text-2xl leading-none">＋</span>
                <span className="text-xs">{value.length}/{MAX_IMAGES}</span>
              </>
            )}
          </button>
        )}

        {/* 미리보기 */}
        {value.map((url, i) => (
          <div
            key={url}
            className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-purple-100 group"
          >
            <Image src={url} alt={`상품 사진 ${i + 1}`} fill sizes="96px" className="object-cover" />

            {/* 대표 배지 */}
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                대표
              </span>
            )}

            {/* 대표로 지정 */}
            {i !== 0 && (
              <button
                type="button"
                onClick={() => makeMain(url)}
                className="absolute bottom-1 left-1 bg-white/90 text-purple-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                대표로
              </button>
            )}

            {/* 삭제 */}
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs leading-none"
              aria-label="사진 삭제"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="text-pink-500 text-xs mt-2">{error}</p>}
      <p className="text-purple-300 text-xs mt-2">
        첫 번째 사진이 대표 이미지로 보여요. 최대 {MAX_IMAGES}장, 한 장당 5MB까지 🍠
      </p>
    </div>
  )
}
