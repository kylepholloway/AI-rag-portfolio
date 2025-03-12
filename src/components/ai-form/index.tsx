import { useState, Dispatch, SetStateAction } from "react";
import Loader from "@/components/loader";
import Rocket from "@/assets/icons/rocket.svg";

interface AIFormProps {
  onNewMessage: (message: { role: string; content: string }) => void;
  setError: Dispatch<SetStateAction<string>>; // ✅ Added
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>; // ✅ Added
}

const AIForm: React.FC<AIFormProps> = ({ onNewMessage, setError, loading, setLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(""); // ✅ Reset error when sending a new message

    const userMessage = { role: "user", content: input };
    onNewMessage(userMessage);
    setInput(""); // ✅ Clear input after sending
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
