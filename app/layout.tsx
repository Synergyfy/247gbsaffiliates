import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "247GBS - Affliate platform",
  description: "The unified platform for Merchants, Agents, and Consultants",
};

import Providers from "@/components/Providers";
import CookieBanner from "@/components/CookieBanner";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        className={`${outfit.variable} ${inter.variable} antialiased font-body bg-background-light text-text-main transition-colors duration-300`}
      >
        <Providers>
          {children}
          <CookieBanner />
          <ToastContainer position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
