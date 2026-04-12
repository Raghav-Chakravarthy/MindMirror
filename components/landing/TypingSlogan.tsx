"use client";

import { useState, useEffect } from "react";

const SLOGANS = [
  "the best work you never did",
  "the best therapist you never had",
  "the best version of you never met",
  "the best mirror you never looked into",
  "the best insights you never shared",
];

export default function TypingSlogan() {
  const [text, setText] = useState("");
  const [sloganIndex, setSloganIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSlogan = SLOGANS[sloganIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setText(currentSlogan.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 30);
      } else {
        setIsDeleting(false);
        setSloganIndex((sloganIndex + 1) % SLOGANS.length);
      }
    } else {
      if (charIndex < currentSlogan.length) {
        timeout = setTimeout(() => {
          setText(currentSlogan.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 80);
      } else {
        // Pause before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, sloganIndex]);

  return (
    <div className="h-12 flex items-center justify-center">
      <h2 className="text-2xl sm:text-3xl font-medium text-black/80 tracking-tight lowercase">
        <span>{text}</span>
        <span className="inline-block w-[2px] h-6 bg-purple-500/80 ml-1 animate-pulse" />
      </h2>
    </div>
  );
}
