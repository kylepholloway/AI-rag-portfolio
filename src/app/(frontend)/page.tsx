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

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef(false)

  // ✅ Ensure chat scrolls to the latest message or animation
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
    setError('') // ✅ Clear error when sending a message

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
      const data = await response.json()

      setHistory((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      console.error('❌ AI Fetch Error:', err)
      setError('Failed to fetch response from AI.')
    } finally {
      isFetchingRef.current = false
      setLoading(false)
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
      handleNewMessage({ role: 'user', content: prompt })
    }
  }

  // ✅ Memoize the prompts to avoid unnecessary re-renders
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

  // ✅ Optimized function with `useCallback` to generate random prompts
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

            {/* ✅ Display prompt buttons if no chat history */}
            {history.length === 0 && (
              <div className={styles.container__prompts}>
                {randomPrompts.map((prompt, index) => (
                  <button key={index} onClick={() => handlePromptClick(prompt)} disabled={loading}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* ✅ Display user and AI messages */}
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

            {/* Scroll anchor to ensure smooth scrolling */}
            <div ref={scrollAnchorRef} />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          {/* ✅ Chat Form */}
          <AIForm
            onNewMessage={handleNewMessage}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            isActive={history.length > 0}
          />
        </section>
      </div>
    </>
  )
}
