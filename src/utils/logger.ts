export type LogCategory =
  | 'prompt'
  | 'pre-prompt'
  | 'embedding'
  | 'rag'
  | 'boosting'
  | 'scoring'
  | 'tokens'
  | 'context'
  | 'llm'
  | 'stream'
  | 'animation'
  | 'complete'
  | 'form'

export type LogEntry = {
  timestamp: string
  emoji: string
  label: LogCategory | string
  message: string
  category: LogCategory | string
}

const emojiMap: Record<LogCategory | string, string> = {
  prompt: '🟠',
  'pre-prompt': '💬',
  embedding: '🧬',
  rag: '🧠',
  boosting: '🎯',
  scoring: '📊',
  tokens: '🔢',
  context: '🧵',
  llm: '🚀',
  stream: '⏳',
  animation: '✍️',
  complete: '✅',
  form: '📝',
}

const logs: LogEntry[] = []

export const serverLogger = {
  add: (message: string, category: LogCategory | string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      emoji: emojiMap[category] || '🔍',
      label: category,
      message,
      category,
    }
    logs.push(entry)
  },

  flush: (): LogEntry[] => {
    const copy = [...logs]
    logs.length = 0
    return copy
  },

  proxy: async (message: string, category: LogCategory | string) => {
    serverLogger.add(message, category)
    return new Promise((resolve) => setTimeout(resolve, 100))
  },
}

export const emojiForCategory = (category: string) => emojiMap[category] || '🔍'
