'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { LogEntry } from '@/utils/logger'
import { emojiForCategory } from '@/utils/logger'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

type LoggerContextType = {
  logs: LogEntry[]
  addLog: (message: string, category: string) => void
  clearLogs: () => void
  status: ConnectionStatus
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined)

export const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  const addLog = (message: string, category: string) => {
    const newEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      emoji: emojiForCategory(category),
      label: category,
      message,
      category,
    }
    setLogs((prev) => [...prev, newEntry])
  }

  const fetchServerLogs = async () => {
    try {
      const res = await fetch('/api/logger')
      if (!res.ok) throw new Error('Fetch failed')
      const newLogs: LogEntry[] = await res.json()
      if (Array.isArray(newLogs)) {
        setLogs((prev) => [...prev, ...newLogs])
      }
      setStatus('connected')
    } catch {
      setStatus('disconnected')
    }
  }

  useEffect(() => {
    fetchServerLogs()
    const interval = setInterval(fetchServerLogs, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <LoggerContext.Provider value={{ logs, addLog, clearLogs: () => setLogs([]), status }}>
      {children}
    </LoggerContext.Provider>
  )
}

export const useLogger = () => {
  const ctx = useContext(LoggerContext)
  if (!ctx) throw new Error('useLogger must be used inside LoggerProvider')
  return ctx
}
