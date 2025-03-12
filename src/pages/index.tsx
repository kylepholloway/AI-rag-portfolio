import { useState, useEffect, useRef } from "react";
import styles from "./Home.module.scss";
import Navbar from "@/components/navbar";
import AIResponse from "@/components/ai-response";
import UserPrompt from "@/components/user-prompt";
import AIForm from "@/components/ai-form";
import TypingEffect from "@/components/typing-effect";

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const sendMessageToAI = (messages: { role: string; content: string }[]) => {
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    })
      .then((response) => response.json())
      .then((data) => {
        handleNewMessage({ role: "assistant", content: data.reply });
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch response from AI.");
        setLoading(false);
      });
  };

  const handleNewMessage = (message: { role: string; content: string }) => {
    setHistory((prev) => {
      const newHistory = [...prev, message];
      if (message.role === "user") {
        sendMessageToAI(newHistory);
      }
      return newHistory;
    });
  };

  const injectMessage = (content: string) => {
    handleNewMessage({ role: "user", content });
  };

  const prompts = [
    "What are Kyle's strengths and weaknesses?",
    "What are Kyle's most notable projects?",
    "What is Kyle's work experience?",
  ];

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <section
        className={`${styles.container} ${
          history.length > 0 ? styles.container__bottom : ""
        }`}
      >
        <div className={styles.container__feed} ref={chatContainerRef}>
          <div className={styles.container__intro}>
            <h1>
              No Resumes. No Guesswork.
              <br />
              Just AI-Powered Answers.
            </h1>
            <p>
              An interactive AI portfolio that delivers instant insights into my
              work, leadership, and expertise—just ask.
            </p>
          </div>
          {history.length === 0 && (
            <div className={styles.container__prompts}>
              {prompts.map((prompt, index) => (
                <button key={index} onClick={() => injectMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {history.map((msg, index) =>
            msg.role === "user" ? (
              <UserPrompt key={index}>{msg.content}</UserPrompt>
            ) : (
              <AIResponse key={index}>
                <TypingEffect
                  text={msg.content}
                  isActive={index === history.length - 1}
                />
              </AIResponse>
            )
          )}
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <AIForm
          onNewMessage={handleNewMessage}
          setError={setError}
          loading={loading}
          setLoading={setLoading}
        />
      </section>
    </div>
  );
}
