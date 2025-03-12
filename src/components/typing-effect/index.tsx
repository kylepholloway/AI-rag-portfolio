import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
  text: string;
  isActive: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, isActive }) => {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText("");
    indexRef.current = -1;

    const typeCharacter = () => {
      indexRef.current++;
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        setTimeout(typeCharacter, 30);
      }
    };

    typeCharacter();

    return () => setDisplayedText(text);
  }, [text, isActive]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayedText]);

  return (
    <motion.span
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayedText}
    </motion.span>
  );
};

export default TypingEffect;
