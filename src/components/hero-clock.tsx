"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const ist = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// Rolling-clock treatment inspired by https://github.com/Dey11/pf.
export function HeroClock() {
  const [now, setNow] = useState<Date | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => {
      if (!document.hidden) setNow(new Date());
    };
    const frame = requestAnimationFrame(update);
    const interval = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const time = now ? ist.format(now) : "00:00:00";
  return (
    <time
      className="hero-clock"
      dateTime={now?.toISOString()}
      aria-label={now ? `${time} Indian Standard Time` : "Indian Standard Time"}
    >
      <span className="hero-clock-digits" aria-hidden="true">
        {time.split("").map((digit, index) => (
          <span
            className={digit === ":" ? "hero-clock-colon" : "hero-clock-slot"}
            key={index}
          >
            {digit === ":" || reducedMotion ? (
              digit
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={digit}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
        ))}
      </span>
      <span className="hero-clock-zone" aria-hidden="true">
        IST
      </span>
    </time>
  );
}
