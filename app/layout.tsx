import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google"; // Added Manrope
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artisans - Professional Service Platform",
  description: "Connect with elite artisans and master craftsmen for your home projects.",
};

import Providers from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.className} antialiased font-display bg-white text-text-main transition-colors duration-300`}
      >
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
