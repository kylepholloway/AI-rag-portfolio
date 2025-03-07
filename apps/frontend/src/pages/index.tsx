import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(""); // State for error handling

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent empty submissions

    try {
      const res = await axios.post("/api/chat", { prompt: input });
      setResponse(res.data.reply);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Chat API error:", err); // Log error for debugging
      setError("Failed to get a response. Please try again."); // User-friendly error message
    }
  };

  return (
    <div className="chat-container">
      <h1>Ask about Kyle</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit">Send</button>
      </form>
      {response && <p>{response}</p>}
      {error && <p className="error">{error}</p>} {/* Display error message */}
    </div>
  );
}
