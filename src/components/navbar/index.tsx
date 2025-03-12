import React from "react";
import styles from "./Navbar.module.scss";
import Linkedin from "@/assets/icons/linkedin.svg";
import Figma from "@/assets/icons/figma.svg";
import Github from "@/assets/icons/github.svg";
import HashPattern from "@/components/hash-pattern";

const Navbar: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <nav className={styles.container}>
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
          <p className={styles.links__subtitle}>Explore the design, development, and system architecture.</p>
        </div>
        <ul>
          <li>
            <a>
              <Figma />
              Design System
            </a>
          </li>
          <li>
            <a>
              <Github />
              Source Code
            </a>
          </li>
          <li>
            <a>
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
