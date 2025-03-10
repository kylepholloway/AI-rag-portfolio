import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/loader";
import Rocket from "@/assets/icons/rocket.svg";

interface AIFormProps {
  onNewMessage: (message: { role: string; content: string }) => void;
  setError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AIForm: React.FC<AIFormProps> = ({ onNewMessage, setError, loading, setLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    const userMessage = { role: "user", content: input };
    onNewMessage(userMessage);

    setInput("");

    try {
      console.log("🔹 Sending Request to API:", { messages: [userMessage] });

      const res = await axios.post(
        "/api/chat",
        { messages: [userMessage] },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ API Response:", res.data);

      const aiMessage = { role: "assistant", content: res.data.reply };
      onNewMessage(aiMessage);

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
    <form onSubmit={handleSubmit}>
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
  );
};

export default AIForm;
