"use client";

import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import { ComponentPropsWithoutRef, FC, ReactNode, useRef, useMemo } from "react";

import { cn } from "@/lib/utils";

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string;
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string");
  }

  const words = children.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]"
        }
      >
        <span
          ref={targetRef}
          className={
            "flex flex-wrap p-5 text-2xl font-bold text-black/20 dark:text-white/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-1.5">
      <span className="absolute opacity-30">{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={"text-black dark:text-white"}
      >
        {children}
      </motion.span>
    </span>
  );
};

// New: TextRevealWithVerticalSlot
interface TextRevealWithVerticalSlotProps extends Omit<TextRevealProps, "children"> {
  children: string; // e.g. 'Finding research __BLANK__ is hard. We know. So we made it easier.'
  slotWords: string[];
}

export const TextRevealWithVerticalSlot: FC<TextRevealWithVerticalSlotProps> = ({
  children,
  className,
  slotWords,
  ...props
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  // Split sentence into words, find blank index
  const words = useMemo(() => children.split(" "), [children]);
  const blankIndex = words.findIndex((w) => w === "__BLANK__");

  // --- Proportional scroll mapping ---
  // Each normal word = 1 unit, blank = slotWords.length * 4 units
  const blankUnits = slotWords.length * 4;
  const virtualUnits = words.length - 1 + blankUnits; // -1 because blank replaces 1 word

  // Compute the start and end (as a fraction of scroll) for each word
  let currentUnit = 0;
  const wordRanges = words.map((word, i) => {
    if (i === blankIndex) {
      const start = currentUnit / virtualUnits;
      const end = (currentUnit + blankUnits) / virtualUnits;
      currentUnit += blankUnits;
      return [start, end];
    } else {
      const start = currentUnit / virtualUnits;
      const end = (currentUnit + 1) / virtualUnits;
      currentUnit += 1;
      return [start, end];
    }
  });

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div className={"sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-[1rem] py-[5rem]"}>
        <span
          ref={targetRef}
          className={"flex flex-wrap p-5 text-2xl font-bold text-black/20 dark:text-white/20 md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"}
        >
          {words.map((word, i) => {
            const [start, end] = wordRanges[i];
            if (i === blankIndex) {
              return (
                <VerticalScrollWordSlot
                  key={i}
                  progress={scrollYProgress}
                  range={[start, end]}
                  words={slotWords}
                />
              );
            }
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
};

// Helper: vertical scroll slot for the blank
const VerticalScrollWordSlot: FC<{ progress: MotionValue<number>; range: [number, number]; words: string[] }> = ({ progress, range, words }) => {
  // Map scroll progress in range to index in words
  const slotProgress = useTransform(progress, range, [0, 1]);
  // Clamp slotProgress to [0, 1]
  const clampedSlotProgress = useTransform(slotProgress, (p) => Math.max(0, Math.min(1, p)));
  const wordCount = words.length;
  // Clamp y so it never scrolls past the last word
  const maxY = -(wordCount - 1) * 1.1;
  const y = useTransform(clampedSlotProgress, (p) => {
    // Clamp y so it never goes below the last word
    const minY = -(wordCount - 1) * 1.1;
    const rawY = -p * (wordCount - 1) * 1.1;
    return rawY < minY ? minY + "em" : rawY + "em";
  });
  return (
    <span className="relative inline-block min-w-[110px] mx-1 align-middle h-[1.1em] overflow-hidden" style={{ verticalAlign: "middle" }}>
      <motion.span style={{ display: "inline-block", y }}>
        {words.map((w, idx) => (
          <span
            key={w}
            style={{ display: "block", height: "1.1em" }}
            className={"text-primary font-semibold italic"}
          >
            {w}
          </span>
        ))}
      </motion.span>
    </span>
  );
};
