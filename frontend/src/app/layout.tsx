import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Black-Scholes Interactive Dashboard",
  description:
    "Real-time Black-Scholes options pricing calculator with interactive parameter controls and dynamic heatmap visualizations",
  keywords: [
    "Black-Scholes",
    "options pricing",
    "financial calculator",
    "derivatives",
    "volatility",
    "Greeks",
  ],
  authors: [{ name: "Black-Scholes Dashboard" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1f2937",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}
