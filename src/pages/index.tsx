import { useState } from "react";
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

export default function Chat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent empty submissions

    setLoading(true);
    setResponse("");
    setError("");

    try {
      console.log("🔹 Sending Request to API:", { prompt: input });

      const res = await axios.post(
        "/api/chat",
        { prompt: input },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ API Response:", res.data);
      setResponse(res.data.reply);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Axios error handling
        console.error("❌ Chat API Error:", err.response?.data || err.message);
        setError(
          err.response?.data?.error ||
            "Failed to get a response. Please try again."
        );
      } else {
        // Non-Axios error (e.g., network issues, unknown errors)
        console.error("❌ Unexpected Error:", err);
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Particles></Particles>
      <Navbar></Navbar>

      {/* Main */}
      <section className={`${styles.container} ${response ? styles.container__bottom : ''}`}>

        {/* Intro */}
        <div className={`${styles.container__intro} ${response ? styles.container__intro__hidden : ''}`}>
          <Image src={Avatar} alt="Avatar"></Image>
          <div>
            <h1>No Resumes. No Guesswork.<br/>Just AI-Powered Answers.</h1>
            <p>An interactive AI portfolio that delivers instant insights into my work, leadership, and expertise—just ask.</p>
          </div>
        </div>

        {/* Chat Feed */}
        {response && (
          <AIResponse>{response}</AIResponse>
        )}

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
      <Footer></Footer>
    </div>
  );
}
