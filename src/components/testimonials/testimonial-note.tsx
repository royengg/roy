"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PublicNote } from "@/lib/testimonials";

export function TestimonialNote({
  note,
  preview = false,
  compact = false,
}: {
  note: PublicNote;
  preview?: boolean;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      className={`testimonial-note${compact ? " note-compact" : ""}`}
      data-color={note.color}
      initial={false}
      animate={{ rotate: preview || reducedMotion ? 0 : note.rotation }}
      whileHover={reducedMotion || preview ? undefined : { rotate: 0, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <p className="note-message">{note.message}</p>
      <footer className="note-signature">
        <span>
          <strong>{note.name}</strong>
          {note.context && <small>{note.context}</small>}
        </span>
      </footer>
    </motion.article>
  );
}
