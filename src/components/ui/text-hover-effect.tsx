"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type TextHoverEffectProps = {
  text: string;
  className?: string;
  duration?: number;
};

const createRevealMask = (x: number, y: number) =>
  `radial-gradient(circle 5.5rem at ${x}% ${y}%, #000 0%, rgba(0, 0, 0, 0.92) 45%, transparent 100%)`;

export function TextHoverEffect({
  text,
  className,
  duration = 0.14,
}: TextHoverEffectProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const outlineRef = useRef<SVGSVGElement>(null);
  const gradientId = useId().replaceAll(":", "");

  useEffect(() => {
    const container = containerRef.current;
    const outline = outlineRef.current;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    if (!container || !outline) return;

    const initialMask = createRevealMask(50, 50);
    outline.style.setProperty("-webkit-mask-image", initialMask);
    outline.style.maskImage = initialMask;

    const updateMask = (event: MouseEvent) => {
      if (!finePointer.matches) return;

      const bounds = container.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      const revealMask = createRevealMask(x, y);

      outline.style.setProperty("-webkit-mask-image", revealMask);
      outline.style.maskImage = revealMask;
    };

    const handleEnter = (event: MouseEvent) => {
      if (!finePointer.matches) return;
      updateMask(event);
      setHovered(true);
    };

    const handleLeave = () => setHovered(false);
    const handlePointerChange = () => {
      if (!finePointer.matches) setHovered(false);
    };

    container.addEventListener("mouseenter", handleEnter);
    container.addEventListener("mousemove", updateMask);
    container.addEventListener("mouseleave", handleLeave);
    finePointer.addEventListener("change", handlePointerChange);

    return () => {
      container.removeEventListener("mouseenter", handleEnter);
      container.removeEventListener("mousemove", updateMask);
      container.removeEventListener("mouseleave", handleLeave);
      finePointer.removeEventListener("change", handlePointerChange);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      className={cn(
        "relative inline-block cursor-default select-none whitespace-nowrap",
        className,
      )}
    >
      <span>{text}</span>
      <svg
        ref={outlineRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: hovered ? 1 : 0,
          transitionProperty: "opacity",
          transitionDuration: shouldReduceMotion ? "0ms" : `${duration}s`,
          transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="25%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="50%"
          dominantBaseline="central"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          style={{
            fontFamily: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            letterSpacing: "inherit",
          }}
        >
          {text}
        </text>
      </svg>
    </span>
  );
}
