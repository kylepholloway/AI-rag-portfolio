'use client'

import { useLogger } from '@/utils/loggerProvider'
import styles from './LoggerPanel.module.scss'
import { useEffect, useRef, useState } from 'react'
import LoggerLine from './loggerLine'

const LoggerPanel = () => {
  const { logs, clearLogs } = useLogger()
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <>
      <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide Logs' : 'View Logs'}
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <span>📡 System Logs</span>
          <button onClick={clearLogs}>Clear</button>
        </div>

        {logs.length === 0 ? (
          <p className={styles.empty}>No logs received yet.</p>
        ) : (
          <>
            {logs.map((log, idx) => (
              <LoggerLine key={idx} log={log} />
            ))}

            <pre style={{ color: '#0f0', fontSize: 12 }}>{JSON.stringify(logs, null, 2)}</pre>
          </>
        )}
      </div>
    </>
  )
}

export default LoggerPanel
