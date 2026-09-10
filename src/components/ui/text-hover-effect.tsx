"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type TextHoverEffectProps = {
  text: string;
  className?: string;
  duration?: number;
};

// Aceternity's SVG reveal mask, adapted to preserve the heading's typography
// and solid fill: https://ui.aceternity.com/components/text-hover-effect
export function TextHoverEffect({
  text,
  className,
  duration = 0.15,
}: TextHoverEffectProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement>(null);
  const baselineRef = useRef<HTMLSpanElement>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const id = useId().replaceAll(":", "");
  const gradientId = `${id}-gradient`;
  const revealId = `${id}-reveal`;
  const maskId = `${id}-mask`;

  useEffect(() => {
    const container = containerRef.current;
    const marker = baselineRef.current;
    if (!container || !marker) return;

    // SVG's central baseline doesn't align with HTML text. Measure the actual
    // baseline, including after font loading and responsive size changes.
    let active = true;
    const measure = () => {
      if (active) {
        setBaseline(
          marker.getBoundingClientRect().top - container.getBoundingClientRect().top,
        );
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    void document.fonts.ready.then(measure);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [text]);

  const updateCursor = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setMaskPosition({
      cx: `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
      cy: `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    });
    setHovered(true);
  };

  return (
    <span
      ref={containerRef}
      onPointerEnter={updateCursor}
      onPointerMove={updateCursor}
      onPointerLeave={() => setHovered(false)}
      onPointerCancel={() => setHovered(false)}
      className={cn(
        "relative inline-block cursor-default select-none whitespace-nowrap",
        className,
      )}
    >
      <span>{text}</span>
      <span ref={baselineRef} aria-hidden="true" className="inline-block h-0 w-0 align-baseline" />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="25%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <motion.radialGradient
            id={revealId}
            gradientUnits="userSpaceOnUse"
            r="20%"
            initial={{ cx: "50%", cy: "50%" }}
            animate={maskPosition}
            transition={{ duration: shouldReduceMotion ? 0 : duration, ease: "easeOut" }}
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </motion.radialGradient>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill={`url(#${revealId})`} />
          </mask>
        </defs>
        <text
          x="0"
          y={baseline ?? 0}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          mask={`url(#${maskId})`}
          opacity={hovered && baseline !== null ? 1 : 0}
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
