"use client";

import React from "react";

import { MagneticButton } from "@/components/ui/magnetic-button";

export default function MagneticButtonDemo() {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <div className="flex h-[40rem] w-full items-center justify-center">
      <MagneticButton className="rounded-full">
        <button
          onClick={handleClick}
          className="cursor-pointer rounded-full bg-linear-to-b from-[#2b2a27] to-[#0d0d0c] px-4 py-2 font-medium text-[#fbf8f1] ring-1 ring-white/20 ring-offset-1 ring-offset-[#181715] ring-inset transition-transform duration-150 active:scale-96"
        >
          Follow @mannupaaji
        </button>
      </MagneticButton>
    </div>
  );
}
