import { useState, useEffect, useRef } from "react";
import styles from "./Home.module.scss";
import Navbar from "@/components/navbar";
import AIResponse from "@/components/ai-response";
import UserPrompt from "@/components/user-prompt";
import AIForm from "@/components/ai-form";
import TypingEffect from "@/components/typing-effect";
import Head from 'next/head';

export default function Chat() {
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Ensure the chat feed always scrolls to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      const lastMessage = chatContainerRef.current.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [history]);

  const sendMessageToAI = async (messages: { role: string; content: string }[]) => {
    setLoading(true);
    setError(""); // ✅ Clear error when sending a message
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await response.json();
  
      // ✅ Append AI response after user message
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) { // ✅ Ensure proper error handling
      console.error("❌ AI Fetch Error:", err);
      setError("Failed to fetch response from AI.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleNewMessage = (message: { role: string; content: string }) => {
    setHistory((prev) => {
      const newHistory = [...prev, message];

      // ✅ Only call AI response if the new message is from the user
      if (message.role === "user") {
        sendMessageToAI(newHistory);
      }

      return newHistory;
    });
  };

  // ✅ Prevents duplicate AI responses when clicking a prompt
  const handlePromptClick = (prompt: string) => {
    if (!loading) {
      handleNewMessage({ role: "user", content: prompt });
    }
  };

  const prompts = [
    "What are Kyle's strengths and weaknesses?",
    "What are Kyle's most notable projects?",
    "What is Kyle's work experience?",
  ];

  return (
    <>
      <Head>
        <title>Kyle Holloway&apos;s AI-Powered Portfolio</title>
      </Head>
      <div className={styles.wrapper}>
        <Navbar />
        <section className={`${styles.container} ${history.length > 0 ? styles.container__bottom : ""}`}>
          <div className={styles.container__feed} ref={chatContainerRef}>
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

            {/* ✅ Display prompt buttons if no chat history */}
            {history.length === 0 && (
              <div className={styles.container__prompts}>
                {prompts.map((prompt, index) => (
                  <button key={index} onClick={() => handlePromptClick(prompt)} disabled={loading}>
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* ✅ Display user and AI messages */}
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

          {/* ✅ Chat Form */}
          <AIForm
            onNewMessage={handleNewMessage}
            setError={setError}
            loading={loading}
            setLoading={setLoading}
            isActive={history.length > 0}
          />
        </section>
      </div>
    </>
  );
}
