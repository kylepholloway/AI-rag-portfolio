import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");

    try {
      console.log("🔹 Sending Request to API:", { prompt: input });

      const res = await axios.post(
        "/api/chat",
        { prompt: input },
        { headers: { "Content-Type": "application/json" } } // ✅ Ensure JSON is sent properly
      );

      console.log("✅ API Response:", res.data);
      setResponse(res.data.reply);
    } catch (err: any) {
      console.error("❌ Chat API Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Ask About Kyle</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-2">
        <input
          className="flex-1 p-2 border border-gray-300 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      {loading && <p className="mt-4 text-gray-600">Processing your question...</p>}

      {response && (
        <div className="mt-4 p-4 border border-gray-300 bg-white rounded max-w-md">
          <p className="font-medium">AI Response:</p>
          <p className="mt-2 text-gray-700">{response}</p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-600">{error}</p>
      )}
    </div>
  );
}
