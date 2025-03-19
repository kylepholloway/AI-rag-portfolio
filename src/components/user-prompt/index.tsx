import React, { ReactNode } from "react";
import styles from "./UserPrompt.module.scss";
import User from "@/assets/icons/user.svg";

interface UserPromptProps {
  children: ReactNode;
}

const UserPrompt: React.FC<UserPromptProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <p className={styles.text}>{children}</p>
        <User />
      </div>
    </div>
  );
};

export default UserPrompt;
