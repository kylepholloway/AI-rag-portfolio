'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

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
      setDisplayedText(parseTextToHTML(text))
      return
    }

    setDisplayedText('')
    let index = 0

    const typeCharacter = () => {
      if (index <= text.length) {
        const parsed = parseTextToHTML(text.slice(0, index))
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

  const parseTextToHTML = (input: string): string => {
    const lines = input.split('\n')
    const output: string[] = []

    let inUnorderedList = false
    let inOrderedList = false

    const closeLists = () => {
      if (inUnorderedList) {
        output.push('</ul>')
        inUnorderedList = false
      }
      if (inOrderedList) {
        output.push('</ol>')
        inOrderedList = false
      }
    }

    const processLinks = (line: string): string => {
      const linkRegex = /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g
      const isSoloLink = line.trim().match(new RegExp(`^${linkRegex.source}$`))
      if (isSoloLink) {
        return line.replace(
          linkRegex,
          (_match, text, href) =>
            `<a href="${href}" class="ai-link" target="_blank" rel="noopener noreferrer">${text}</a>`,
        )
      }
      return line.replace(
        linkRegex,
        (_match, text, href) =>
          `<a href="${href}" class="ai-link" target="_blank" rel="noopener noreferrer">${text}</a>`,
      )
    }

    for (let line of lines) {
      line = processLinks(line)

      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>')

      // Headings
      if (line.startsWith('###')) {
        closeLists()
        const title = line.replace(/^###\s*/, '').trim()
        output.push(`<h3 class="ai-heading">${title}</h3>`)
        continue
      }

      if (line.startsWith('####')) {
        closeLists()
        const title = line.replace(/^####\s*/, '').trim()
        output.push(`<h4 class="ai-subheading">${title}</h4>`)
        continue
      }

      // Divider
      if (line.trim() === '---') {
        closeLists()
        output.push('<hr class="ai-divider" />')
        continue
      }

      // Ordered list
      if (/^\d+\.\s+/.test(line)) {
        if (!inOrderedList) {
          closeLists()
          output.push('<ol class="ai-list">')
          inOrderedList = true
        }
        output.push(`<li>${line.replace(/^\d+\.\s+/, '')}</li>`)
        continue
      }

      // Unordered list
      if (/^[-*]\s+/.test(line)) {
        if (!inUnorderedList) {
          closeLists()
          output.push('<ul class="ai-list">')
          inUnorderedList = true
        }
        output.push(`<li>${line.replace(/^[-*]\s+/, '')}</li>`)
        continue
      }

      // Paragraph fallback
      if (line.trim()) {
        closeLists()
        output.push(`<p class="ai-p">${line}</p>`)
      }
    }

    closeLists()
    return output.join('')
  }

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
