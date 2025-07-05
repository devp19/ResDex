"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  const [activeValue, setActiveValue] = useState(propTabs[0].value);
  const activeTab = propTabs.find(tab => tab.value === activeValue) || propTabs[0];

  const [hovering, setHovering] = useState<number | false>(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full bg-[#F3F4F6] dark:bg-[rgba(24,24,27,0.92)] rounded-full px-4 py-2",
          containerClassName
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => setActiveValue(tab.value)}
            onMouseEnter={() => setHovering(idx)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative px-4 py-2 rounded-full", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Hover pill, only show if not active */}
            {hovering === idx && activeValue !== tab.value && (
              <motion.div
                layoutId="hoveredbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                className="absolute inset-0 bg-[#D1D5DB] dark:bg-neutral-800 rounded-full z-0"
              />
            )}
            {activeValue === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "absolute inset-0 bg-[#D1D5DB] dark:bg-neutral-700 rounded-full ",
                  activeTabClassName
                )}
              />
            )}

            <span className="relative block text-black dark:text-white z-10">
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <div className={cn("mt-4 w-full rounded-xl p-4 min-h-[300px] relative", contentClassName)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab.value}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {activeTab.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}; 