import React, { useState, useEffect } from 'react'
import styles from './MobileMenu.module.scss'
import Navbar from '../navbar'
import Logo from '@/assets/logos/Logo.svg'

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [shouldRenderNavbar, setShouldRenderNavbar] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const toggleMenu = () => {
    if (isOpen) {
      setIsFadingOut(true)
      setTimeout(() => {
        setIsOpen(false)
        setShouldRenderNavbar(false)
        setIsFadingOut(false)
      }, 300)
    } else {
      setShouldRenderNavbar(true)
      setIsOpen(true)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsFadingOut(false)
    }
  }, [isOpen])

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <div
          className={`${styles.hamburger} ${isOpen && !isFadingOut ? styles.open : ''}`}
          onClick={toggleMenu}
        >
          <span className={isOpen && !isFadingOut ? styles.open : ''}></span>
          <span className={isOpen && !isFadingOut ? styles.open : ''}></span>
          <span className={isOpen && !isFadingOut ? styles.open : ''}></span>
        </div>
      </div>
      {shouldRenderNavbar && <Navbar isFadingOut={isFadingOut} />}
    </div>
  )
}

export default MobileMenu
