import { useState, Dispatch, SetStateAction } from 'react'
import Loader from '@/components/loader'
import Rocket from '@/assets/icons/rocket.svg'
import { useLogger } from '@/utils/loggerProvider'

interface AIFormProps {
  onNewMessage: (message: { role: string; content: string }) => void
  setError: Dispatch<SetStateAction<string>>
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  isActive: boolean
}

const AIForm: React.FC<AIFormProps> = ({
  onNewMessage,
  setError,
  loading,
  setLoading,
  isActive,
}) => {
  const [input, setInput] = useState('')

  const { addLog } = useLogger()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) {
      addLog('Empty form submission blocked', 'form')
      return
    }

    addLog(`Prompt submitted: “${input}”`, 'prompt')

    setLoading(true)
    setError('')

    const userMessage = { role: 'user', content: input }
    onNewMessage(userMessage)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className={isActive ? 'active' : ''}>
      {loading && <Loader text="GENERATING..." />}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything about Kyle Holloway..."
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        <Rocket />
      </button>
    </form>
  )
}

export default AIForm
