"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";

export function AnimatedListItemPortfolio({ children }: { children: React.ReactNode }) {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 } as const,
  };

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  );
}

export interface AnimatedListPortfolioProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedListPortfolio = React.memo(
  ({ children, className, delay = 1000, ...props }: AnimatedListPortfolioProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children],
    );

    useEffect(() => {
      if (index < childrenArray.length - 1) {
        const timeout = setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
        }, delay);

        return () => clearTimeout(timeout);
      }
    }, [index, delay, childrenArray.length]);

    const itemsToShow = useMemo(() => {
      const result = childrenArray.slice(0, index + 1).reverse();
      return result;
    }, [index, childrenArray]);

    return (
      <div
        className={cn(`flex flex-col items-center gap-4`, className)}
        {...props}
      >
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItemPortfolio key={(item as React.ReactElement).key}>
              {item}
            </AnimatedListItemPortfolio>
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedListPortfolio.displayName = "AnimatedListPortfolio"; 