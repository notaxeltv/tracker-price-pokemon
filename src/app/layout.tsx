import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pokémon Price Tracker — Sealed & Graded",
  description:
    "Dashboard per monitorare i prezzi di prodotti sealed e carte gradate Pokémon TCG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
