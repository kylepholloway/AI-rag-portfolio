import React from 'react';
import styles from './Navbar.module.scss';
import Logo from '@/assets/logos/Logo.svg';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.container}>
      <div className={styles.logo}>
        <Logo />
      </div>
    </nav>
  );
};

export default Navbar;
