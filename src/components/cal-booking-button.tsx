"use client";

import { CalPopupButton } from "@/components/cal-popup-button";

export function CalBookingButton() {
  return (
    <CalPopupButton className="book-call-link">
      <span className="book-call-shine" aria-hidden="true" />
      <span className="book-call-label">Book a Call</span>
    </CalPopupButton>
  );
}
