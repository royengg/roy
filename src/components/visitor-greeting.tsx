"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getVisitorGreeting, isVisitorGreeting, type VisitorGreeting } from "@/lib/visitor-greeting";

const INITIAL_GREETING = getVisitorGreeting(null);

export function VisitorGreeting() {
  const [visitorGreeting, setVisitorGreeting] = useState<VisitorGreeting>(INITIAL_GREETING);
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const lastPointerType = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/visitor-greeting", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: unknown) => {
        if (!controller.signal.aborted && isVisitorGreeting(value)) {
          setVisitorGreeting(value);
        }
      })
      .catch(() => {
        // Keep the neutral greeting if the edge location header is unavailable.
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isOpen]);

  return (
    <span className="visitor-greeting" ref={rootRef} data-greeting={visitorGreeting.key}>
      <button
        type="button"
        className="visitor-greeting-trigger"
        aria-describedby={isOpen ? tooltipId : undefined}
        onBlur={() => setIsOpen(false)}
        onClick={(event) => {
          // Pointer hover already reveals the tooltip. Click toggles it on
          // touch, while a keyboard click remains a reliable disclosure path.
          if (event.detail === 0 || lastPointerType.current !== "mouse") {
            setIsOpen((open) => !open);
          }
          lastPointerType.current = null;
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
          }
        }}
        onPointerDown={(event) => {
          lastPointerType.current = event.pointerType;
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setIsOpen(true);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && document.activeElement !== event.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        {visitorGreeting.greeting},{" "}
        I&apos;m
      </button>
      {isOpen ? (
        <span id={tooltipId} className="visitor-greeting-tooltip" role="tooltip">
          {visitorGreeting.message}
        </span>
      ) : null}
    </span>
  );
}
