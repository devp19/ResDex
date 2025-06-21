import { useEffect } from "react";

/**
 * Custom hook for handling scroll animations and fade-in effects
 * This hook sets up:
 * 1. Scroller animations for marquee effects
 * 2. Intersection Observer for fade-in animations
 */
const useAnimationEffect = () => {
  useEffect(() => {
    // Animate scrolling marquee
    const scrollers = document.querySelectorAll(".scroller");
    scrollers.forEach((scroller) => {
      if (scroller.getAttribute("data-animated")) return;

      scroller.setAttribute("data-animated", true);
      const scrollerInner = scroller.querySelector(".scroller__inner");
      const scrollerContent = Array.from(scrollerInner.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute("aria-hidden", true);
        scrollerInner.appendChild(duplicatedItem);
      });
    });

    // Fade-in on scroll using IntersectionObserver
    const fadeIns = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
      }
    );

    fadeIns.forEach((el) => observer.observe(el));

    // Cleanup function
    return () => {
      fadeIns.forEach((el) => observer.unobserve(el));
    };
  }, []);
};

export default useAnimationEffect;
