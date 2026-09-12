"use client";

import { useId } from "react";

export function HeroSignature() {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className="hero-signature"
      viewBox="955 510 220 42"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`${id}-ink`} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.25" intercept="-0.1" />
            <feFuncG type="linear" slope="1.25" intercept="-0.1" />
            <feFuncB type="linear" slope="1.25" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
        <mask
          id={`${id}-signature`}
          maskUnits="userSpaceOnUse"
          x="955"
          y="510"
          width="220"
          height="42"
          style={{ maskType: "luminance" }}
        >
          <image
            href="/og-image-v3.png"
            width="1200"
            height="630"
            filter={`url(#${id}-ink)`}
          />
        </mask>
      </defs>
      <rect
        x="955"
        y="510"
        width="220"
        height="42"
        fill="currentColor"
        mask={`url(#${id}-signature)`}
      />
    </svg>
  );
}
