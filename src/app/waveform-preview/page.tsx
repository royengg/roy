import type { Metadata } from "next";
import Portfolio from "@/components/portfolio";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function WaveformPreviewPage() {
  return (
    <>
      <style>{"html { scroll-behavior: auto !important; }"}</style>
      <Portfolio isWaveformPreview />
    </>
  );
}
