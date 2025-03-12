import React from "react";
import styles from "./HashPattern.module.scss";

const HashPattern: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hashPattern} />
    </div>
  );
};

export default HashPattern;
