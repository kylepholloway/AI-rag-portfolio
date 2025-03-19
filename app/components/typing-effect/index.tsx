"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TypingEffectProps {
  text: string;
  isActive: boolean;
  onTypingProgress?: () => void; // Callback to notify parent during typing
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  text,
  isActive,
  onTypingProgress,
}) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText(parseTextToHTML(text));
      return;
    }

    setDisplayedText("");

    let index = 0;

    const typeCharacter = () => {
      if (index <= text.length) {
        const parsedText = parseTextToHTML(text.slice(0, index));
        setDisplayedText(parsedText);
        index++;

        // Scroll the parent container to the bottom
        if (containerRef.current?.parentElement) {
          containerRef.current.parentElement.scrollTop =
            containerRef.current.parentElement.scrollHeight;
        }

        // Notify parent container to scroll to the bottom
        if (onTypingProgress) {
          onTypingProgress();
        }

        setTimeout(typeCharacter, 20);
      }
    };

    typeCharacter();

    return () => {
      index = text.length;
    };
  }, [text, isActive, onTypingProgress]);

  const parseTextToHTML = (input: string): string => {
    const lines = input.split("\n");
    const formattedLines: string[] = [];

    let isOrderedList = false;
    let isUnorderedList = false;

    lines.forEach((line) => {
      if (/^\d+\.\s/.test(line)) {
        // Ordered list item
        if (!isOrderedList) {
          formattedLines.push("<ol>");
          isOrderedList = true;
        }
        formattedLines.push(`<li>${line.replace(/^\d+\.\s/, "")}</li>`);
      } else if (/^[-*]\s/.test(line)) {
        // Unordered list item
        if (!isUnorderedList) {
          formattedLines.push("<ul>");
          isUnorderedList = true;
        }
        formattedLines.push(`<li>${line.replace(/^[-*]\s/, "")}</li>`);
      } else {
        // Regular text or end of list
        if (isOrderedList) {
          formattedLines.push("</ol>");
          isOrderedList = false;
        }
        if (isUnorderedList) {
          formattedLines.push("</ul>");
          isUnorderedList = false;
        }
        formattedLines.push(`<p>${line}</p>`);
      }
    });

    // Close any open lists
    if (isOrderedList) formattedLines.push("</ol>");
    if (isUnorderedList) formattedLines.push("</ul>");

    return formattedLines.join("");
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      dangerouslySetInnerHTML={{ __html: displayedText }}
    />
  );
};

export default TypingEffect;
