"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";

export type ComposerProps = {
  position: { x: number; y: number };
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
};

export function TestimonialComposer({
  position,
  onClose,
  onBusyChange,
}: ComposerProps) {
  const reducedMotion = useReducedMotion();
  const didAutoFocus = useRef(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [promptLength, setPromptLength] = useState(0);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submissionKey] = useState(() => crypto.randomUUID());
  const prompt = "Write something…";

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setPromptLength((length) => {
        if (length >= prompt.length) clearInterval(timer);
        return Math.min(length + 1, prompt.length);
      });
    }, 65);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  async function submit() {
    if (submitting.current || sent) return;
    if (!message.trim()) {
      setError("Write something before sending.");
      textarea.current?.focus();
      return;
    }
    if (name.trim().length < 2) {
      setError("Add your name (at least 2 characters).");
      return;
    }
    submitting.current = true;
    onBusyChange(true);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          message,
          color: "YELLOW",
          ...position,
          submissionKey,
          website: honeypot.current?.value || "",
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not send. Try again.");
      setSent(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not send. Try again.",
      );
    } finally {
      submitting.current = false;
      onBusyChange(false);
      setBusy(false);
    }
  }

  return (
    <motion.div
      className="sticky-composer nopan nowheel"
      data-draggable={!busy && !sent}
      data-color="YELLOW"
      role="group"
      aria-label="Write a sticky note"
      initial={{
        opacity: 0,
        scale: reducedMotion ? 1 : 0.94,
        rotate: reducedMotion ? 0 : -2,
      }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.18 }}
      onAnimationComplete={() => {
        if (didAutoFocus.current) return;
        didAutoFocus.current = true;
        // Wait until the new paper is visible; never steal focus from someone
        // who has already tapped its name field or an action during the reveal.
        if (
          !textarea.current
            ?.closest(".sticky-composer")
            ?.contains(document.activeElement)
        ) {
          textarea.current?.focus({ preventScroll: true });
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) {
          event.stopPropagation();
          onClose();
        }
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          void submit();
        }
      }}
    >
      <div className="sticky-actions">
        <button
          className="nodrag"
          type="button"
          aria-label={sent ? "Dismiss pending note" : "Cancel note"}
          title="Close"
          disabled={busy}
          onClick={onClose}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={17} strokeWidth={1.5} />
        </button>
        {!sent && (
          <button
            className="nodrag"
            type="button"
            aria-label="Submit for approval"
            title="Submit for approval"
            disabled={busy}
            onClick={() => void submit()}
          >
            <HugeiconsIcon icon={Tick02Icon} size={19} strokeWidth={1.5} />
          </button>
        )}
      </div>
      {sent ? (
        <>
          <p className="sticky-sent-message">{message}</p>
          <p className="sticky-sent-name">— {name}</p>
          <p className="sticky-status" role="status">
            Waiting for approval
          </p>
        </>
      ) : (
        <>
          <textarea
            className="nodrag"
            ref={textarea}
            aria-label="Your note"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={280}
            disabled={busy}
            placeholder={reducedMotion ? prompt : prompt.slice(0, promptLength)}
          />
          <input
            className="sticky-name nodrag"
            aria-label="Your name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            disabled={busy}
            placeholder="— Your name"
          />
          <input
            ref={honeypot}
            className="note-honeypot"
            tabIndex={-1}
            autoComplete="off"
            name="website"
            aria-hidden="true"
          />
          {busy && (
            <p className="sticky-status" role="status">
              Sending…
            </p>
          )}
          {error && (
            <p className="sticky-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}
