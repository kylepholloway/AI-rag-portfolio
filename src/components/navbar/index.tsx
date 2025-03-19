import React, { useEffect, useState } from "react";
import styles from "./Navbar.module.scss";
import Linkedin from "@/assets/icons/linkedin.svg";
import Figma from "@/assets/icons/figma.svg";
import Github from "@/assets/icons/github.svg";
import HashPattern from "@/components/hash-pattern";

interface NavbarProps {
  isFadingOut?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isFadingOut }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <nav className={`${styles.container} ${isVisible ? styles.fadeIn : ''} ${isFadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.author}>
        <div className={styles.author__name}>
          <p>Kyle P. Holloway</p>
          <Linkedin />
        </div>
        <p className={styles.author__title}>
          Product Design, Engineering & Design Systems Lead
        </p>
      </div>
      <HashPattern />
      <div className={styles.links}>
        <div className={styles.links__header}>
          <p className={styles.links__title}>Open, transparent,<br />and intentionally accessible.</p>
          <p className={styles.links__subtitle}>From concept to code—see how this portfolio was built.</p>
        </div>
        <ul>
          <li>
            <a href="https://www.figma.com/design/ccFGZIjSpfmvduTvvGB7ZO/Design-System?node-id=0-1&p=f&t=ZIW6tKdKWObAxl1p-0" target="_blank">
              <Figma />
              Design System
            </a>
          </li>
          <li>
            <a href="https://github.com/kylepholloway/AI-rag-portfolio" target="_blank">
              <Github />
              Source Code
            </a>
          </li>
          <li>
            <a href="https://www.figma.com/board/gTpyLSNGuhHcX26GE3mL7H/System-Diagram?node-id=0-1&p=f&t=FT5Zx2kkQRFpd9cQ-0" target="_blank">
              <Figma />
              System Diagram
            </a>
          </li>
        </ul>
      </div>
      <HashPattern />
      <div className={styles.copyright}>
        © {currentYear} Kyle P. Holloway. All rights reserved.
      </div>
    </nav>
  );
};

export default Navbar;
