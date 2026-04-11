"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

function AnimatedLetter({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

export default function AnimatedParagraph({ text, className }: { text: string; className?: string }) {
  const container = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = text.split("");

  return (
    <div ref={container} className={className}>
      {chars.map((char, index) => {
        const charProgress = index / chars.length;
        const range: [number, number] = [charProgress - 0.1, charProgress + 0.05];
        return (
          <AnimatedLetter key={index} progress={scrollYProgress} range={range}>
            {char}
          </AnimatedLetter>
        );
      })}
    </div>
  );
}
