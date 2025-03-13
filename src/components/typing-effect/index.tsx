import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
  text: string;
  isActive: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, isActive }) => {
  const [displayedText, setDisplayedText] = useState<React.ReactNode[]>([]);
  const indexRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(formatText(text));
      return;
    }

    let accumulatedText = "";
    indexRef.current = 0;

    const typeCharacter = () => {
      if (indexRef.current < text.length) {
        accumulatedText += text[indexRef.current];
        setDisplayedText(formatText(accumulatedText));
        indexRef.current++;
        setTimeout(typeCharacter, 30);
      }
    };

    typeCharacter();

    return () => setDisplayedText(formatText(text));
  }, [text, isActive]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedText]);

  const formatText = (rawText: string): React.ReactNode[] => {
    const lines = rawText.split("\n").map((line) => line.trim()).filter((line) => line !== "");
    const elements: React.ReactNode[] = [];

    let bulletList: string[] = [];
    let numberedList: string[] = [];
    let isProcessingList: "bullet" | "numbered" | false = false;

    lines.forEach((line, index) => {
      if (/^\d+\.\s+/.test(line)) {
        numberedList.push(line.replace(/^\d+\.\s+/, ""));
        isProcessingList = "numbered";
      } else if (/^[-•*]\s+/.test(line)) {
        bulletList.push(line.replace(/^[-•*]\s+/, ""));
        isProcessingList = "bullet";
      } else {
        if (isProcessingList === "numbered" && numberedList.length > 0) {
          elements.push(
            <ol key={`num-list-${index}`}>
              {numberedList.map((item, idx) => (
                <li key={`num-${idx}`}>{item}</li>
              ))}
            </ol>
          );
          numberedList = [];
        }
        if (isProcessingList === "bullet" && bulletList.length > 0) {
          elements.push(
            <ul key={`bullet-list-${index}`}>
              {bulletList.map((item, idx) => (
                <li key={`bullet-${idx}`}>{item}</li>
              ))}
            </ul>
          );
          bulletList = [];
        }
        isProcessingList = false;
        elements.push(<p key={`p-${index}`}>{line}</p>);
      }
    });

    // Append any remaining list at the end
    if (numberedList.length > 0) {
      elements.push(
        <ol key="final-numbered-list">
          {numberedList.map((item, idx) => (
            <li key={`num-${idx}`}>{item}</li>
          ))}
        </ol>
      );
    }
    if (bulletList.length > 0) {
      elements.push(
        <ul key="final-bullet-list">
          {bulletList.map((item, idx) => (
            <li key={`bullet-${idx}`}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <motion.div ref={containerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {displayedText}
    </motion.div>
  );
};

export default TypingEffect;
