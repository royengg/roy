"use client";

import { CalPopupButton } from "@/components/cal-popup-button";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function CalBookingButton() {
  return (
    <MagneticButton className="rounded-full" showFeedback={false}>
      <CalPopupButton className="book-call-link">
        <span className="book-call-shine" aria-hidden="true" />
        <span className="book-call-label">Book a Call</span>
      </CalPopupButton>
    </MagneticButton>
  );
}
