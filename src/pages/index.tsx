import { useState, useEffect, useRef } from "react";
import styles from "./Home.module.scss";
import Navbar from "@/components/navbar";
import AIResponse from "@/components/ai-response";
import UserPrompt from "@/components/user-prompt";
import AIForm from "@/components/ai-form";
import TypingEffect from "@/components/typing-effect";

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleNewMessage = (message: { role: string; content: string }) => {
    setHistory((prev) => [...prev, message]);
  };

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <section className={`${styles.container} ${history.length > 0 ? styles.container__bottom : ""}`}>
        <div className={styles.container__feed} ref={chatContainerRef}>
          {history.length === 0 && (
            <div className={styles.container__intro}>
              <h1>
                No Resumes. No Guesswork.
                <br />
                Just AI-Powered Answers.
              </h1>
              <p>
                An interactive AI portfolio that delivers instant insights into my work, leadership, and expertise—just ask.
              </p>
            </div>
          )}
          {history.map((msg, index) =>
            msg.role === "user" ? (
              <UserPrompt key={index}>{msg.content}</UserPrompt>
            ) : (
              <AIResponse key={index}>
                <TypingEffect text={msg.content} isActive={index === history.length - 1} />
              </AIResponse>
            )
          )}
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <AIForm onNewMessage={handleNewMessage} setError={setError} loading={loading} setLoading={setLoading} />
      </section>
    </div>
  );
}
