"use client";

import Cal from "@calcom/embed-react";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const CAL_LINK = "rudraksh/30min";
const CAL_MODAL_CONFIG = {
  layout: "month_view",
  theme: "dark",
  iframeAttrs: {
    style: "display:block;width:100%;max-width:100%;min-width:0;border:0;overflow:hidden;",
  },
} as const;

type CalPopupButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  children: ReactNode;
};

export function CalPopupButton({ children, onClick, ...buttonProps }: CalPopupButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const embedRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const handleOutsidePointerDown = (event: PointerEvent) => {
      const embed = embedRef.current;
      if (embed && !embed.contains(event.target as Node)) setIsOpen(false);
    };
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleOutsidePointerDown, { capture: true });
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleOutsidePointerDown, { capture: true });
      trigger?.focus();
    };
  }, [isOpen]);

  const popup = isOpen ? (
    <div className="cal-popup" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        aria-label="Close booking popup"
        className="cal-popup-backdrop"
        onClick={() => setIsOpen(false)}
      />
      <button
        ref={closeRef}
        type="button"
        aria-label="Close booking popup"
        className="cal-popup-close"
        onClick={() => setIsOpen(false)}
      >
        <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.8} aria-hidden="true" />
      </button>
      <div ref={embedRef} className="cal-popup-embed" onClick={(event) => event.stopPropagation()}>
        <h2 id={titleId} className="sr-only">Book an intro call</h2>
        <Cal
          calLink={CAL_LINK}
          calOrigin="https://app.cal.com"
          config={CAL_MODAL_CONFIG}
          style={{ height: "100%", maxWidth: "100%", overflow: "hidden", width: "100%" }}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        {...buttonProps}
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) setIsOpen(true);
        }}
      >
        {children}
      </button>
      {popup ? createPortal(popup, document.body) : null}
    </>
  );
}
