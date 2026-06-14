"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Safely register plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  yOffset?: number | string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

export function ScrollReveal({ 
  children, 
  yOffset = 250, 
  start = "top bottom",
  end = "top 65%",
  scrub = 1.2, 
  ...props 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: yOffset },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: start,
            end: end,
            scrub: scrub,
          }
        }
      );
    });

    return () => ctx.revert();
  }, [yOffset, start, end, scrub]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
}
