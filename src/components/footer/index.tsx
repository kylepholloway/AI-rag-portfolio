import React from "react";
import styles from "./Footer.module.scss";
import Linkedin from "@/assets/icons/linkedin.svg";
import Figma from "@/assets/icons/figma.svg";
import Github from "@/assets/icons/github.svg";

const Footer: React.FC = () => {
  return (
    <footer className={styles.container}>
      <div className={styles.author}>
        <div className={styles.author__name}>
          <p>Kyle P. Holloway</p>
          <Linkedin />
        </div>
        <p className={styles.author__title}>
          Product Design, Engineering & Design Systems Lead
        </p>
        <p className={styles.author__copyright}>
          © 2023 Your Company. All rights reserved.
        </p>
      </div>
      <div className={styles.sources}>
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
              Architecture
              </a>
          </li>
        </ul>
        <p>Open, transparent, and intentionally accessible.</p>
        <p>Explore the design, development, and system workflow.</p>
      </div>
    </footer>
  );
};

export default Footer;
