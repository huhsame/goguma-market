'use client'

import { useState, useTransition } from 'react'
import { updateStatus, deleteProduct } from '@/app/products/[id]/actions'

const STATUS_OPTIONS = [
  { value: 'selling', label: '판매중', color: 'text-green-600' },
  { value: 'reserved', label: '예약중', color: 'text-yellow-600' },
  { value: 'sold', label: '판매완료', color: 'text-gray-400' },
]

export default function ProductOwnerActions({
  productId,
  currentStatus,
}: {
  productId: number
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleStatusChange(newStatus: string) {
    if (newStatus === status) return
    setError('')
    startTransition(async () => {
      const result = await updateStatus(productId, newStatus)
      if (result?.error) {
        setError(result.error)
      } else {
        setStatus(newStatus)
      }
    })
  }

  function handleDelete() {
    if (!confirm('정말 이 판매글을 삭제할까요?')) return
    setError('')
    startTransition(async () => {
      const result = await deleteProduct(productId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="mt-6 pt-6 border-t border-pink-100">
      <p className="text-xs text-purple-400 mb-3 font-medium">내 판매글 관리</p>

      {/* 상태 변경 */}
      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleStatusChange(opt.value)}
            disabled={isPending}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl border-2 transition-colors ${
              status === opt.value
                ? 'border-purple-400 bg-purple-50 text-purple-600'
                : 'border-purple-100 text-purple-300 hover:border-purple-300'
            } disabled:opacity-50`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-pink-500 text-xs mb-3">{error}</p>
      )}

      {/* 삭제 */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="w-full py-2 text-sm text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-xl transition-colors disabled:opacity-50"
      >
        판매글 삭제
      </button>
    </div>
  )
}
