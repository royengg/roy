import type { Metadata } from "next";
import { TestimonialAdmin } from "@/components/testimonials/testimonial-admin";

export const metadata: Metadata = {
  title: "Review notes · Rudraksh Roy",
  robots: { index: false, follow: false },
};

export default function ReviewNotesPage() {
  return <TestimonialAdmin />;
}
