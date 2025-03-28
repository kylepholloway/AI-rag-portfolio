'use client'

import { useLogger } from '@/utils/loggerProvider'
import styles from './LoggerPanel.module.scss'
import { useEffect, useRef, useState } from 'react'
import LoggerLine from './loggerLine'
import Drawer from '@/assets/icons/drawer.svg'

const LoggerPanel = () => {
  const { logs, clearLogs, status } = useLogger()
  const [isClosed, setIsClosed] = useState(false)
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
    <div className={`${styles.container} ${isClosed ? styles.closed : ''}`}>
      <div className={styles.header}>
        <button
          className={`${styles.toggle} ${isClosed ? styles.toggle__closed : ''}`}
          onClick={() => setIsClosed((prev) => !prev)}
        >
          <Drawer />
        </button>
        <h6>🔥 System Logs</h6>
        <p>Connection status: {getStatusIcon()}</p>
      </div>

      <div className={styles.logs} ref={scrollRef}>
        {logs.length === 0 ? (
          <p className={styles.empty}>// Initiate chat to see the magic ✨</p>
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
