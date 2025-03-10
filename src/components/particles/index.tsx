import React from "react";
import styles from "./Particles.module.scss";

const NUM_PARTICLES = 4;

const Particles: React.FC = () => {
  return (
    <div className={styles.space}>
      {Array.from({ length: NUM_PARTICLES }).map((_, index) => (
        <div key={`particle-${index}`} className={styles.particle} data-index={index + 1}></div>
      ))}
    </div>
  );
};

export default Particles;
