"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function SmoothCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Use a spring for smooth following, with a short delay
  const springConfig = { damping: 18, stiffness: 180, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - 12); // Center the cursor (24px/2)
      mouseY.set(e.clientY - 12);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x,
        y,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "rgba(42,42,42,0.9)",
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "difference",
      }}
      transition={{ type: "spring", duration: 0.12 }}
    />
  );
} 