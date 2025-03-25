'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { parseMarkdown } from '@/utils/parseMarkdown'

interface TypingEffectProps {
  text: string
  isActive: boolean
  onTypingProgress?: () => void
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, isActive, onTypingProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevTextRef = useRef<string>('')
  const queueRef = useRef<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text)
      return
    }

    const newText = text.slice(prevTextRef.current.length)
    if (newText) {
      queueRef.current.push(...newText.split(''))
      prevTextRef.current = text
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const next = queueRef.current.shift()
        if (next) {
          setDisplayedText((prev) => prev + next)
          onTypingProgress?.()
        }

        if (queueRef.current.length === 0) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
        }
      }, 20) // control pacing here
    }
  }, [text, isActive, onTypingProgress])

  useEffect(() => {
    containerRef.current?.parentElement?.scrollTo({
      top: containerRef.current.parentElement.scrollHeight,
      behavior: 'smooth',
    })
  }, [displayedText])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(displayedText) }}
    />
  )
}

export default TypingEffect
