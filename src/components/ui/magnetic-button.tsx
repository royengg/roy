"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const ORIGIN = { x: 0, y: 0 };

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
  const [canUseMagnet, setCanUseMagnet] = useState(false);
  const [position, setPosition] = useState(ORIGIN);
  const [resetGeneration, setResetGeneration] = useState(0);

  const resetPosition = useCallback(() => {
    setPosition((current) =>
      current.x === ORIGIN.x && current.y === ORIGIN.y ? current : ORIGIN,
    );
  }, []);

  const clearPositionImmediately = useCallback(() => {
    if (ref.current) ref.current.style.transform = "none";
    setPosition((current) =>
      current.x === ORIGIN.x && current.y === ORIGIN.y ? current : ORIGIN,
    );
    setResetGeneration((generation) => generation + 1);
  }, []);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncPointerCapability = () => {
      setCanUseMagnet(pointerQuery.matches);
      if (!pointerQuery.matches) clearPositionImmediately();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") clearPositionImmediately();
    };

    syncPointerCapability();
    pointerQuery.addEventListener("change", syncPointerCapability);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", clearPositionImmediately);
    window.addEventListener("pagehide", clearPositionImmediately);
    window.addEventListener("pageshow", clearPositionImmediately);

    return () => {
      pointerQuery.removeEventListener("change", syncPointerCapability);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", clearPositionImmediately);
      window.removeEventListener("pagehide", clearPositionImmediately);
      window.removeEventListener("pageshow", clearPositionImmediately);
    };
  }, [clearPositionImmediately]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      !ref.current ||
      !canUseMagnet ||
      shouldReduceMotion ||
      event.pointerType !== "mouse"
    ) {
      clearPositionImmediately();
      return;
    }

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

  const magneticEnabled = canUseMagnet && !shouldReduceMotion;
  const hasMoved =
    magneticEnabled && (position.x !== 0 || position.y !== 0);

  return (
    <div
      onClickCapture={resetPosition}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={clearPositionImmediately}
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
        key={resetGeneration}
        ref={ref}
        className="inline-flex"
        animate={magneticEnabled ? position : ORIGIN}
        transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
