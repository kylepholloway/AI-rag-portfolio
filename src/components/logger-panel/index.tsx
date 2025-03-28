'use client'

import { useLogger } from '@/utils/loggerProvider'
import styles from './LoggerPanel.module.scss'
import { useEffect, useRef, useState } from 'react'
import LoggerLine from './loggerLine'

const LoggerPanel = () => {
  const { logs, clearLogs, status } = useLogger()
  const [isOpen, setIsOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevLogsLength = useRef(logs.length)

  useEffect(() => {
    if (logs.length > prevLogsLength.current) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
    prevLogsLength.current = logs.length
  }, [logs])

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '📟 Active'
      case 'connecting':
        return '⏳ Connecting...'
      case 'disconnected':
        return '❌ Disconnected'
    }
  }

  return (
    <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h6>📡 System Logs</h6>
        <p>Connection status: {getStatusIcon()}</p>
        {/* <button onClick={clearLogs}>Clear</button> */}
      </div>

      <div className={styles.logs} ref={scrollRef}>
        {logs.length === 0 ? (
          <p className={styles.empty}>// Initiate chat to see the magic</p>
        ) : (
          <>
            {logs.map((log, idx) => (
              <LoggerLine key={idx} log={log} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default LoggerPanel
