"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}

export default function WordsPullUp({ text, className, showAsterisk }: WordsPullUpProps) {
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

  const words = text.split(" ");
  
  return (
    <div ref={container} className="inline-flex flex-wrap">
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={pullupVariant}
          initial="initial"
          animate={isInView ? "animate" : ""}
          custom={i}
          className={cn("whitespace-nowrap relative inline-block pr-2 sm:pr-3 md:pr-4", className)}
        >
          {word === "" ? <span>&nbsp;</span> : word}
          {showAsterisk && i === words.length - 1 && word.includes("a") && (
            <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">
              *
            </span>
          )}
        </motion.span>
      ))}
    </div>
  );
}
