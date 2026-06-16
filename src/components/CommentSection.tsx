'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { addComment, deleteComment } from '@/app/products/[id]/actions'

export type CommentItem = {
  id: number
  content: string
  created_at: string
  user_id: string
  nickname: string
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function CommentSection({
  productId,
  comments,
  currentUserId,
  isLoggedIn,
}: {
  productId: number
  comments: CommentItem[]
  currentUserId: string | null
  isLoggedIn: boolean
}) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setError('')
    startTransition(async () => {
      const res = await addComment(productId, content)
      if (res?.error) setError(res.error)
      else setText('')
    })
  }

  function handleDelete(id: number) {
    if (!confirm('댓글을 삭제할까요?')) return
    setError('')
    startTransition(async () => {
      const res = await deleteComment(id, productId)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <section className="goguma-card p-6 mt-5">
      <h2 className="text-lg font-bold text-purple-700 mb-4">
        댓글 <span className="text-pink-400">{comments.length}</span>
      </h2>

      {/* 댓글 입력 */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="따뜻한 댓글을 남겨주세요 🍠"
            rows={3}
            maxLength={1000}
            disabled={isPending}
            className="goguma-input w-full resize-none disabled:opacity-60"
          />
          {error && <p className="text-pink-500 text-xs mt-2">{error}</p>}
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isPending || !text.trim()}
              className="goguma-btn-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? '등록 중...' : '댓글 달기'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 text-center bg-purple-50 rounded-2xl py-4">
          <Link href="/auth/login" className="text-sm text-purple-500 hover:text-purple-700 font-medium">
            로그인하고 댓글을 남겨보세요 →
          </Link>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map(c => (
            <li key={c.id} className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white font-bold text-xs">
                {c.nickname[0] ?? '고'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-700">{c.nickname}</span>
                  <span className="text-xs text-purple-300">{timeAgo(c.created_at)}</span>
                  {currentUserId === c.user_id && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending}
                      className="ml-auto text-xs text-purple-300 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-sm text-purple-700 whitespace-pre-wrap break-words mt-0.5">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-purple-300 py-6">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요! 💬
        </p>
      )}
    </section>
  )
}
