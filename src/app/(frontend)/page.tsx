'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './Home.module.scss'
import Navbar from '@/components/navbar'
import AIResponse from '@/components/ai-response'
import UserPrompt from '@/components/user-prompt'
import AIForm from '@/components/ai-form'
import TypingEffect from '@/components/typing-effect'
import Head from 'next/head'
import MobileMenu from '@/components/mobile-menu'
import { useLogger } from '@/utils/loggerProvider'
import LoggerPanel from '@/components/logger-panel'

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)
  const hasStreamStartedRef = useRef(false)
  const { addLog } = useLogger()

  const scrollToBottom = useCallback(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [history, scrollToBottom])

  const sendMessageToAI = async (messages: { role: string; content: string }[]) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setLoading(true)
    setError('')
    hasStreamStartedRef.current = false

    const start = performance.now() // ← Start timer

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      if (!response.body) throw new Error('No response body from AI')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let assistantText = ''

      setHistory((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (!hasStreamStartedRef.current) {
          hasStreamStartedRef.current = true
          setLoading(false)
        }

        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk

        setHistory((prev) => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (updated[lastIndex]?.role === 'assistant') {
            updated[lastIndex].content = assistantText
          }
          return updated
        })
      }

      const duration = ((performance.now() - start) / 1000).toFixed(1)
      addLog(`Responded in ${duration}s`, 'complete')
      addLog('<hr class="log-divider" />', 'divider')
    } catch (err) {
      console.error('❌ AI Fetch Error:', err)
      setError('Failed to stream AI response.')
    } finally {
      isFetchingRef.current = false
      if (!hasStreamStartedRef.current) setLoading(false)
      hasStreamStartedRef.current = false
    }
  }

  const handleNewMessage = (message: { role: string; content: string }) => {
    if (message.role === 'user' && !loading) {
      setHistory((prev) => {
        const newHistory = [...prev, message]
        sendMessageToAI(newHistory)
        return newHistory
      })
    } else {
      setHistory((prev) => [...prev, message])
    }
  }

  const handlePromptClick = (prompt: string) => {
    if (!loading) {
      addLog(`Quick prompt button clicked: “${prompt}”`, 'pre-prompt')
      handleNewMessage({ role: 'user', content: prompt })
    }
  }

  const prompts = useMemo(
    () => [
      'What makes Kyle stand out?',
      'Would Kyle fit in a fast-paced startup?',
      'Has Kyle worked with headless CMS platforms?',
      'What’s Kyle’s backend or cloud experience?',
      'What did Kyle do for brands like Jack in the Box or Raising Cane’s?',
      'How does Kyle balance design, engineering, and product?',
      'What’s Kyle’s experience with design systems?',
      'Has Kyle built anything using AI or LLMs?',
      'What technologies does Kyle work with?',
      'How has Kyle helped grow a business or team?',
      'What’s Kyle’s leadership style?',
      'How does Kyle approach team collaboration?',
    ],
    [],
  )

  const getRandomPrompts = useCallback(() => {
    const isMobile = window.innerWidth < 768
    const promptCount = isMobile ? 2 : 3
    return [...prompts].sort(() => 0.5 - Math.random()).slice(0, promptCount)
  }, [prompts])

  const [randomPrompts, setRandomPrompts] = useState<string[]>([])

  useEffect(() => {
    setRandomPrompts(getRandomPrompts())
  }, [getRandomPrompts])

  return (
    <>
      <Head>
        <title>Kyle Holloway&apos;s AI-Powered Portfolio</title>
      </Head>
      <div className={styles.wrapper}>
        <MobileMenu />
        <div className={styles.navbar}>
          <Navbar />
        </div>
        <section
          className={`${styles.container} ${history.length > 0 ? styles.container__bottom : ''}`}
        >
          <div className={styles.container__feed} ref={chatContainerRef}>
            <div className={styles.container__intro}>
              <h1>
                No Resumes. No Guesswork.
                <br />
                Just AI-Powered Answers.
              </h1>
              <p>
                An interactive AI portfolio that delivers instant insights into my work, leadership,
                and expertise—just ask.
              </p>
            </div>

            {history.length === 0 && (
              <div className={styles.container__prompts}>
                {randomPrompts.map((prompt, index) => (
                  <button key={index} onClick={() => handlePromptClick(prompt)} disabled={loading}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {history.map((msg, index) =>
              msg.role === 'user' ? (
                <UserPrompt key={index}>{msg.content}</UserPrompt>
              ) : (
                <AIResponse key={index}>
                  <TypingEffect
                    text={msg.content}
                    isActive={index === history.length - 1}
                    onTypingProgress={scrollToBottom}
                  />
                </AIResponse>
              ),
            )}

            <div ref={scrollAnchorRef} />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <AIForm
            onNewMessage={handleNewMessage}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            isActive={history.length > 0}
          />
        </section>
        <LoggerPanel />
      </div>
    </>
  )
}
