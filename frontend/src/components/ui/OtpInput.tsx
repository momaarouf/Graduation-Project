'use client'

import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OtpInputProps {
  length: number
  value: string[]
  onChange: (digits: string[]) => void
  disabled?: boolean
  autoFocus?: boolean
}

export default function OtpInput({ length, value, onChange, disabled, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const focus = (i: number) => refs.current[i]?.focus()

  const handleChange = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      const next = [...value]; next[i] = ''; onChange(next); return
    }
    const digits = raw.split('').slice(0, length - i)
    const next = [...value]
    digits.forEach((d, j) => { next[i + j] = d })
    onChange(next)
    const jumpTo = Math.min(i + digits.length, length - 1)
    setTimeout(() => focus(jumpTo), 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace') {
      if (value[i]) { const n=[...value];n[i]='';onChange(n) }
      else if (i > 0) { const n=[...value];n[i-1]='';onChange(n);focus(i-1) }
    } else if (e.key === 'ArrowLeft' && i > 0) focus(i - 1)
    else if (e.key === 'ArrowRight' && i < length - 1) focus(i + 1)
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!text) return
    const next = Array(length).fill('')
    text.split('').forEach((d, j) => { next[j] = d })
    onChange(next)
    focus(Math.min(text.length, length - 1))
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className={`
            w-10 h-12 sm:w-12 sm:h-14
            text-center text-xl font-bold
            border-2 rounded-xl
            bg-gray-50 dark:bg-gray-800
            text-gray-900 dark:text-white
            transition-all duration-150
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
            disabled:opacity-40 disabled:cursor-not-allowed
            ${value[i]
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        />
      ))}
    </div>
  )
}