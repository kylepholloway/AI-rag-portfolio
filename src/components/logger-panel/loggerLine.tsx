import styles from './LoggerPanel.module.scss'
import { LogEntry } from '@/utils/logger'

type LoggerLineProps = {
  log: LogEntry
}

const LoggerLine = ({ log }: LoggerLineProps) => {
  if (log.category === 'divider') {
    return <hr className={styles.divider} />
  }

  return (
    <div className={styles.logLine}>
      <span className={styles.timestamp}>[{log.timestamp}]</span>
      <span className={styles.emoji}>{log.emoji}</span>
      <span className={styles.label}>{log.label}</span>
      <span className={styles.message} dangerouslySetInnerHTML={{ __html: log.message }} />
    </div>
  )
}

export default LoggerLine
