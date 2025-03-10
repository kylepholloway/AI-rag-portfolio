import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "./Home.module.scss";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import Avatar from "@/assets/images/Avatar.png";
import Rocket from "@/assets/icons/rocket.svg";
import Loader from "@/components/loader";
import Particles from "@/components/particles";
import AIResponse from "@/components/ai-response";
import UserPrompt from "@/components/user-prompt";

export default function Chat() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [introHidden, setIntroHidden] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length > 0) {
      const timer = setTimeout(() => setIntroHidden(true), 500); // Match the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [history]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    const userMessage = { role: "user", content: input };
    setHistory((prev) => [...prev, userMessage]); // ✅ Display user input instantly

    setInput("");

    try {
      console.log("🔹 Sending Request to API:", { messages: [...history, userMessage] });

      const res = await axios.post(
        "/api/chat",
        { messages: [...history, userMessage] },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ API Response:", res.data);

      // ✅ Append AI response to chat feed
      const aiMessage = { role: "assistant", content: res.data.reply };
      setHistory((prev) => [...prev, aiMessage]);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("❌ Chat API Error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to get a response. Please try again.");
      } else {
        console.error("❌ Unexpected Error:", err);
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Particles />
      <Navbar />

      <section className={`${styles.container} ${history.length > 0 ? styles.container__bottom : ''}`}>
        {!introHidden && (
          <div className={`${styles.container__intro} ${history.length > 0 ? styles.container__intro__hidden : ''}`}>
            <Image src={Avatar} alt="Avatar" />
            <div>
              <h1>No Resumes. No Guesswork.<br />Just AI-Powered Answers.</h1>
              <p>An interactive AI portfolio that delivers instant insights into my work, leadership, and expertise—just ask.</p>
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
        <form onSubmit={handleSubmit} className={styles.form}>
          {loading && <Loader text="GENERATING..." />}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about Kyle Holloway..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            <Rocket />
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
