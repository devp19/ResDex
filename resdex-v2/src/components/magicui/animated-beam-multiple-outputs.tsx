"use client";

import React, { useRef } from "react";
import { AnimatedBeam } from "./animated-beam";

export default function AnimatedBeamMultipleOutputDemo({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = [
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
    useRef<HTMLDivElement | null>(null),
  ];

  return (
    <div
      ref={containerRef}
      className={
        "relative flex h-full w-full items-center justify-center" +
        (className ? ` ${className}` : "")
      }
      style={{ minHeight: 200 }}
    >
      {/* Animated Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={nodeRefs[0]}
        toRef={nodeRefs[1]}
        curvature={60}
        gradientStartColor="#ffaa40"
        gradientStopColor="#9c40ff"
        pathColor="#ffaa40"
        pathWidth={3}
        pathOpacity={0.15}
        delay={0.2}
        duration={4}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={nodeRefs[1]}
        toRef={nodeRefs[2]}
        curvature={-60}
        gradientStartColor="#9c40ff"
        gradientStopColor="#ffaa40"
        pathColor="#9c40ff"
        pathWidth={3}
        pathOpacity={0.15}
        delay={0.5}
        duration={5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={nodeRefs[2]}
        toRef={nodeRefs[3]}
        curvature={40}
        gradientStartColor="#ffaa40"
        gradientStopColor="#9c40ff"
        pathColor="#ffaa40"
        pathWidth={3}
        pathOpacity={0.15}
        delay={0.8}
        duration={6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={nodeRefs[3]}
        toRef={nodeRefs[0]}
        curvature={-40}
        gradientStartColor="#9c40ff"
        gradientStopColor="#ffaa40"
        pathColor="#9c40ff"
        pathWidth={3}
        pathOpacity={0.15}
        delay={1.1}
        duration={7}
      />
      {/* Nodes */}
      {nodeRefs.map((ref, i) => (
        <div
          key={i}
          ref={ref}
          className="z-10 h-6 w-6 rounded-full bg-gradient-to-br from-[#ffaa40] to-[#9c40ff] shadow-lg border-2 border-white/80 dark:border-black/40"
          style={{ position: "absolute", left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%` }}
        />
      ))}
    </div>
  );
} 