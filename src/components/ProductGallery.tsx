'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square rounded-2xl bg-purple-50 flex items-center justify-center text-7xl text-purple-200 mb-6">
        🍠
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* 대표 이미지 */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-purple-50">
        <Image
          src={images[active]}
          alt={`${title} 사진 ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover"
          priority
        />
      </div>

      {/* 썸네일 목록 */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                i === active ? 'border-purple-500' : 'border-purple-100 hover:border-purple-300'
              }`}
            >
              <Image src={url} alt={`썸네일 ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
