import React, { ReactNode } from "react";
import styles from "./AiResponse.module.scss";
import Robot from "@/assets/icons/robot.svg";

interface AIResponseProps {
  children: ReactNode;
}

const AIResponse: React.FC<AIResponseProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Robot />
      <div className={styles.text}>{children}</div>
    </div>
  );
};

export default AIResponse;
