"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: React.ReactNode;
  strength?: number;
  maxDistance?: number;
  className?: string;
  feedbackColor?: string;
  showFeedback?: boolean;
};

export function MagneticButton({
  children,
  strength = 0.8,
  maxDistance = 100,
  className,
  feedbackColor = "var(--color-accent-solid)",
  showFeedback = true,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || shouldReduceMotion) return;

    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const { clientX, clientY } = event;

    let x = (clientX - (left + width / 2)) * strength;
    let y = (clientY - (top + height / 2)) * strength;

    const distance = Math.hypot(x, y);
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      x *= scale;
      y *= scale;
    }

    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
  const hasMoved =
    !shouldReduceMotion && (position.x !== 0 || position.y !== 0);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "inline-flex w-fit cursor-pointer transition-[background-color,outline-color] duration-150",
        className,
      )}
      style={{
        backgroundColor:
          showFeedback && hasMoved
            ? `color-mix(in srgb, ${feedbackColor} 12%, transparent)`
            : "transparent",
        outline: showFeedback ? "1px dashed transparent" : undefined,
        outlineColor: showFeedback && hasMoved ? feedbackColor : "transparent",
        outlineOffset: showFeedback ? "2px" : undefined,
      }}
    >
      <motion.div
        ref={ref}
        className="inline-flex"
        animate={shouldReduceMotion ? { x: 0, y: 0 } : position}
        transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
