import React from 'react';
import styles from './Loader.module.scss';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className={styles.container}>
        {text.split('').map((char, index) => (
            <span key={index} className={styles.text}>{char}</span>
        ))}
    </div>
  );
};

export default Loader;
