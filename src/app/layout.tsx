import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { DevelopmentTools } from "@/components/development-tools";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://roydev.in"),
  title: "Rudraksh Roy",
  description:
    "product engineer.",
  openGraph: {
    type: "website",
    url: "https://roydev.in",
    siteName: "Rudraksh Roy",
    title: "Rudraksh Roy",
    description: "product engineer.",
    images: [
      {
        url: "/og-image-v2.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Hey, I'm Rudraksh Roy — Product Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudraksh Roy",
    description: "product engineer.",
    images: ["/og-image-v2.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased dark`}
    >
      <body>
        <ThemeProvider>
          {children}
          {process.env.NODE_ENV === "development" && <DevelopmentTools />}
        </ThemeProvider>
      </body>
    </html>
  );
}
