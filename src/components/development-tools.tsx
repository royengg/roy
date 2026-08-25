"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Agentation = dynamic(
  () => import("agentation").then((module) => module.Agentation),
  { ssr: false },
);

export function DevelopmentTools() {
  const pathname = usePathname();

  if (pathname === "/waveform-preview") return null;

  return <Agentation />;
}
