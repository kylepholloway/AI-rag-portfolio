import styles from './LoggerPanel.module.scss'
import { LogEntry } from '@/utils/logger'

type LoggerLineProps = {
  log: LogEntry
}

const LoggerLine = ({ log }: LoggerLineProps) => {
  return (
    <div className={styles.logLine}>
      <span>{log.timestamp}</span>
      <span>{log.emoji}</span>
      <span className={styles.label}>{log.label}</span>
      <span className={styles.message}>{log.message}</span>
    </div>
  )
}

export default LoggerLine
