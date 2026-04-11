"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
}

export default function WordsPullUpMultiStyle({ segments, className }: WordsPullUpMultiStyleProps) {
  const container = useRef(null);
  const isInView = useInView(container, { once: true, margin: "-100px" });

  const pullupVariant = {
    initial: { y: 20, opacity: 0 },
    animate: (i: any) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.08,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  let globalWordIndex = 0;
  const wordTokens: { word: string; className?: string; index: number }[] = [];

  segments.forEach((segment) => {
    segment.text.split(" ").forEach((word) => {
      wordTokens.push({ word, className: segment.className, index: globalWordIndex });
      globalWordIndex++;
    });
  });

  return (
    <div ref={container} className={cn("inline-flex flex-wrap", className)}>
      {wordTokens.map((token) => (
        <motion.span
          key={token.index}
          variants={pullupVariant}
          initial="initial"
          animate={isInView ? "animate" : ""}
          custom={token.index}
          className={cn("whitespace-nowrap inline-block pr-1.5 sm:pr-2 md:pr-3 lg:pr-4", token.className)}
        >
          {token.word === "" ? <span>&nbsp;</span> : token.word}
        </motion.span>
      ))}
    </div>
  );
}
