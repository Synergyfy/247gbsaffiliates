import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased font-body bg-background-light text-text-main transition-colors duration-300"
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
