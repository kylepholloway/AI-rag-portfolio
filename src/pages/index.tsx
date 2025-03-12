import { useState, useEffect, useRef } from "react";
import styles from "./Home.module.scss";
import Navbar from "@/components/navbar";
import AIResponse from "@/components/ai-response";
import UserPrompt from "@/components/user-prompt";
import AIForm from "@/components/ai-form";

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [introHidden, setIntroHidden] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length > 0) {
      const timer = setTimeout(() => setIntroHidden(true), 500);
      return () => clearTimeout(timer);
    }
  }, [history]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleNewMessage = (message: { role: string; content: string }) => {
    setHistory((prev) => [...prev, message]);
  };

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <section
        className={`${styles.container} ${
          history.length > 0 ? styles.container__bottom : ""
        }`}
      >
        <div className={styles.container__stream}>
          {!introHidden && (
            <div
              className={styles.container__intro}
            >
              <div>
                <h1>
                  No Resumes. No Guesswork.
                  <br />
                  Just AI-Powered Answers.
                </h1>
                <p>
                  An interactive AI portfolio that delivers instant insights
                  into my work, leadership, and expertise—just ask.
                </p>
              </div>
            </div>
          )}

          {/* ✅ Chat Feed: Displays both User and AI Messages */}
          <div className={styles.container__chat} ref={chatContainerRef}>
            {history.map((msg, index) =>
              msg.role === "user" ? (
                <UserPrompt key={index}>{msg.content}</UserPrompt>
              ) : (
                <AIResponse key={index}>{msg.content}</AIResponse>
              )
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {/* Chat Form */}
          <AIForm
            onNewMessage={handleNewMessage}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      </section>
    </div>
  );
}
