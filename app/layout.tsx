import type { Metadata } from "next";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import "./globals.css";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import LightRays from "@/components/LightRays";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted_grotesk",
  subsets: ["latin"],
});

const martinMono = Martian_Mono({
  variable: "--font-martin-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for Every Dev Event You Musn't Miss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} ${martinMono.variable} min-h-screen antialiased`}
      >
        <div className="absolute inset-0 to-0 z-[-1] min-h-screen">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#5dfeca"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays"
          />
        </div>

        {children}
      </body>
    </html>
  );
}
