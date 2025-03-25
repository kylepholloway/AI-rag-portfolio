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
  const [displayedText, setDisplayedText] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(parseMarkdown(text))
      return
    }

    setDisplayedText('')
    let index = 0

    const typeCharacter = () => {
      if (index <= text.length) {
        const parsed = parseMarkdown(text.slice(0, index))
        setDisplayedText(parsed)
        index++

        containerRef.current?.parentElement?.scrollTo({
          top: containerRef.current.parentElement.scrollHeight,
          behavior: 'smooth',
        })

        onTypingProgress?.()
        setTimeout(typeCharacter, 20)
      }
    }

    typeCharacter()
    return () => {
      index = text.length
    }
  }, [text, isActive, onTypingProgress])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      dangerouslySetInnerHTML={{ __html: displayedText }}
    />
  )
}

export default TypingEffect
