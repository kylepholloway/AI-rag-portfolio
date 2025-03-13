import React, { useState } from "react";
import styles from "./MobileMenu.module.scss";
import Navbar from "../navbar";
import Logo from "@/assets/logos/Logo.svg";

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Logo />
        </div>
        <div className={`${styles.hamburger} ${isOpen ? "open" : ""}`} onClick={toggleMenu}>
          <span className={isOpen ? "open" : ""}></span>
          <span className={isOpen ? "open" : ""}></span>
          <span className={isOpen ? "open" : ""}></span>
        </div>
      </div>
      {isOpen && <Navbar />}
    </div>
  );
};

export default MobileMenu;
